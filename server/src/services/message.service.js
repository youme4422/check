import { env } from '../config/env.js';
import { dbQuery, isDatabaseEnabled } from '../db/client.js';
import { getMessengerLinks } from '../store/userStore.js';
import { logDispatchEvent } from '../utils/logger.js';
import { sendEmailMessage } from './email.service.js';
import { sendLineMessage } from './line.service.js';
import { sendTelegramMessage } from './telegram.service.js';

const lastSentAtByUser = new Map();
const monthlyUsageByChannel = new Map();
const IN_MEMORY_RETENTION_MS = 90 * 24 * 60 * 60 * 1000;

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

function cleanupInMemoryState(now = Date.now()) {
  for (const [userId, sentAt] of lastSentAtByUser.entries()) {
    if (!Number.isFinite(Number(sentAt)) || now - Number(sentAt) > IN_MEMORY_RETENTION_MS) {
      lastSentAtByUser.delete(userId);
    }
  }

  const currentMonth = getMonthKey(now);
  for (const [key] of monthlyUsageByChannel.entries()) {
    const [, monthKey] = String(key).split(':', 2);
    if (!monthKey || monthKey !== currentMonth) {
      monthlyUsageByChannel.delete(key);
    }
  }
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

function increaseMonthlyUsageInMemory(channel, timestampMs) {
  const monthKey = getMonthKey(timestampMs);
  const key = `${channel}:${monthKey}`;
  const current = monthlyUsageByChannel.get(key) || 0;
  monthlyUsageByChannel.set(key, current + 1);
}

async function getLastSentAt(userId) {
  if (isDatabaseEnabled()) {
    const result = await dbQuery(
      `
      SELECT last_sent_at
      FROM dispatch_state
      WHERE user_id = $1
      LIMIT 1;
      `,
      [String(userId || '').trim()]
    );
    const row = result.rows[0];
    if (row && Number.isFinite(Number(row.last_sent_at))) {
      return Number(row.last_sent_at);
    }
  }

  return lastSentAtByUser.get(userId);
}

async function setLastSentAt(userId, timestampMs) {
  if (isDatabaseEnabled()) {
    await dbQuery(
      `
      INSERT INTO dispatch_state (user_id, last_sent_at, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET
        last_sent_at = EXCLUDED.last_sent_at,
        updated_at = NOW();
      `,
      [String(userId || '').trim(), Number(timestampMs)]
    );
  }

  lastSentAtByUser.set(userId, timestampMs);
}

async function getMonthlyUsageCount(channel, timestampMs) {
  if (isDatabaseEnabled()) {
    const monthKey = getMonthKey(timestampMs);
    const result = await dbQuery(
      `
      SELECT used_count
      FROM channel_usage
      WHERE month_key = $1 AND channel = $2
      LIMIT 1;
      `,
      [monthKey, channel]
    );
    const row = result.rows[0];
    if (row && Number.isFinite(Number(row.used_count))) {
      return Number(row.used_count);
    }
  }

  return getMonthlyUsage(channel, timestampMs);
}

async function increaseMonthlyUsage(channel, timestampMs) {
  if (isDatabaseEnabled()) {
    const monthKey = getMonthKey(timestampMs);
    await dbQuery(
      `
      INSERT INTO channel_usage (month_key, channel, used_count, updated_at)
      VALUES ($1, $2, 1, NOW())
      ON CONFLICT (month_key, channel)
      DO UPDATE SET
        used_count = channel_usage.used_count + 1,
        updated_at = NOW();
      `,
      [monthKey, channel]
    );
  }

  increaseMonthlyUsageInMemory(channel, timestampMs);
}

async function getChannelQuotaState(channel, timestampMs) {
  const limit = getEffectiveMonthlyLimit(channel);
  const used = await getMonthlyUsageCount(channel, timestampMs);
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
  cleanupInMemoryState();

  const cooldownMs = env.messageCooldownMinutes * 60 * 1000;
  const now = Date.now();
  const lastSentAt = await getLastSentAt(userId);
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

  const links = await getMessengerLinks(userId);
  if (!links) {
    throw new Error('No linked recipients were found for this user.');
  }

  const deliveredChannels = [];
  const blockedChannels = [];

  const lineQuota = await getChannelQuotaState('line', now);
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
    await increaseMonthlyUsage('line', now);
    deliveredChannels.push('line');
  }

  const telegramQuota = await getChannelQuotaState('telegram', now);
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
    await increaseMonthlyUsage('telegram', now);
    deliveredChannels.push('telegram');
  }

  const emailQuota = await getChannelQuotaState('email', now);
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
    await increaseMonthlyUsage('email', now);
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

  await setLastSentAt(userId, now);
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
