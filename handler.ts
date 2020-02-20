import { APIGatewayProxyHandler } from 'aws-lambda';
import Telegraf from 'telegraf';
import { Update } from 'telegram-typings';

const bot = new Telegraf(process.env.BOT_TOKEN, {
  telegram: {
    webhookReply: false,
  },
});

export const handleUpdate: APIGatewayProxyHandler = async (event, _context) => {
  const update = JSON.parse(event.body) as Update;
  await bot.handleUpdate(update);

  return {
    statusCode: 200,
    body: 'RekognizerBot by Emilio Schepis (@emilioschepis)',
  };
};
