import { Alert, Linking, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { PRIVACY_POLICY_URL } from '../config/appConfig';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionCard } from '../components/SectionCard';
import { formatDateTime } from '../i18n/formatters';
import { useI18n } from '../i18n/I18nProvider';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useAppState } from '../storage/AppStateContext';
import { copyText } from '../storage/copy';
import { ensureNotificationPermissions, notificationsSupported } from '../storage/notifications';
import { DEFAULT_APP_STATE } from '../storage/types';

const INTERVAL_OPTIONS = [12, 24, 48];
const LANGUAGE_OPTIONS = [
  { value: 'ko' as const, labelKey: 'settings.languageKo' },
  { value: 'en' as const, labelKey: 'settings.languageEn' },
  { value: 'ja' as const, labelKey: 'settings.languageJa' },
  { value: 'es' as const, labelKey: 'settings.languageEs' },
];

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const { t, locale, setLocale } = useI18n();
  const {
    lastCheckInAt,
    checkInHistory,
    intervalHours,
    notificationsEnabled,
    contacts,
    messengerProfile,
    setIntervalSetting,
    setNotificationsSetting,
    resetAllData,
  } = useAppState();
  const [exportJson, setExportJson] = useState('');
  const supportsNotifications = notificationsSupported();

  const handleToggleNotifications = async (value: boolean) => {
    if (value && !supportsNotifications) {
      Alert.alert(t('settings.notificationsUnavailableTitle'), t('settings.notificationsUnavailableBody'));
      await setNotificationsSetting(false);
      return;
    }

    if (value) {
      const granted = await ensureNotificationPermissions();

      if (!granted) {
        Alert.alert(t('settings.permissionTitle'), t('settings.permissionBody'));
        await setNotificationsSetting(false);
        return;
      }
    }

    await setNotificationsSetting(value);
  };

  const handleExport = () => {
    const snapshot = JSON.stringify(
      {
        lastCheckInAt,
        checkInHistory,
        intervalHours,
        notificationsEnabled,
        contacts,
        messengerProfile,
        locale,
      },
      null,
      2
    );

    setExportJson(snapshot);
  };

  const handleCopy = async () => {
    if (!exportJson) {
      handleExport();
      return;
    }

    const copied = await copyText(exportJson);

    Alert.alert(t('settings.exportTitle'), copied ? t('settings.copySuccess') : t('settings.copyFallback'));
  };

  const handleReset = () => {
    Alert.alert(t('settings.resetConfirmTitle'), t('settings.resetConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.resetButton'),
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await resetAllData();
            await setLocale('ko');
            setExportJson(
              JSON.stringify(
                {
                  ...DEFAULT_APP_STATE,
                  locale: 'ko',
                },
                null,
                2
              )
            );
          })();
        },
      },
    ]);
  };

  const handleOpenPrivacyPolicy = async () => {
    try {
      await Linking.openURL(PRIVACY_POLICY_URL);
    } catch {
      Alert.alert(t('settings.privacyErrorTitle'), t('settings.privacyErrorBody'));
    }
  };

  return (
    <ScreenContainer>
      <SectionCard>
        <Text style={styles.eyebrow}>{t('settings.title')}</Text>
        <Text style={styles.sectionTitle}>{t('settings.intervalLabel')}</Text>
        <View style={styles.choiceRow}>
          {INTERVAL_OPTIONS.map((option) => (
            <View key={option} style={styles.choiceCell}>
              <AppButton
                label={t(`settings.interval${option}`)}
                onPress={() => {
                  void setIntervalSetting(option);
                }}
                variant={intervalHours === option ? 'primary' : 'secondary'}
              />
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard>
        <View style={styles.switchRow}>
          <View style={styles.switchLabelWrap}>
            <Text style={styles.eyebrow}>{t('settings.title')}</Text>
            <Text style={styles.sectionTitle}>{t('settings.notificationsLabel')}</Text>
            <Text style={styles.helper}>
              {supportsNotifications
                ? t('settings.notificationsHelper')
                : t('settings.notificationsExpoGoHelper')}
            </Text>
          </View>
          <Switch
            value={supportsNotifications ? notificationsEnabled : false}
            disabled={!supportsNotifications}
            onValueChange={(value) => {
              void handleToggleNotifications(value);
            }}
            trackColor={{ false: '#C8D5CD', true: '#7FD4BE' }}
            thumbColor={notificationsEnabled ? '#1A7F64' : '#F3F7F5'}
          />
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.eyebrow}>{t('settings.title')}</Text>
        <Text style={styles.sectionTitle}>{t('settings.languageLabel')}</Text>
        <View style={styles.languageGrid}>
          {LANGUAGE_OPTIONS.map((option) => (
            <View key={option.value} style={styles.languageChoiceCell}>
              <AppButton
                label={t(option.labelKey)}
                onPress={() => {
                  void setLocale(option.value);
                }}
                variant={locale === option.value ? 'primary' : 'secondary'}
              />
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={styles.eyebrow}>{t('settings.title')}</Text>
        <Text style={styles.sectionTitle}>{t('home.lastCheckInLabel')}</Text>
        <Text style={styles.helper}>
          {lastCheckInAt ? formatDateTime(lastCheckInAt, locale) : t('home.noCheckInYet')}
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={styles.eyebrow}>{t('settings.title')}</Text>
        <Text style={styles.sectionTitle}>{t('history.title')}</Text>
        <Text style={styles.helper}>{t('history.helper')}</Text>
        <AppButton
          label={t('home.historyButton')}
          onPress={() => navigation.navigate('History')}
          variant="secondary"
        />
      </SectionCard>

      <SectionCard>
        <Text style={styles.eyebrow}>{t('settings.title')}</Text>
        <Text style={styles.sectionTitle}>{t('settings.privacyTitle')}</Text>
        <Text style={styles.helper}>{t('settings.privacyHelper')}</Text>
        <AppButton label={t('settings.privacyButton')} onPress={() => void handleOpenPrivacyPolicy()} variant="secondary" />
      </SectionCard>

      <SectionCard>
        <Text style={styles.eyebrow}>{t('settings.title')}</Text>
        <Text style={styles.sectionTitle}>{t('settings.exportTitle')}</Text>
        <Text style={styles.helper}>{t('settings.exportHelper')}</Text>
        <AppButton label={t('settings.exportButton')} onPress={handleExport} />
        <AppButton label={t('settings.copyButton')} onPress={() => void handleCopy()} variant="secondary" />
        <TextInput
          editable={false}
          multiline
          selectTextOnFocus
          style={styles.exportBox}
          value={exportJson || t('settings.exportPlaceholder')}
        />
      </SectionCard>

      <SectionCard>
        <Text style={styles.eyebrow}>{t('settings.title')}</Text>
        <Text style={styles.sectionTitle}>{t('settings.resetTitle')}</Text>
        <Text style={styles.helper}>{t('settings.resetHelper')}</Text>
        <AppButton label={t('settings.resetButton')} onPress={handleReset} variant="danger" />
      </SectionCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#5E7A6E',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#17362C',
  },
  helper: {
    marginTop: 8,
    color: '#66766E',
    lineHeight: 22,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  choiceCell: {
    flex: 1,
  },
  languageGrid: {
    marginTop: 10,
    gap: 2,
  },
  languageChoiceCell: {
    width: '100%',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  switchLabelWrap: {
    flex: 1,
  },
  exportBox: {
    marginTop: 12,
    minHeight: 170,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D6E2DB',
    backgroundColor: '#F7FBF8',
    padding: 14,
    color: '#17362C',
    textAlignVertical: 'top',
  },
});
