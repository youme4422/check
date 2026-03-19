import { Alert, Linking, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useEffect, useState } from 'react';

import { AppButton } from '../components/AppButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionCard } from '../components/SectionCard';
import { useI18n } from '../i18n/I18nProvider';
import { createMessengerLinkCode, linkRecipients } from '../services/messengerApi';
import { copyText } from '../storage/copy';
import { useAppState } from '../storage/AppStateContext';
import { useAppTheme } from '../theme/ThemeProvider';

type FormState = {
  lineEnabled: boolean;
  telegramEnabled: boolean;
  emailEnabled: boolean;
  email: string;
};

const TELEGRAM_BOT_USERNAME = 'TaeB_Aiert_Bot';
const TELEGRAM_WEB_URL = `https://t.me/${TELEGRAM_BOT_USERNAME}`;
const LINE_WEB_URL = 'https://line.me';

export function MessengerLinksScreen() {
  const { t } = useI18n();
  const { theme } = useAppTheme();
  const { accountId, messengerChannels, messengerLinks, setMessengerChannelsSetting, setMessengerLinksSetting } = useAppState();
  const [form, setForm] = useState<FormState>({
    lineEnabled: false,
    telegramEnabled: false,
    emailEnabled: false,
    email: '',
  });

  useEffect(() => {
    setForm({
      lineEnabled: messengerChannels.line,
      telegramEnabled: messengerChannels.telegram,
      emailEnabled: messengerChannels.email,
      email: messengerLinks.email,
    });
  }, [messengerChannels.email, messengerChannels.line, messengerChannels.telegram, messengerLinks.email]);

  const openWithFallbacks = async (urls: string[], appLabel: string) => {
    for (const url of urls) {
      try {
        await Linking.openURL(url);
        return true;
      } catch {
        // Try next.
      }
    }

    Alert.alert('Open failed', `Could not open ${appLabel}.`);
    return false;
  };

  const openTelegram = (code?: string) => {
    const startCode = code ? encodeURIComponent(code) : '';
    const deepLink = startCode
      ? `tg://resolve?domain=${TELEGRAM_BOT_USERNAME}&start=${startCode}`
      : `tg://resolve?domain=${TELEGRAM_BOT_USERNAME}`;
    const webLink = startCode ? `${TELEGRAM_WEB_URL}?start=${startCode}` : TELEGRAM_WEB_URL;
    return openWithFallbacks([deepLink, webLink], 'Telegram');
  };

  const openLine = () => {
    return openWithFallbacks(['line://', LINE_WEB_URL], 'LINE');
  };

  const quickConnect = async (channel: 'line' | 'telegram') => {
    const normalizedAccountId = accountId.trim();
    if (!normalizedAccountId) {
      Alert.alert('Account ID is missing', 'Please restart the app and try again.');
      return;
    }

    try {
      const result = await createMessengerLinkCode({
        accountId: normalizedAccountId,
        channel,
      });

      const command = `LINK ${result.code}`;
      const copied = await copyText(command);
      const opened = channel === 'line' ? await openLine() : await openTelegram(result.code);
      if (!opened) {
        return;
      }

      Alert.alert(
        'Ready',
        copied
          ? `Paste and send this in bot chat:\n${command}`
          : `Send this in bot chat:\n${command}`
      );
    } catch {
      Alert.alert('Failed', 'Could not create link code. Check server connection.');
    }
  };

  const handleSave = async () => {
    const normalizedAccountId = accountId.trim();
    if (!normalizedAccountId) {
      Alert.alert('Please try again');
      return;
    }

    if (!form.lineEnabled && !form.telegramEnabled && !form.emailEnabled) {
      Alert.alert('Select at least one channel');
      return;
    }

    if (form.emailEnabled && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      Alert.alert('Please check email format');
      return;
    }

    await Promise.all([
      setMessengerChannelsSetting({
        line: form.lineEnabled,
        telegram: form.telegramEnabled,
        email: form.emailEnabled,
      }),
      setMessengerLinksSetting({
        lineUserId: messengerLinks.lineUserId,
        telegramId: messengerLinks.telegramId,
        email: form.email.trim(),
      }),
    ]);

    if (form.emailEnabled) {
      try {
        await linkRecipients({
          accountId: normalizedAccountId,
          lineUserId: '',
          telegramChatId: '',
          email: form.email.trim(),
        });
      } catch {
        Alert.alert('Saved locally', 'Email sync to server failed. Check server URL/status.');
        return;
      }
    }

    Alert.alert('Saved', 'Settings saved.');
  };

  return (
    <ScreenContainer>
      <SectionCard>
        <Text style={[styles.eyebrow, { color: theme.primary }]}>{t('settings.messengerLabel')}</Text>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Simple connect</Text>

        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: theme.text }]}>LINE</Text>
          <Switch
            value={form.lineEnabled}
            onValueChange={(value) => setForm((current) => ({ ...current, lineEnabled: value }))}
            trackColor={{ false: theme.border, true: theme.secondary }}
            thumbColor={form.lineEnabled ? theme.primary : theme.card}
          />
        </View>
        {form.lineEnabled ? <AppButton label="Connect LINE" onPress={() => void quickConnect('line')} /> : null}

        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: theme.text }]}>Telegram</Text>
          <Switch
            value={form.telegramEnabled}
            onValueChange={(value) => setForm((current) => ({ ...current, telegramEnabled: value }))}
            trackColor={{ false: theme.border, true: theme.secondary }}
            thumbColor={form.telegramEnabled ? theme.primary : theme.card}
          />
        </View>
        {form.telegramEnabled ? <AppButton label="Connect Telegram" onPress={() => void quickConnect('telegram')} /> : null}

        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: theme.text }]}>Email</Text>
          <Switch
            value={form.emailEnabled}
            onValueChange={(value) => setForm((current) => ({ ...current, emailEnabled: value }))}
            trackColor={{ false: theme.border, true: theme.secondary }}
            thumbColor={form.emailEnabled ? theme.primary : theme.card}
          />
        </View>
        {form.emailEnabled ? (
          <TextInput
            value={form.email}
            onChangeText={(value) => setForm((current) => ({ ...current, email: value }))}
            placeholder="alert@example.com"
            style={[styles.input, { borderColor: theme.border, backgroundColor: theme.input, color: theme.text }]}
            placeholderTextColor="#8A9A92"
            autoCapitalize="none"
            keyboardType="email-address"
            inputMode="email"
          />
        ) : null}

        <AppButton label="Save" onPress={() => void handleSave()} />
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
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 8,
  },
});
