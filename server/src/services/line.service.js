import { env } from '../config/env.js';

async function linePost(path, body) {
  if (!env.lineChannelAccessToken) {
    throw new Error('LINE channel access token is missing.');
  }

  const response = await fetch(`https://api.line.me/v2/bot/message/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.lineChannelAccessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`LINE send failed: ${detail || response.status}`);
  }
}

export async function sendLineMessage({ to, text }) {
  await linePost('push', {
    to,
    messages: [
      {
        type: 'text',
        text,
      },
    ],
  });

  return { channel: 'line' };
}

export async function replyLineMessage({ replyToken, text }) {
  if (!replyToken) {
    throw new Error('LINE reply token is missing.');
  }

  await linePost('reply', {
    replyToken,
    messages: [
      {
        type: 'text',
        text,
      },
    ],
  });

  return { channel: 'line' };
}
