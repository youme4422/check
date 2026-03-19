function toMaskedUser(userId) {
  const raw = String(userId || '').trim();
  if (!raw) {
    return 'anonymous';
  }

  if (raw.length <= 6) {
    return `${raw[0]}***`;
  }

  return `${raw.slice(0, 3)}***${raw.slice(-2)}`;
}

export function logDispatchEvent({ userId, channel, status, retryAfter }) {
  const payload = {
    userRef: toMaskedUser(userId),
    channel,
    status,
  };

  if (typeof retryAfter === 'number') {
    payload.retryAfter = retryAfter;
  }

  console.log('[dispatch]', JSON.stringify(payload));
}
