import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { ContactPickerModal } from '../components/ContactPickerModal';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionCard } from '../components/SectionCard';
import { formatDateTime, formatRemainingTime } from '../i18n/formatters';
import { useI18n } from '../i18n/I18nProvider';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useAppState } from '../storage/AppStateContext';
import type { Contact } from '../storage/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;
type PickerMode = 'sms' | 'email' | null;

export function HomeScreen({ navigation }: Props) {
  const { t, locale } = useI18n();
  const { lastCheckInAt, intervalHours, contacts, recordCheckIn } = useAppState();
  const [now, setNow] = useState(Date.now());
  const [pickerMode, setPickerMode] = useState<PickerMode>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const deadlineAt = lastCheckInAt
    ? new Date(lastCheckInAt).getTime() + intervalHours * 60 * 60 * 1000
    : null;
  const remainingMs = deadlineAt ? deadlineAt - now : intervalHours * 60 * 60 * 1000;
  const isOverdue = deadlineAt ? remainingMs <= 0 : false;

  const handleCheckIn = async () => {
    await recordCheckIn();
    Alert.alert(t('home.checkInSuccessTitle'), t('home.checkInSuccessBody'));
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
      {isOverdue ? (
        <SectionCard>
          <Text style={styles.bannerTitle}>{t('home.missedTitle')}</Text>
          <Text style={styles.bannerBody}>{t('home.missedBody')}</Text>
          <AppButton label={t('home.sendSms')} onPress={() => handleQuickAction('sms')} />
          <AppButton label={t('home.sendEmail')} onPress={() => handleQuickAction('email')} variant="secondary" />
        </SectionCard>
      ) : null}

      <SectionCard>
        <Text style={styles.heroTitle}>{t('home.checkInButton')}</Text>
        <Text style={styles.heroBody}>{t('home.heroDescription')}</Text>
        <AppButton label={t('home.checkInButton')} onPress={handleCheckIn} />
      </SectionCard>

      <SectionCard>
        <Text style={styles.label}>{t('home.lastCheckInLabel')}</Text>
        <Text style={styles.value}>
          {lastCheckInAt ? formatDateTime(lastCheckInAt, locale) : t('home.noCheckInYet')}
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.label}>{t('home.nextCheckInLabel')}</Text>
        <Text style={styles.value}>
          {t('home.remainingTemplate', {
            time: formatRemainingTime(
              remainingMs,
              {
                day: t('time.day'),
                hour: t('time.hour'),
                minute: t('time.minute')
              },
              t('time.ready')
            )
          })}
        </Text>
      </SectionCard>

      <View style={styles.row}>
        <View style={styles.half}>
          <AppButton label={t('home.historyButton')} onPress={() => navigation.navigate('History')} variant="secondary" />
        </View>
        <View style={styles.half}>
          <AppButton
            label={t('home.contactsButton')}
            onPress={() => navigation.navigate('EmergencyContacts')}
            variant="secondary"
          />
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
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#8C2F39'
  },
  bannerBody: {
    color: '#5E3137',
    marginTop: 8,
    lineHeight: 22
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C3B31'
  },
  heroBody: {
    marginTop: 8,
    color: '#5C6D64',
    lineHeight: 22
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5C6D64'
  },
  value: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '700',
    color: '#1C3B31',
    lineHeight: 28
  },
  row: {
    flexDirection: 'row',
    gap: 10
  },
  half: {
    flex: 1
  }
});
