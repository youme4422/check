export type Locale = 'ko' | 'en';

export type Contact = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

export type AppState = {
  lastCheckInAt: string | null;
  checkInHistory: string[];
  intervalHours: number;
  notificationsEnabled: boolean;
  contacts: Contact[];
};

export const DEFAULT_APP_STATE: AppState = {
  lastCheckInAt: null,
  checkInHistory: [],
  intervalHours: 24,
  notificationsEnabled: false,
  contacts: [],
};
