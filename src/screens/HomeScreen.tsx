import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { ContactPickerModal } from '../components/ContactPickerModal';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionCard } from '../components/SectionCard';
import { formatRemainingTime } from '../i18n/formatters';
import { useI18n } from '../i18n/I18nProvider';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useAppState } from '../storage/AppStateContext';
import type { Contact } from '../storage/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;
type PickerMode = 'sms' | 'email' | null;

export function HomeScreen({ navigation }: Props) {
  const { t } = useI18n();
  const { lastCheckInAt, intervalHours, contacts, recordCheckIn } = useAppState();
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

  const deadlineAt = lastCheckInAt
    ? new Date(lastCheckInAt).getTime() + intervalMs
    : null;
  const remainingMs = deadlineAt ? deadlineAt - now : intervalMs;
  const isOverdue = deadlineAt ? remainingMs <= 0 : false;

  const handleCheckIn = async () => {
    await recordCheckIn();
    const nextRemainingMs = intervalMs;

    setCheckInNotice(
      formatRemainingTime(
        nextRemainingMs,
        {
          day: t('time.day'),
          hour: t('time.hour'),
          minute: t('time.minute')
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

    const body = encodeURIComponent(t('messages.emergencyBody'));
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
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(t('home.composerErrorTitle'), t('home.composerErrorBody'));
    }
  };

  return (
    <ScreenContainer>
      {checkInNotice ? (
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>{t('home.checkInSuccessTitle')}</Text>
          <Text style={styles.noticeBody}>{checkInNotice}</Text>
        </View>
      ) : null}

      {isOverdue ? (
        <SectionCard variant="warning">
          <Text style={styles.alertPill}>Attention Needed</Text>
          <Text style={styles.bannerTitle}>{t('home.missedTitle')}</Text>
          <Text style={styles.bannerBody}>{t('home.missedBody')}</Text>
          <AppButton label={t('home.sendSms')} onPress={() => handleQuickAction('sms')} />
          <AppButton label={t('home.sendEmail')} onPress={() => handleQuickAction('email')} variant="secondary" />
        </SectionCard>
      ) : null}

      <SectionCard variant="hero">
        <Text style={styles.eyebrow}>{t('common.appName')}</Text>
        <Text style={styles.heroTitle}>{t('home.checkInButton')}</Text>
        <Text style={styles.heroBody}>{t('home.heroDescription')}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void handleCheckIn();
          }}
          style={({ pressed }) => [styles.checkInButton, pressed ? styles.checkInButtonPressed : null]}
        >
          <Text style={styles.checkInTime}>{formatClockCountdown(remainingMs)}</Text>
          <Text style={styles.checkInHint}>{t('home.checkInButton')}</Text>
        </Pressable>
      </SectionCard>

      <View style={styles.actionPanel}>
        <Text style={styles.panelLabel}>Quick Actions</Text>
        <AppButton
          label={t('home.contactsButton')}
          onPress={() => navigation.navigate('EmergencyContacts')}
          variant="secondary"
        />
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
    color: '#1A7F64'
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
    textTransform: 'uppercase'
  },
  bannerTitle: {
    marginTop: 10,
    fontSize: 21,
    fontWeight: '800',
    color: '#8C2F39'
  },
  bannerBody: {
    color: '#694148',
    marginTop: 8,
    lineHeight: 22
  },
  heroTitle: {
    marginTop: 6,
    fontSize: 28,
    fontWeight: '800',
    color: '#17362C',
    letterSpacing: -0.4
  },
  heroBody: {
    marginTop: 10,
    color: '#5A6B62',
    lineHeight: 23
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
});

function formatClockCountdown(remainingMs: number) {
  const safeMs = Math.max(0, remainingMs);
  const totalSeconds = Math.floor(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
}
