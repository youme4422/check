export type Locale = 'ko' | 'en' | 'ja' | 'es';

export type Contact = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

export type MessengerProfile = {
  userId: string;
  lineUserId: string;
  telegramChatId: string;
};

export type AppState = {
  lastCheckInAt: string | null;
  checkInHistory: string[];
  intervalHours: number;
  notificationsEnabled: boolean;
  contacts: Contact[];
  messengerProfile: MessengerProfile;
};

export const DEFAULT_MESSENGER_PROFILE: MessengerProfile = {
  userId: 'local-device-user',
  lineUserId: '',
  telegramChatId: '',
};

export const DEFAULT_APP_STATE: AppState = {
  lastCheckInAt: null,
  checkInHistory: [],
  intervalHours: 24,
  notificationsEnabled: false,
  contacts: [],
  messengerProfile: DEFAULT_MESSENGER_PROFILE,
};
