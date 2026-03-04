import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_APP_STATE, type AppState, type Locale } from './types';

const STORAGE_KEYS = {
  lastCheckInAt: '@check:lastCheckInAt',
  checkInHistory: '@check:checkInHistory',
  intervalHours: '@check:intervalHours',
  notificationsEnabled: '@check:notificationsEnabled',
  contacts: '@check:contacts',
  locale: '@check:locale',
} as const;

export async function loadAppState(): Promise<AppState> {
  const entries = await AsyncStorage.multiGet([
    STORAGE_KEYS.lastCheckInAt,
    STORAGE_KEYS.checkInHistory,
    STORAGE_KEYS.intervalHours,
    STORAGE_KEYS.notificationsEnabled,
    STORAGE_KEYS.contacts,
  ]);

  const values = Object.fromEntries(entries);

  return {
    lastCheckInAt: values[STORAGE_KEYS.lastCheckInAt] ?? DEFAULT_APP_STATE.lastCheckInAt,
    checkInHistory: parseJson(values[STORAGE_KEYS.checkInHistory], DEFAULT_APP_STATE.checkInHistory),
    intervalHours: parseNumber(values[STORAGE_KEYS.intervalHours], DEFAULT_APP_STATE.intervalHours),
    notificationsEnabled: parseBoolean(
      values[STORAGE_KEYS.notificationsEnabled],
      DEFAULT_APP_STATE.notificationsEnabled
    ),
    contacts: parseJson(values[STORAGE_KEYS.contacts], DEFAULT_APP_STATE.contacts),
  };
}

export async function saveLastCheckInAt(value: string | null) {
  if (value) {
    await AsyncStorage.setItem(STORAGE_KEYS.lastCheckInAt, value);
    return;
  }

  await AsyncStorage.removeItem(STORAGE_KEYS.lastCheckInAt);
}

export async function saveCheckInHistory(value: string[]) {
  await AsyncStorage.setItem(STORAGE_KEYS.checkInHistory, JSON.stringify(value));
}

export async function saveIntervalHours(value: number) {
  await AsyncStorage.setItem(STORAGE_KEYS.intervalHours, String(value));
}

export async function saveNotificationsEnabled(value: boolean) {
  await AsyncStorage.setItem(STORAGE_KEYS.notificationsEnabled, JSON.stringify(value));
}

export async function saveContacts(value: AppState['contacts']) {
  await AsyncStorage.setItem(STORAGE_KEYS.contacts, JSON.stringify(value));
}

export async function resetAppStateStorage() {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.lastCheckInAt,
    STORAGE_KEYS.checkInHistory,
    STORAGE_KEYS.intervalHours,
    STORAGE_KEYS.notificationsEnabled,
    STORAGE_KEYS.contacts,
  ]);
}

export async function loadLocale(): Promise<Locale> {
  const saved = await AsyncStorage.getItem(STORAGE_KEYS.locale);
  if (saved === 'en' || saved === 'ja' || saved === 'es') {
    return saved;
  }

  return 'ko';
}

export async function saveLocale(value: Locale) {
  await AsyncStorage.setItem(STORAGE_KEYS.locale, value);
}

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function parseNumber(raw: string | null | undefined, fallback: number) {
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseBoolean(raw: string | null | undefined, fallback: boolean) {
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as boolean;
  } catch {
    return fallback;
  }
}
