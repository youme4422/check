export type Locale = 'ko' | 'en' | 'ja' | 'es' | 'zh';
export type ThemeMode = 'system' | 'light' | 'dark';

export type Contact = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

export type MessengerChannels = {
  line: boolean;
  telegram: boolean;
  email: boolean;
};

export type MessengerLinks = {
  lineUserId: string;
  telegramId: string;
  email: string;
};

export type AppState = {
  accountId: string;
  lastCheckInAt: string | null;
  deadmanLastSentForCheckInAt: string | null;
  checkInHistory: string[];
  intervalHours: number;
  notificationsEnabled: boolean;
  emergencyMessage: string;
  contacts: Contact[];
  messengerChannels: MessengerChannels;
  messengerLinks: MessengerLinks;
};

export const DEFAULT_APP_STATE: AppState = {
  accountId: '',
  lastCheckInAt: null,
  deadmanLastSentForCheckInAt: null,
  checkInHistory: [],
  intervalHours: 24,
  notificationsEnabled: false,
  emergencyMessage: '',
  contacts: [],
  messengerChannels: {
    line: false,
    telegram: false,
    email: false,
  },
  messengerLinks: {
    lineUserId: '',
    telegramId: '',
    email: '',
  },
};
