import { APIGatewayProxyHandler } from 'aws-lambda';
import axios, { AxiosRequestConfig } from 'axios';
import Telegraf, { ContextMessageUpdate } from 'telegraf';
import { Message, PhotoSize, Update } from 'telegram-typings';
import { Rekognition } from '@aws-sdk/client-rekognition-node';

const client = new Rekognition({ region: 'eu-west-1' });
const bot = new Telegraf(process.env.BOT_TOKEN, {
  telegram: {
    webhookReply: false,
  },
});

/**
 * Parses the results of a RegExp matching.
 * Each result is flattened, normalized and deduplicated.
 *
 * @param results - The RegExp results to parse.
 * @returns the parsed data.
 */
const parseResults = (results: RegExpMatchArray[]): string[] => {
  // Flatten them to a single array of strings
  const flattened: string[] = [].concat(...results);

  // Filter only the existing ones
  const filtered = flattened.filter(i => i);

  // Make them lower case and trim whitespace
  const lowerCased = filtered.map(i => i.toLocaleLowerCase().trim());

  // Remove duplicates
  return Array.from(new Set(lowerCased));
};

/**
 * Extracts valid handles from an array of strings.
 *
 * @param input - The lines of text to analyze.
 * @returns the handles contained in the lines.
 */
export const extractHandles = (input: string[]): string[] => {
  const expression = /(?:\s+|^)(@[a-zA-Z_][a-zA-Z0-9_]*)(?:\s+|$)/gi;
  const regex = new RegExp(expression);

  // Get all matches in the input strings
  const matches = input.map(i => i.match(regex));

  return parseResults(matches);
};

/**
 * Extracts valid URLs from an array of strings.
 *
 * @param input - The lines of text to analyze.
 * @returns the urls contained in the lines.
 */
export const extractUrls = (input: string[]): string[] => {
  const expression = /(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&\/=]*))/gi;
  const regex = new RegExp(expression);

  const matches = input.map(i => i.match(regex));

  return parseResults(matches);
};

/**
 * Creates a formatted reply to be sent.
 *
 * @param results - The text detection results.
 * @returns the formatted reply to be sent.
 */
export const createReply = (results: string[]): string => {
  if (results.length <= 0) {
    return `I could not find any text in the photo.`;
  }

  const urls = extractUrls(results).map(u => `- ${u}`);
  const handles = extractHandles(results).map(h => `- ${h}`);

  let reply = `Here's what I found:\n`
    .concat(`~~~~~~~~~~\n`)
    .concat(results.join('\n'))
    .concat(`\n~~~~~~~~~~`);

  if (urls.length > 0) {
    reply = reply.concat(`\n\n`, `URLs:\n`, urls.join('\n'));
  }

  if (handles.length > 0) {
    reply = reply.concat(`\n\n`, `Handles:\n`, handles.join('\n'));
  }

  return reply;
};

/**
 * Detects text in a buffer.
 * The detection is done through a Rekognition client.
 *
 * @param buffer - The buffer to analyze.
 * @param minimumConfidence - The minimum confidence in percentage.
 * @returns the lines of text detected in the buffer.
 */
const detectText = async (buffer: Buffer, minimumConfidence = 66): Promise<string[]> => {
  const output = await client.detectText({
    Image: {
      Bytes: buffer,
    },
  });

  const filteredOutput = output.TextDetections.filter(td => td.Confidence >= minimumConfidence);
  const lines = filteredOutput.filter(o => o.Type === 'LINE');

  return lines.map(l => l.DetectedText);
};

/**
 * Downloads the photo and encodes it to base64.
 *
 * @param photo - The photo to download.
 * @returns a base64-encoded buffer of the photo's bytes.
 */
const downloadPhoto = async (photo: PhotoSize): Promise<Buffer> => {
  const fileId = photo.file_id;
  const fileLink = await bot.telegram.getFileLink(fileId);

  const config: AxiosRequestConfig = { responseType: 'arraybuffer' };
  const data = await axios.get(fileLink, config).then(({ data }) => data);
  return Buffer.from(data, 'base64');
};

/**
 * Handles the photo received in the incoming message.
 *
 * @param context - The Telegram bot context.
 * @returns the message to send back to the user.
 */
const handlePhoto = async (context: ContextMessageUpdate): Promise<Message> => {
  const photos = context.message.photo;
  const photo = photos.pop();

  try {
    const buffer = await downloadPhoto(photo);
    const results = await detectText(buffer);
    const reply = createReply(results);

    return context.reply(reply);
  } catch (error) {
    return context.reply(`There was a problem with your request.`);
  }
};

const handleStart = async (context: ContextMessageUpdate): Promise<Message> => {
  const reply = `Hi! I'm the Rekognizer bot.\n` + `Send me a screenshot to analyze and I will parse URLs and handles.`;

  return context.reply(reply);
};

const handleAbout = async (context: ContextMessageUpdate): Promise<Message> => {
  const reply =
    `This bot was created by [Emilio Schepis](https://emilioschepis.com/).\n` +
    `The source code can be found [on GitHub](https://github.com/emilioschepis/rekognizerbot).`;

  return context.replyWithMarkdown(reply);
};

bot.on('photo', handlePhoto);
bot.command('start', handleStart);
bot.command('about', handleAbout);

export const handleUpdate: APIGatewayProxyHandler = async event => {
  const update = JSON.parse(event.body) as Update;
  await bot.handleUpdate(update);

  return {
    statusCode: 200,
    body: 'RekognizerBot by Emilio Schepis (@emilioschepis)',
  };
};
