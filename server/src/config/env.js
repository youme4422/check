import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT || 4000),
  lineChannelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
};
