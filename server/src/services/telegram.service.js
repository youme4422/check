import { env } from '../config/env.js';

export async function sendTelegramMessage({ chatId, text }) {
  if (!env.telegramBotToken) {
    throw new Error('Telegram bot token is missing.');
  }

  const endpoint = `https://api.telegram.org/bot${env.telegramBotToken}/sendMessage`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Telegram send failed: ${detail || response.status}`);
  }

  return { channel: 'telegram' };
}
