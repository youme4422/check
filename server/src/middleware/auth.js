import { env } from '../config/env.js';
import { sendError } from '../utils/http.js';

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

  if (provided !== env.serverApiKey) {
    sendError(res, 401, 'AUTH_INVALID', 'API key is invalid.');
    return;
  }

  next();
}
