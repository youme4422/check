import { dbQuery, isDatabaseEnabled } from '../db/client.js';

const memoryDeadmanState = new Map();

function toTimestamp(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

function normalizeIntervalHours(value) {
  const n = Number(value);
  return [12, 24, 48].includes(n) ? n : 24;
}

function normalizeState(userId, raw = {}) {
  return {
    userId: String(userId || '').trim(),
    lastCheckInAt: toTimestamp(raw.lastCheckInAt),
    intervalHours: normalizeIntervalHours(raw.intervalHours),
    emergencyText: String(raw.emergencyText || '').trim().slice(0, 1000),
    lineEnabled: Boolean(raw.lineEnabled),
    telegramEnabled: Boolean(raw.telegramEnabled),
    emailEnabled: Boolean(raw.emailEnabled),
    lastDispatchedForCheckinAt: toTimestamp(raw.lastDispatchedForCheckinAt),
  };
}

function fromDbRow(row) {
  if (!row) {
    return null;
  }
  return normalizeState(row.user_id, {
    lastCheckInAt: row.last_check_in_at,
    intervalHours: row.interval_hours,
    emergencyText: row.emergency_text,
    lineEnabled: row.line_enabled,
    telegramEnabled: row.telegram_enabled,
    emailEnabled: row.email_enabled,
    lastDispatchedForCheckinAt: row.last_dispatched_for_checkin_at,
  });
}

export async function getDeadmanState(userId) {
  const normalizedUserId = String(userId || '').trim();
  if (!normalizedUserId) {
    return null;
  }

  if (isDatabaseEnabled()) {
    const result = await dbQuery(
      `
      SELECT
        user_id,
        last_check_in_at,
        interval_hours,
        emergency_text,
        line_enabled,
        telegram_enabled,
        email_enabled,
        last_dispatched_for_checkin_at
      FROM deadman_state
      WHERE user_id = $1
      LIMIT 1;
      `,
      [normalizedUserId]
    );

    const rowState = fromDbRow(result.rows[0]);
    if (rowState) {
      memoryDeadmanState.set(normalizedUserId, rowState);
    }
    return rowState;
  }

  return memoryDeadmanState.get(normalizedUserId) || null;
}

export async function upsertDeadmanState(userId, nextPatch) {
  const normalizedUserId = String(userId || '').trim();
  if (!normalizedUserId) {
    throw new Error('userId is required.');
  }

  const current = (await getDeadmanState(normalizedUserId)) || normalizeState(normalizedUserId);
  const next = normalizeState(normalizedUserId, {
    ...current,
    ...nextPatch,
  });

  if (isDatabaseEnabled()) {
    await dbQuery(
      `
      INSERT INTO deadman_state (
        user_id,
        last_check_in_at,
        interval_hours,
        emergency_text,
        line_enabled,
        telegram_enabled,
        email_enabled,
        last_dispatched_for_checkin_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET
        last_check_in_at = EXCLUDED.last_check_in_at,
        interval_hours = EXCLUDED.interval_hours,
        emergency_text = EXCLUDED.emergency_text,
        line_enabled = EXCLUDED.line_enabled,
        telegram_enabled = EXCLUDED.telegram_enabled,
        email_enabled = EXCLUDED.email_enabled,
        last_dispatched_for_checkin_at = EXCLUDED.last_dispatched_for_checkin_at,
        updated_at = NOW();
      `,
      [
        next.userId,
        next.lastCheckInAt,
        next.intervalHours,
        next.emergencyText,
        next.lineEnabled,
        next.telegramEnabled,
        next.emailEnabled,
        next.lastDispatchedForCheckinAt,
      ]
    );
  }

  memoryDeadmanState.set(normalizedUserId, next);
  return next;
}

export async function listDeadmanDispatchCandidates(now = Date.now(), limit = 200) {
  if (isDatabaseEnabled()) {
    const result = await dbQuery(
      `
      SELECT
        user_id,
        last_check_in_at,
        interval_hours,
        emergency_text,
        line_enabled,
        telegram_enabled,
        email_enabled,
        last_dispatched_for_checkin_at
      FROM deadman_state
      WHERE
        last_check_in_at > 0
        AND last_dispatched_for_checkin_at < last_check_in_at
        AND (last_check_in_at + (interval_hours * 3600000)) <= $1
      ORDER BY last_check_in_at ASC
      LIMIT $2;
      `,
      [Math.floor(now), Math.max(1, Math.min(1000, Number(limit) || 200))]
    );
    return result.rows.map(fromDbRow).filter(Boolean);
  }

  const rows = [];
  for (const state of memoryDeadmanState.values()) {
    if (!state.lastCheckInAt) {
      continue;
    }
    if (state.lastDispatchedForCheckinAt >= state.lastCheckInAt) {
      continue;
    }
    const dueAt = state.lastCheckInAt + state.intervalHours * 60 * 60 * 1000;
    if (dueAt <= now) {
      rows.push(state);
    }
  }
  rows.sort((a, b) => a.lastCheckInAt - b.lastCheckInAt);
  return rows.slice(0, Math.max(1, Math.min(1000, Number(limit) || 200)));
}
