import Constants from 'expo-constants';

export const PRIVACY_POLICY_URL = 'https://sites.google.com/view/younmecheck/%ED%99%88';
export const ANDROID_NOTIFICATION_CHANNEL_ID = 'taeb-reminders';

type ExtraConfig = {
  messengerServerBaseUrl?: string;
  lineOfficialAccountId?: string;
  telegramBotUsername?: string;
};

function getExtraConfig(): ExtraConfig {
  const expoConfig = Constants.expoConfig as { extra?: ExtraConfig } | null;
  return expoConfig?.extra ?? {};
}

const extra = getExtraConfig();

export const MESSENGER_SERVER_BASE_URL = String(extra.messengerServerBaseUrl || '').trim();
export const LINE_OFFICIAL_ACCOUNT_ID = String(extra.lineOfficialAccountId || '').trim();
export const TELEGRAM_BOT_USERNAME = String(extra.telegramBotUsername || '').trim();
