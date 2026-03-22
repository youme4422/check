import crypto from 'node:crypto';
import { dbQuery, isDatabaseEnabled } from '../db/client.js';

const users = new Map();
const linkCodes = new Map();
const LINK_CODE_TTL_MINUTES = Number(process.env.LINK_CODE_TTL_MINUTES || 30);
const LINK_CODE_TTL_MS = Math.max(1, LINK_CODE_TTL_MINUTES) * 60 * 1000;

function cleanupExpiredLinkCodes(now = Date.now()) {
  for (const [code, entry] of linkCodes.entries()) {
    if (entry.expiresAt <= now) {
      linkCodes.delete(code);
    }
  }
}

function generateLinkCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i += 1) {
    code += alphabet[crypto.randomInt(0, alphabet.length)];
  }
  return code;
}

function normalizeUser(userId, links) {
  return {
    userId,
    lineUserId: String(links.lineUserId || '').trim(),
    telegramChatId: String(links.telegramChatId || '').trim(),
    email: String(links.email || '').trim().toLowerCase(),
  };
}

function getMemoryUser(userId) {
  return users.get(userId) || {
    userId,
    lineUserId: '',
    telegramChatId: '',
    email: '',
  };
}

export async function saveMessengerLinks(userId, links) {
  const existing = await getMessengerLinks(userId);
  const safeExisting = existing || getMemoryUser(userId);

  const nextUser = {
    userId,
    lineUserId:
      links.lineUserId !== undefined
        ? String(links.lineUserId || '').trim()
        : safeExisting.lineUserId,
    telegramChatId:
      links.telegramChatId !== undefined
        ? String(links.telegramChatId || '').trim()
        : safeExisting.telegramChatId,
    email:
      links.email !== undefined
        ? String(links.email || '').trim().toLowerCase()
        : safeExisting.email,
  };

  if (isDatabaseEnabled()) {
    const normalized = normalizeUser(userId, nextUser);
    await dbQuery(
      `
      INSERT INTO messenger_links (user_id, line_user_id, telegram_chat_id, email, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET
        line_user_id = EXCLUDED.line_user_id,
        telegram_chat_id = EXCLUDED.telegram_chat_id,
        email = EXCLUDED.email,
        updated_at = NOW();
      `,
      [normalized.userId, normalized.lineUserId, normalized.telegramChatId, normalized.email]
    );
  }

  users.set(userId, nextUser);

  return nextUser;
}

export async function getMessengerLinks(userId) {
  if (isDatabaseEnabled()) {
    const result = await dbQuery(
      `
      SELECT user_id, line_user_id, telegram_chat_id, email
      FROM messenger_links
      WHERE user_id = $1
      LIMIT 1;
      `,
      [String(userId || '').trim()]
    );
    const row = result.rows[0];
    if (row) {
      const user = {
        userId: row.user_id,
        lineUserId: row.line_user_id,
        telegramChatId: row.telegram_chat_id,
        email: row.email,
      };
      users.set(user.userId, user);
      return user;
    }
  }

  return users.get(userId) || null;
}

export function createLinkCode(userId, channel) {
  const normalizedUserId = String(userId || '').trim();
  const normalizedChannel = String(channel || '').trim().toLowerCase();
  if (!normalizedUserId || !['line', 'telegram'].includes(normalizedChannel)) {
    throw new Error('Invalid link-code request.');
  }

  cleanupExpiredLinkCodes();

  let code = generateLinkCode();
  while (linkCodes.has(code)) {
    code = generateLinkCode();
  }

  const expiresAt = Date.now() + LINK_CODE_TTL_MS;
  linkCodes.set(code, {
    userId: normalizedUserId,
    channel: normalizedChannel,
    expiresAt,
  });

  return {
    code,
    expiresAt,
    expiresInSeconds: Math.ceil(LINK_CODE_TTL_MS / 1000),
  };
}

export async function consumeLinkCode(channel, code, targetId) {
  const normalizedChannel = String(channel || '').trim().toLowerCase();
  const normalizedCode = String(code || '').trim().toUpperCase();
  const normalizedTargetId = String(targetId || '').trim();

  if (!normalizedCode || !normalizedTargetId || !['line', 'telegram'].includes(normalizedChannel)) {
    return { ok: false, reason: 'invalid_input' };
  }

  cleanupExpiredLinkCodes();

  const entry = linkCodes.get(normalizedCode);
  if (!entry) {
    return { ok: false, reason: 'not_found' };
  }

  if (entry.channel !== normalizedChannel) {
    return { ok: false, reason: 'channel_mismatch' };
  }

  if (entry.expiresAt <= Date.now()) {
    linkCodes.delete(normalizedCode);
    return { ok: false, reason: 'expired' };
  }

  const updatedUser =
    normalizedChannel === 'line'
      ? await saveMessengerLinks(entry.userId, { lineUserId: normalizedTargetId })
      : await saveMessengerLinks(entry.userId, { telegramChatId: normalizedTargetId });

  linkCodes.delete(normalizedCode);

  return {
    ok: true,
    userId: entry.userId,
    channel: normalizedChannel,
    user: updatedUser,
  };
}
