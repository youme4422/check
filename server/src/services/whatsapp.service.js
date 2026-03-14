import { env } from '../config/env.js';

export async function sendWhatsAppMessage({ to, text }) {
  if (!env.whatsappToken || !env.whatsappPhoneNumberId) {
    throw new Error('WhatsApp Cloud API settings are missing.');
  }

  const base = env.whatsappApiBase.replace(/\/$/, '');
  const endpoint = `${base}/${env.whatsappPhoneNumberId}/messages`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.whatsappToken}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: {
        body: text,
      },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`WhatsApp send failed: ${detail || response.status}`);
  }

  return { channel: 'whatsapp' };
}
