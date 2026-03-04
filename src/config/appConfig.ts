import Constants from 'expo-constants';

export const PRIVACY_POLICY_URL = 'https://sites.google.com/view/younmecheck/%ED%99%88';
export const ANDROID_NOTIFICATION_CHANNEL_ID = 'checkin-safe-reminders';

type ExpoExtra = {
  apiBaseUrl?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra;

export const API_BASE_URL = extra.apiBaseUrl?.trim() || 'http://localhost:4000';
