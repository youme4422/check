import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { ContactPickerModal } from '../components/ContactPickerModal';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionCard } from '../components/SectionCard';
import { ThemeToggle } from '../components/ThemeToggle';
import { formatRemainingTime } from '../i18n/formatters';
import { useI18n } from '../i18n/I18nProvider';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { sendDeadmanAlert } from '../services/messengerApi';
import { useAppState } from '../storage/AppStateContext';
import type { Contact } from '../storage/types';
import { useAppTheme } from '../theme/ThemeProvider';
import { isAllowedExternalUrl } from '../utils/urlSafety';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;
type PickerMode = 'sms' | 'email' | null;

export function HomeScreen({ navigation }: Props) {
  const { t } = useI18n();
  const { theme, scheme } = useAppTheme();
  const {
    accountId,
    lastCheckInAt,
    deadmanLastSentForCheckInAt,
    intervalHours,
    contacts,
    emergencyMessage,
    messengerChannels,
    messengerLinks,
    recordCheckIn,
    setDeadmanLastSentForCheckInSetting,
  } = useAppState();
  const [now, setNow] = useState(Date.now());
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);
  const [checkInNotice, setCheckInNotice] = useState('');
  const intervalMs = intervalHours * 60 * 60 * 1000;

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!checkInNotice) {
      return;
    }

    const timer = setTimeout(() => {
      setCheckInNotice('');
    }, 3000);

    return () => clearTimeout(timer);
  }, [checkInNotice]);

  const deadlineAt = lastCheckInAt ? new Date(lastCheckInAt).getTime() + intervalMs : null;
  const remainingMs = deadlineAt ? deadlineAt - now : intervalMs;
  const isOverdue = deadlineAt ? remainingMs <= 0 : false;

  useEffect(() => {
    const tryAutoDispatch = async () => {
      if (!isOverdue || !lastCheckInAt || deadmanLastSentForCheckInAt === lastCheckInAt) {
        return;
      }

      const channels: ('line' | 'telegram' | 'email' | 'whatsapp')[] = [];
      if (messengerChannels.line && messengerLinks.lineUserId.trim()) {
        channels.push('line');
      }
      if (messengerChannels.telegram && messengerLinks.telegramId.trim()) {
        channels.push('telegram');
      }
      if (messengerChannels.email && messengerLinks.email.trim()) {
        channels.push('email');
      }
      if (messengerChannels.whatsapp && messengerLinks.whatsappId.trim()) {
        channels.push('whatsapp');
      }

      if (!accountId.trim() || channels.length === 0) {
        return;
      }

      try {
        await sendDeadmanAlert({
          accountId,
          channels,
          text: emergencyMessage || t('messages.emergencyBody'),
        });
        await setDeadmanLastSentForCheckInSetting(lastCheckInAt);
      } catch {
        // Avoid repeated error popups while the app re-renders in overdue state.
      }
    };

    void tryAutoDispatch();
  }, [
    accountId,
    deadmanLastSentForCheckInAt,
    emergencyMessage,
    isOverdue,
    lastCheckInAt,
    messengerChannels.email,
    messengerChannels.line,
    messengerChannels.telegram,
    messengerChannels.whatsapp,
    messengerLinks.email,
    messengerLinks.lineUserId,
    messengerLinks.telegramId,
    messengerLinks.whatsappId,
    setDeadmanLastSentForCheckInSetting,
    t,
  ]);

  const handleCheckIn = async () => {
    await recordCheckIn();
    const nextRemainingMs = intervalMs;

    setCheckInNotice(
      formatRemainingTime(
        nextRemainingMs,
        {
          day: t('time.day'),
          hour: t('time.hour'),
          minute: t('time.minute'),
        },
        t('time.ready')
      )
    );
  };

  const handleQuickAction = (mode: Exclude<PickerMode, null>) => {
    if (contacts.length === 0) {
      Alert.alert(t('home.noContactsTitle'), t('home.noContactsBody'));
      return;
    }

    setPickerMode(mode);
  };

  const openComposer = async (mode: Exclude<PickerMode, null>, contact: Contact) => {
    setPickerMode(null);

    const messageText = emergencyMessage || t('messages.emergencyBody');
    const body = encodeURIComponent(messageText);
    const subject = encodeURIComponent(t('messages.emergencySubject'));

    if (mode === 'sms') {
      if (!contact.phone.trim()) {
        Alert.alert(t('home.composerErrorTitle'), t('home.missingPhone'));
        return;
      }

      await openUrl(`sms:${contact.phone}?body=${body}`);
      return;
    }

    if (!contact.email.trim()) {
      Alert.alert(t('home.composerErrorTitle'), t('home.missingEmail'));
      return;
    }

    await openUrl(`mailto:${contact.email}?subject=${subject}&body=${body}`);
  };

  const openUrl = async (url: string) => {
    if (!isAllowedExternalUrl(url, ['sms:', 'mailto:'])) {
      Alert.alert(t('home.composerErrorTitle'), t('home.composerErrorBody'));
      return;
    }

    try {
      const supported = await Linking.canOpenURL(url);

      if (!supported) {
        Alert.alert(t('home.composerErrorTitle'), t('home.composerErrorBody'));
        return;
      }

      await Linking.openURL(url);
    } catch {
      Alert.alert(t('home.composerErrorTitle'), t('home.composerErrorBody'));
    }
  };

  return (
    <ScreenContainer>
      {checkInNotice ? (
        <View
          style={[
            styles.noticeCard,
            {
              backgroundColor: scheme === 'dark' ? '#11211E' : '#F5FBF7',
              borderColor: theme.border,
              shadowColor: '#000000',
            },
          ]}
        >
          <Text style={[styles.noticeTitle, { color: theme.primary }]}>{t('home.checkInSuccessTitle')}</Text>
          <Text style={[styles.noticeBody, { color: theme.text }]}>{checkInNotice}</Text>
        </View>
      ) : null}

      {isOverdue ? (
        <SectionCard variant="warning">
          <Text
            style={[
              styles.alertPill,
              { backgroundColor: scheme === 'dark' ? '#352524' : '#FBE9E8', color: theme.warningText },
            ]}
          >
            Attention Needed
          </Text>
          <Text style={[styles.bannerTitle, { color: theme.warningText }]}>{t('home.missedTitle')}</Text>
          <Text style={[styles.bannerBody, { color: theme.mutedText }]}>{t('home.missedBody')}</Text>
          <AppButton label={t('home.sendSms')} onPress={() => handleQuickAction('sms')} />
          <AppButton label={t('home.sendEmail')} onPress={() => handleQuickAction('email')} variant="secondary" />
        </SectionCard>
      ) : null}

      <SectionCard variant="hero">
        <View style={styles.heroHeader}>
          <View style={styles.heroHeaderText}>
            <Text style={[styles.eyebrow, { color: theme.primary }]}>{t('common.appName')}</Text>
            <Text style={[styles.heroTitle, { color: theme.text }]}>{t('home.checkInButton')}</Text>
          </View>
          <ThemeToggle />
        </View>
        <Text style={[styles.heroBody, { color: theme.mutedText }]}>{t('home.heroDescription')}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void handleCheckIn();
          }}
          style={({ pressed }) => [
            styles.checkInButton,
            {
              backgroundColor: theme.primary,
              borderColor: theme.secondary,
              shadowColor: '#000000',
            },
            pressed ? styles.checkInButtonPressed : null,
          ]}
        >
          <Text style={styles.checkInTime}>{formatClockCountdown(remainingMs)}</Text>
          <Text style={styles.checkInHint}>{t('home.checkInButton')}</Text>
        </Pressable>
      </SectionCard>

      <View style={[styles.actionPanel, { backgroundColor: theme.softSurface, borderColor: theme.border }]}>
        <Text style={[styles.panelLabel, { color: theme.mutedText }]}>Quick Actions</Text>
        <View style={styles.quickRow}>
          <View style={styles.quickCell}>
            <AppButton label={t('contacts.title')} onPress={() => navigation.navigate('EmergencyContacts')} variant="secondary" />
          </View>
          <View style={styles.quickCell}>
            <AppButton
              label={t('settings.messengerLabel')}
              onPress={() => navigation.navigate('MessengerLinks')}
              variant="secondary"
            />
          </View>
        </View>
      </View>

      <AppButton label={t('home.settingsButton')} onPress={() => navigation.navigate('Settings')} variant="secondary" />

      <ContactPickerModal
        visible={pickerMode !== null}
        title={t('home.pickContactTitle')}
        emptyText={t('home.noContactsBody')}
        closeLabel={t('common.close')}
        contacts={contacts}
        onClose={() => setPickerMode(null)}
        onSelect={(contact) => {
          if (!pickerMode) {
            return;
          }

          void openComposer(pickerMode, contact);
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  noticeCard: {
    marginBottom: 12,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F5FBF7',
    borderWidth: 1,
    borderColor: '#D4E7DB',
    shadowColor: '#153128',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#196B57',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  noticeBody: {
    marginTop: 6,
    color: '#29453B',
    lineHeight: 22,
    fontWeight: '600',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: '#1A7F64',
  },
  alertPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FBE9E8',
    color: '#8C2F39',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  bannerTitle: {
    marginTop: 10,
    fontSize: 21,
    fontWeight: '800',
    color: '#8C2F39',
  },
  bannerBody: {
    color: '#694148',
    marginTop: 8,
    lineHeight: 22,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#17362C',
    letterSpacing: -0.4,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroHeaderText: {
    flex: 1,
    paddingRight: 4,
  },
  heroBody: {
    marginTop: 10,
    color: '#5A6B62',
    lineHeight: 23,
  },
  checkInButton: {
    marginTop: 18,
    minHeight: 138,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A6856',
    borderWidth: 1,
    borderColor: '#145847',
    shadowColor: '#114136',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
    paddingHorizontal: 22,
  },
  checkInButtonPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  checkInTime: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 1.4,
    fontVariant: ['tabular-nums'],
  },
  checkInHint: {
    marginTop: 10,
    color: '#DDEEE8',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  actionPanel: {
    marginTop: 2,
    marginBottom: 2,
    borderRadius: 20,
    padding: 14,
    backgroundColor: '#F6FAF7',
    borderWidth: 1,
    borderColor: '#DCE7E0',
  },
  panelLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: '#648075',
    marginBottom: 2,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickCell: {
    flex: 1,
  },
});

function formatClockCountdown(remainingMs: number) {
  const safeMs = Math.max(0, remainingMs);
  const totalSeconds = Math.floor(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}
