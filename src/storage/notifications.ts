import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { ANDROID_NOTIFICATION_CHANNEL_ID } from '../config/appConfig';
import en from '../locales/en.json';
import ko from '../locales/ko.json';
import type { Locale } from './types';

type ScheduleArgs = {
  lastCheckInAt: string | null;
  intervalHours: number;
  notificationsEnabled: boolean;
  locale: Locale;
};

const dictionaries = { en, ko } as const;
const isExpoGo = Constants.executionEnvironment === 'storeClient';

export function notificationsSupported() {
  return !isExpoGo;
}

export async function configureNotificationHandler() {
  if (!notificationsSupported()) {
    return;
  }

  const Notifications = await import('expo-notifications');

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function ensureNotificationPermissions() {
  if (!notificationsSupported()) {
    return false;
  }

  const Notifications = await import('expo-notifications');
  const current = await Notifications.getPermissionsAsync();

  if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function syncScheduledNotifications(args: ScheduleArgs) {
  if (!notificationsSupported()) {
    return;
  }

  const Notifications = await import('expo-notifications');
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (!args.notificationsEnabled || !args.lastCheckInAt) {
    return;
  }

  const dictionary = dictionaries[args.locale];

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_NOTIFICATION_CHANNEL_ID, {
      name: dictionary.notifications.channelName,
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const deadline = new Date(args.lastCheckInAt).getTime() + args.intervalHours * 60 * 60 * 1000;
  const reminder = deadline - 2 * 60 * 60 * 1000;
  const now = Date.now();

  if (reminder > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: dictionary.notifications.reminderTitle,
        body: dictionary.notifications.reminderBody,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(reminder),
        channelId: Platform.OS === 'android' ? ANDROID_NOTIFICATION_CHANNEL_ID : undefined,
      },
    });
  }

  if (deadline > now) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: dictionary.notifications.deadlineTitle,
        body: dictionary.notifications.deadlineBody,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(deadline),
        channelId: Platform.OS === 'android' ? ANDROID_NOTIFICATION_CHANNEL_ID : undefined,
      },
    });
  }
}
