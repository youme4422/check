import { env } from '../config/env.js';

async function telegramPost(method, body) {
  if (!env.telegramBotToken) {
    throw new Error('Telegram bot token is missing.');
  }

  const endpoint = `https://api.telegram.org/bot${env.telegramBotToken}/${method}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Telegram send failed: ${detail || response.status}`);
  }
}

export async function sendTelegramMessage({ chatId, text }) {
  await telegramPost('sendMessage', {
    chat_id: chatId,
    text,
  });

  return { channel: 'telegram' };
}

export async function replyTelegramMessage({ chatId, text }) {
  if (!chatId) {
    throw new Error('Telegram chat id is missing.');
  }

  await telegramPost('sendMessage', {
    chat_id: chatId,
    text,
  });

  return { channel: 'telegram' };
}
