import { env } from '../config/env.js';
import { sendError } from '../utils/http.js';

const ipBuckets = new Map();
const userBuckets = new Map();
let requestCounter = 0;

function getClientIp(req) {
  const forwarded = String(req.header('x-forwarded-for') || '').split(',')[0].trim();
  return forwarded || req.ip || 'unknown';
}

function checkBucket(map, key, limit, windowMs) {
  const now = Date.now();
  const current = map.get(key);

  if (!current || now - current.windowStart > windowMs) {
    map.set(key, {
      windowStart: now,
      count: 1,
    });
    return null;
  }

  if (current.count >= limit) {
    return Math.ceil((windowMs - (now - current.windowStart)) / 1000);
  }

  current.count += 1;
  return null;
}

function cleanupExpiredBuckets(windowMs) {
  const now = Date.now();
  for (const [key, value] of ipBuckets.entries()) {
    if (now - value.windowStart > windowMs) {
      ipBuckets.delete(key);
    }
  }
  for (const [key, value] of userBuckets.entries()) {
    if (now - value.windowStart > windowMs) {
      userBuckets.delete(key);
    }
  }
}

export function rateLimitRequest(req, res, next) {
  const windowMs = env.rateLimitWindowSeconds * 1000;
  requestCounter += 1;
  if (requestCounter % 200 === 0) {
    cleanupExpiredBuckets(windowMs);
  }

  const userId = String(req.params.userId || req.body?.userId || '').trim();
  const ip = getClientIp(req);

  const ipRetryAfter = checkBucket(ipBuckets, ip, env.rateLimitPerIp, windowMs);
  if (ipRetryAfter !== null) {
    sendError(res, 429, 'RATE_LIMIT_IP', 'Too many requests from this IP.', { retryAfter: ipRetryAfter });
    return;
  }

  if (userId) {
    const userRetryAfter = checkBucket(userBuckets, userId, env.rateLimitPerUser, windowMs);
    if (userRetryAfter !== null) {
      sendError(res, 429, 'RATE_LIMIT_USER', 'Too many requests for this user.', { retryAfter: userRetryAfter });
      return;
    }
  }

  next();
}
