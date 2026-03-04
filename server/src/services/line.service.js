import { env } from '../config/env.js';

export async function sendLineMessage({ to, text }) {
  if (!env.lineChannelAccessToken) {
    throw new Error('LINE channel access token is missing.');
  }

  const response = await fetch('https://api.line.me/v2/bot/message/push', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.lineChannelAccessToken}`,
    },
    body: JSON.stringify({
      to,
      messages: [
        {
          type: 'text',
          text,
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`LINE send failed: ${detail || response.status}`);
  }

  return { channel: 'line' };
}
