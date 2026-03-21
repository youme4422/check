import { Pool } from 'pg';

import { env } from '../config/env.js';

let pool = null;

function hasDiscretePgConfig() {
  return Boolean(env.pgHost && env.pgDatabase && env.pgUser && env.pgPassword);
}

export function isDatabaseEnabled() {
  return Boolean(env.databaseUrl) || hasDiscretePgConfig();
}

function getPool() {
  if (!isDatabaseEnabled()) {
    throw new Error('DB config is not configured. Set DATABASE_URL or PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD.');
  }

  if (!pool) {
    if (env.databaseUrl) {
      pool = new Pool({
        connectionString: env.databaseUrl,
        ssl: { rejectUnauthorized: false },
        max: 10,
      });
    } else {
      pool = new Pool({
        host: env.pgHost,
        port: env.pgPort,
        database: env.pgDatabase,
        user: env.pgUser,
        password: env.pgPassword,
        ssl: { rejectUnauthorized: env.pgSslRejectUnauthorized },
        max: 10,
      });
    }
  }

  return pool;
}

export async function dbQuery(text, params = []) {
  const p = getPool();
  return p.query(text, params);
}

export async function initDatabase() {
  if (!isDatabaseEnabled()) {
    return false;
  }

  await dbQuery(`
    CREATE TABLE IF NOT EXISTS messenger_links (
      user_id TEXT PRIMARY KEY,
      line_user_id TEXT NOT NULL DEFAULT '',
      telegram_chat_id TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await dbQuery(`
    CREATE TABLE IF NOT EXISTS dispatch_state (
      user_id TEXT PRIMARY KEY,
      last_sent_at BIGINT NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await dbQuery(`
    CREATE TABLE IF NOT EXISTS channel_usage (
      month_key TEXT NOT NULL,
      channel TEXT NOT NULL,
      used_count INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (month_key, channel)
    );
  `);

  return true;
}
