import { env } from '../config/env.js';
import { getMessengerLinks } from '../store/userStore.js';
import { logDispatchEvent } from '../utils/logger.js';
import { sendEmailMessage } from './email.service.js';
import { sendLineMessage } from './line.service.js';
import { sendTelegramMessage } from './telegram.service.js';

const lastSentAtByUser = new Map();
const monthlyUsageByChannel = new Map();

function getMonthKey(timestampMs) {
  const d = new Date(timestampMs);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function getNextMonthTimestamp(timestampMs) {
  const d = new Date(timestampMs);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1, 0, 0, 0, 0);
}

function getConfiguredFreeLimitByChannel(channel) {
  if (channel === 'telegram') {
    return env.freeLimitTelegramPerMonth;
  }
  if (channel === 'line') {
    return env.freeLimitLinePerMonth;
  }
  if (channel === 'email') {
    return env.freeLimitEmailPerMonth;
  }
  return 0;
}

function getEffectiveMonthlyLimit(channel) {
  const freeLimit = getConfiguredFreeLimitByChannel(channel);
  if (freeLimit <= 0) {
    // 0 means "no quota cap" for channels with no practical free-tier ceiling.
    return null;
  }
  return Math.max(0, freeLimit - env.safetyMarginMessages);
}

function getMonthlyUsage(channel, timestampMs) {
  const monthKey = getMonthKey(timestampMs);
  return monthlyUsageByChannel.get(`${channel}:${monthKey}`) || 0;
}

function increaseMonthlyUsage(channel, timestampMs) {
  const monthKey = getMonthKey(timestampMs);
  const key = `${channel}:${monthKey}`;
  const current = monthlyUsageByChannel.get(key) || 0;
  monthlyUsageByChannel.set(key, current + 1);
}

function getChannelQuotaState(channel, timestampMs) {
  const limit = getEffectiveMonthlyLimit(channel);
  const used = getMonthlyUsage(channel, timestampMs);
  const hasLimit = typeof limit === 'number';
  const remaining = hasLimit ? Math.max(0, limit - used) : null;
  const nextResetAt = getNextMonthTimestamp(timestampMs);
  return {
    hasLimit,
    limit,
    used,
    remaining,
    nextResetAt,
    blocked: hasLimit ? used >= limit : false,
  };
}

function normalizeRequestedChannels(channel, channels) {
  if (Array.isArray(channels) && channels.length > 0) {
    return [...new Set(channels)];
  }

  if (channel === 'line' || channel === 'telegram' || channel === 'email') {
    return [channel];
  }

  // Default safe behavior for omitted channel from older clients.
  return ['telegram'];
}

export async function dispatchMessage({ userId, channel, channels, text }) {
  const cooldownMs = env.messageCooldownMinutes * 60 * 1000;
  const now = Date.now();
  const lastSentAt = lastSentAtByUser.get(userId);
  const requestedChannels = normalizeRequestedChannels(channel, channels);
  const channelLabel = requestedChannels.join('+');

  if (cooldownMs > 0 && typeof lastSentAt === 'number') {
    const elapsedMs = now - lastSentAt;
    if (elapsedMs < cooldownMs) {
      const retryAfter = Math.ceil((cooldownMs - elapsedMs) / 1000);
      logDispatchEvent({ userId, channel: channelLabel, status: 'rate_limited', retryAfter });
      return {
        status: 'rate_limited',
        deliveredChannels: [],
        retryAfter,
      };
    }
  }

  const links = getMessengerLinks(userId);
  if (!links) {
    throw new Error('No linked recipients were found for this user.');
  }

  const deliveredChannels = [];
  const blockedChannels = [];

  const lineQuota = getChannelQuotaState('line', now);
  if (requestedChannels.includes('line') && lineQuota.blocked) {
    blockedChannels.push({
      channel: 'line',
      reason: 'monthly_quota_exceeded',
      limit: lineQuota.limit,
      used: lineQuota.used,
      remaining: lineQuota.remaining,
      resetAt: lineQuota.nextResetAt,
    });
  }

  if (requestedChannels.includes('line') && !lineQuota.blocked) {
    if (!links.lineUserId) {
      throw new Error('The user has no linked LINE user ID.');
    }
    await sendLineMessage({
      to: links.lineUserId,
      text,
    });
    increaseMonthlyUsage('line', now);
    deliveredChannels.push('line');
  }

  const telegramQuota = getChannelQuotaState('telegram', now);
  if (requestedChannels.includes('telegram') && telegramQuota.blocked) {
    blockedChannels.push({
      channel: 'telegram',
      reason: 'monthly_quota_exceeded',
      limit: telegramQuota.limit,
      used: telegramQuota.used,
      remaining: telegramQuota.remaining,
      resetAt: telegramQuota.nextResetAt,
    });
  }

  if (requestedChannels.includes('telegram') && !telegramQuota.blocked) {
    if (!links.telegramChatId) {
      throw new Error('The user has no linked Telegram chat ID.');
    }
    await sendTelegramMessage({
      chatId: links.telegramChatId,
      text,
    });
    increaseMonthlyUsage('telegram', now);
    deliveredChannels.push('telegram');
  }

  const emailQuota = getChannelQuotaState('email', now);
  if (requestedChannels.includes('email') && emailQuota.blocked) {
    blockedChannels.push({
      channel: 'email',
      reason: 'monthly_quota_exceeded',
      limit: emailQuota.limit,
      used: emailQuota.used,
      remaining: emailQuota.remaining,
      resetAt: emailQuota.nextResetAt,
    });
  }

  if (requestedChannels.includes('email') && !emailQuota.blocked) {
    if (!links.email) {
      throw new Error('The user has no linked email.');
    }
    await sendEmailMessage({
      to: links.email,
      text,
    });
    increaseMonthlyUsage('email', now);
    deliveredChannels.push('email');
  }

  if (deliveredChannels.length === 0 && blockedChannels.length > 0) {
    const nextRetry = Math.max(...blockedChannels.map((item) => item.resetAt));
    const retryAfter = Math.max(1, Math.ceil((nextRetry - now) / 1000));
    logDispatchEvent({ userId, channel: channelLabel, status: 'quota_limited', retryAfter });
    return {
      status: 'quota_limited',
      deliveredChannels,
      blockedChannels,
      retryAfter,
    };
  }

  lastSentAtByUser.set(userId, now);
  logDispatchEvent({
    userId,
    channel: channelLabel,
    status: blockedChannels.length > 0 ? 'sent_partial' : 'sent',
  });

  return {
    status: blockedChannels.length > 0 ? 'sent_partial' : 'sent',
    deliveredChannels,
    blockedChannels,
  };
}
