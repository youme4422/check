import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DEFAULT_APP_STATE,
  type AppState,
  type Locale,
  type ThemeMode,
  type MessengerChannels,
  type MessengerLinks,
} from './types';

const STORAGE_KEYS = {
  accountId: '@check:accountId',
  lastCheckInAt: '@check:lastCheckInAt',
  deadmanLastSentForCheckInAt: '@check:deadmanLastSentForCheckInAt',
  checkInHistory: '@check:checkInHistory',
  intervalHours: '@check:intervalHours',
  notificationsEnabled: '@check:notificationsEnabled',
  emergencyMessage: '@check:emergencyMessage',
  contacts: '@check:contacts',
  messengerChannels: '@check:messengerChannels',
  messengerLinks: '@check:messengerLinks',
  locale: '@check:locale',
  themeMode: '@check:themeMode',
} as const;

const ALLOWED_INTERVALS = new Set([12, 24, 48]);
const MAX_HISTORY_ITEMS = 90;

export async function loadAppState(): Promise<AppState> {
  const entries = await AsyncStorage.multiGet([
    STORAGE_KEYS.lastCheckInAt,
    STORAGE_KEYS.accountId,
    STORAGE_KEYS.deadmanLastSentForCheckInAt,
    STORAGE_KEYS.checkInHistory,
    STORAGE_KEYS.intervalHours,
    STORAGE_KEYS.notificationsEnabled,
    STORAGE_KEYS.emergencyMessage,
    STORAGE_KEYS.contacts,
    STORAGE_KEYS.messengerChannels,
    STORAGE_KEYS.messengerLinks,
  ]);

  const values = Object.fromEntries(entries);
  const rawState: AppState = {
    accountId: values[STORAGE_KEYS.accountId] ?? DEFAULT_APP_STATE.accountId,
    lastCheckInAt: values[STORAGE_KEYS.lastCheckInAt] ?? DEFAULT_APP_STATE.lastCheckInAt,
    deadmanLastSentForCheckInAt:
      values[STORAGE_KEYS.deadmanLastSentForCheckInAt] ?? DEFAULT_APP_STATE.deadmanLastSentForCheckInAt,
    checkInHistory: parseJson(values[STORAGE_KEYS.checkInHistory], DEFAULT_APP_STATE.checkInHistory),
    intervalHours: parseNumber(values[STORAGE_KEYS.intervalHours], DEFAULT_APP_STATE.intervalHours),
    notificationsEnabled: parseBoolean(
      values[STORAGE_KEYS.notificationsEnabled],
      DEFAULT_APP_STATE.notificationsEnabled
    ),
    emergencyMessage: values[STORAGE_KEYS.emergencyMessage] ?? DEFAULT_APP_STATE.emergencyMessage,
    contacts: parseJson(values[STORAGE_KEYS.contacts], DEFAULT_APP_STATE.contacts),
    messengerChannels: parseJson(values[STORAGE_KEYS.messengerChannels], DEFAULT_APP_STATE.messengerChannels),
    messengerLinks: parseJson(values[STORAGE_KEYS.messengerLinks], DEFAULT_APP_STATE.messengerLinks),
  };

  return normalizeAppState(rawState);
}

export async function saveLastCheckInAt(value: string | null) {
  if (value) {
    await AsyncStorage.setItem(STORAGE_KEYS.lastCheckInAt, value);
    return;
  }

  await AsyncStorage.removeItem(STORAGE_KEYS.lastCheckInAt);
}

export async function saveAccountId(value: string) {
  await AsyncStorage.setItem(STORAGE_KEYS.accountId, value);
}

export async function saveDeadmanLastSentForCheckInAt(value: string | null) {
  if (value) {
    await AsyncStorage.setItem(STORAGE_KEYS.deadmanLastSentForCheckInAt, value);
    return;
  }

  await AsyncStorage.removeItem(STORAGE_KEYS.deadmanLastSentForCheckInAt);
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

export async function saveEmergencyMessage(value: string) {
  await AsyncStorage.setItem(STORAGE_KEYS.emergencyMessage, value);
}

export async function saveContacts(value: AppState['contacts']) {
  await AsyncStorage.setItem(STORAGE_KEYS.contacts, JSON.stringify(value));
}

export async function saveMessengerChannels(value: MessengerChannels) {
  await AsyncStorage.setItem(STORAGE_KEYS.messengerChannels, JSON.stringify(value));
}

export async function saveMessengerLinks(value: MessengerLinks) {
  await AsyncStorage.setItem(STORAGE_KEYS.messengerLinks, JSON.stringify(value));
}

export async function resetAppStateStorage() {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.lastCheckInAt,
    STORAGE_KEYS.accountId,
    STORAGE_KEYS.deadmanLastSentForCheckInAt,
    STORAGE_KEYS.checkInHistory,
    STORAGE_KEYS.intervalHours,
    STORAGE_KEYS.notificationsEnabled,
    STORAGE_KEYS.emergencyMessage,
    STORAGE_KEYS.contacts,
    STORAGE_KEYS.messengerChannels,
    STORAGE_KEYS.messengerLinks,
  ]);
}

export async function loadLocale(): Promise<Locale> {
  const saved = await AsyncStorage.getItem(STORAGE_KEYS.locale);
  if (saved === 'en' || saved === 'ja' || saved === 'es' || saved === 'zh') {
    return saved;
  }

  return 'ko';
}

export async function saveLocale(value: Locale) {
  await AsyncStorage.setItem(STORAGE_KEYS.locale, value);
}

export async function loadThemeMode(): Promise<ThemeMode> {
  const saved = await AsyncStorage.getItem(STORAGE_KEYS.themeMode);

  if (saved === 'light' || saved === 'dark') {
    return saved;
  }

  return 'system';
}

export async function saveThemeMode(value: ThemeMode) {
  await AsyncStorage.setItem(STORAGE_KEYS.themeMode, value);
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

function normalizeAppState(state: AppState): AppState {
  return {
    accountId: normalizeAccountId(state.accountId),
    lastCheckInAt: normalizeIsoDate(state.lastCheckInAt),
    deadmanLastSentForCheckInAt: normalizeIsoDate(state.deadmanLastSentForCheckInAt),
    checkInHistory: normalizeHistory(state.checkInHistory),
    intervalHours: normalizeInterval(state.intervalHours),
    notificationsEnabled: Boolean(state.notificationsEnabled),
    emergencyMessage: normalizeEmergencyMessage(state.emergencyMessage),
    contacts: normalizeContacts(state.contacts),
    messengerChannels: normalizeMessengerChannels(state.messengerChannels),
    messengerLinks: normalizeMessengerLinks(state.messengerLinks),
  };
}

function normalizeHistory(history: string[]) {
  if (!Array.isArray(history)) {
    return DEFAULT_APP_STATE.checkInHistory;
  }

  return history
    .map((value) => normalizeIsoDate(value))
    .filter((value): value is string => Boolean(value))
    .slice(0, MAX_HISTORY_ITEMS);
}

function normalizeContacts(contacts: AppState['contacts']) {
  if (!Array.isArray(contacts)) {
    return DEFAULT_APP_STATE.contacts;
  }

  return contacts
    .filter((contact): contact is AppState['contacts'][number] => Boolean(contact && typeof contact === 'object'))
    .map((contact) => ({
      id: String(contact.id ?? '').trim(),
      name: String(contact.name ?? '').trim().slice(0, 80),
      phone: String(contact.phone ?? '').trim().slice(0, 32),
      email: String(contact.email ?? '').trim().toLowerCase().slice(0, 120),
    }))
    .filter((contact) => contact.id && contact.name && (contact.phone || contact.email));
}

function normalizeMessengerChannels(value: AppState['messengerChannels']) {
  return {
    line: Boolean(value?.line),
    whatsapp: Boolean(value?.whatsapp),
    telegram: Boolean(value?.telegram),
    email: Boolean(value?.email),
  };
}

function normalizeMessengerLinks(value: AppState['messengerLinks']) {
  return {
    lineUserId: String(value?.lineUserId ?? '').trim().slice(0, 128),
    whatsappId: String(value?.whatsappId ?? '').trim().slice(0, 64),
    telegramId: String(value?.telegramId ?? '').trim().slice(0, 64),
    email: String(value?.email ?? '').trim().toLowerCase().slice(0, 120),
  };
}

function normalizeInterval(value: number) {
  return ALLOWED_INTERVALS.has(value) ? value : DEFAULT_APP_STATE.intervalHours;
}

function normalizeAccountId(value: string) {
  return String(value ?? '')
    .trim()
    .slice(0, 64)
    .replace(/[^a-zA-Z0-9._-]/g, '');
}

function normalizeEmergencyMessage(value: string) {
  return String(value ?? '').trim().slice(0, 600);
}

function normalizeIsoDate(value: string | null) {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}
