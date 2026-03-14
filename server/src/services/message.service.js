import { env } from '../config/env.js';
import { getMessengerLinks } from '../store/userStore.js';
import { sendEmailMessage } from './email.service.js';
import { sendLineMessage } from './line.service.js';
import { sendTelegramMessage } from './telegram.service.js';
import { sendWhatsAppMessage } from './whatsapp.service.js';

const lastSentAtByUser = new Map();

function normalizeRequestedChannels(channel, channels) {
  if (Array.isArray(channels) && channels.length > 0) {
    return [...new Set(channels)];
  }

  if (channel === 'both') {
    return ['line', 'telegram'];
  }

  if (channel === 'telegram_email') {
    return ['telegram', 'email'];
  }

  if (channel === 'line_whatsapp') {
    return ['line', 'whatsapp'];
  }

  return channel ? [channel] : [];
}

export async function dispatchMessage({ userId, channel, channels, text }) {
  const cooldownMs = env.messageCooldownMinutes * 60 * 1000;
  const now = Date.now();
  const lastSentAt = lastSentAtByUser.get(userId);

  if (cooldownMs > 0 && typeof lastSentAt === 'number') {
    const elapsedMs = now - lastSentAt;
    if (elapsedMs < cooldownMs) {
      return {
        status: 'rate_limited',
        deliveredChannels: [],
        retryAfterSeconds: Math.ceil((cooldownMs - elapsedMs) / 1000),
      };
    }
  }

  const links = getMessengerLinks(userId);
  const requestedChannels = normalizeRequestedChannels(channel, channels);

  if (!links) {
    throw new Error('No linked messenger IDs were found for this user.');
  }

  if (requestedChannels.length === 0) {
    throw new Error('No channels were requested.');
  }

  const tasks = [];
  const deliveredChannels = [];

  if (requestedChannels.includes('line')) {
    if (!links.lineUserId) {
      throw new Error('The user has no linked LINE ID.');
    }

    tasks.push(
      sendLineMessage({
        to: links.lineUserId,
        text,
      }).then(() => {
        deliveredChannels.push('line');
      })
    );
  }

  if (requestedChannels.includes('telegram')) {
    if (!links.telegramChatId) {
      throw new Error('The user has no linked Telegram chat ID.');
    }

    tasks.push(
      sendTelegramMessage({
        chatId: links.telegramChatId,
        text,
      }).then(() => {
        deliveredChannels.push('telegram');
      })
    );
  }

  if (requestedChannels.includes('email')) {
    if (!links.email) {
      throw new Error('The user has no linked email.');
    }

    tasks.push(
      sendEmailMessage({
        to: links.email,
        text,
      }).then(() => {
        deliveredChannels.push('email');
      })
    );
  }

  if (requestedChannels.includes('whatsapp')) {
    if (!links.whatsappTo) {
      throw new Error('The user has no linked WhatsApp number.');
    }

    tasks.push(
      sendWhatsAppMessage({
        to: links.whatsappTo,
        text,
      }).then(() => {
        deliveredChannels.push('whatsapp');
      })
    );
  }

  await Promise.all(tasks);
  lastSentAtByUser.set(userId, now);

  return {
    status: 'sent',
    deliveredChannels,
  };
}
