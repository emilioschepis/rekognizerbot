# RekognizerBot

[![Telegram](https://img.shields.io/badge/Telegram-RekognizerBot-0088cc.svg)](https://t.me/rekognizerbot)

**Rekognizer** is a Telegram bot that scans photos in order to extract information such as text, URLs and social media 
handles.

The extraction is done through AWS Rekognition.

The bot is written in TypeScript and the extraction functions are unit tested through Jest.

The various resources are created and maintained through the Serverless Framework.

## External dependencies
- [AWS Rekognition](https://aws.amazon.com/rekognition/)
- [Telegram API](https://core.telegram.org/bots/api)
- [Serverless Framework](https://serverless.com)
- [Telegraf](https://github.com/telegraf/telegraf)
