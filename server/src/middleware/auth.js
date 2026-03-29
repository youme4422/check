import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { sendError } from '../utils/http.js';

export function timingSafeEqualString(left, right) {
  const a = Buffer.from(String(left || ''), 'utf8');
  const b = Buffer.from(String(right || ''), 'utf8');
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

export function isValidServerApiKey(provided) {
  return timingSafeEqualString(provided, env.serverApiKey);
}

export function requireApiAuth(req, res, next) {
  const keyFromHeader = String(req.header('x-api-key') || '').trim();
  const authHeader = String(req.header('authorization') || '').trim();
  const keyFromBearer = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : '';

  const provided = keyFromHeader || keyFromBearer;

  if (!provided) {
    sendError(res, 401, 'AUTH_REQUIRED', 'API key is required.');
    return;
  }

  if (!isValidServerApiKey(provided)) {
    sendError(res, 401, 'AUTH_INVALID', 'API key is invalid.');
    return;
  }

  next();
}
