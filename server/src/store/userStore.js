import crypto from 'node:crypto';

const users = new Map();
const linkCodes = new Map();
const LINK_CODE_TTL_MS = 10 * 60 * 1000;

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

export function saveMessengerLinks(userId, links) {
  const existing = users.get(userId) || {
    userId,
    lineUserId: '',
    telegramChatId: '',
    email: '',
  };

  const nextUser = {
    userId,
    lineUserId:
      links.lineUserId !== undefined
        ? String(links.lineUserId || '').trim()
        : existing.lineUserId,
    telegramChatId:
      links.telegramChatId !== undefined
        ? String(links.telegramChatId || '').trim()
        : existing.telegramChatId,
    email:
      links.email !== undefined
        ? String(links.email || '').trim().toLowerCase()
        : existing.email,
  };

  users.set(userId, nextUser);

  return nextUser;
}

export function getMessengerLinks(userId) {
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

export function consumeLinkCode(channel, code, targetId) {
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
      ? saveMessengerLinks(entry.userId, { lineUserId: normalizedTargetId })
      : saveMessengerLinks(entry.userId, { telegramChatId: normalizedTargetId });

  linkCodes.delete(normalizedCode);

  return {
    ok: true,
    userId: entry.userId,
    channel: normalizedChannel,
    user: updatedUser,
  };
}
