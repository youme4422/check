import { ActivityIndicator, Alert, Linking, Platform, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useEffect, useState } from 'react';

import { AppButton } from '../components/AppButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionCard } from '../components/SectionCard';
import { LINE_OFFICIAL_ACCOUNT_ID } from '../config/appConfig';
import { useI18n } from '../i18n/I18nProvider';
import { createMessengerLinkCode, getMessengerLinks, linkRecipients } from '../services/messengerApi';
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
  const [isCheckingLinks, setIsCheckingLinks] = useState(false);
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
        // Try next fallback.
      }
    }

    Alert.alert(t('messenger.openFailedTitle'), t('messenger.openFailedBody', { app: appLabel }));
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

  const openLine = (code?: string) => {
    const officialIdRaw = LINE_OFFICIAL_ACCOUNT_ID.trim();
    const officialId = officialIdRaw ? (officialIdRaw.startsWith('@') ? officialIdRaw : `@${officialIdRaw}`) : '';
    const command = code ? `LINK ${code}` : '';
    const encodedCommand = command ? encodeURIComponent(command) : '';

    if (officialId) {
      const urls =
        Platform.OS === 'android'
          ? [
              `line://ti/p/${officialId}`,
              ...(encodedCommand ? [`https://line.me/R/msg/text/?${encodedCommand}`] : []),
              `intent://ti/p/${officialId}#Intent;scheme=line;package=jp.naver.line.android;end`,
              encodedCommand
                ? `https://line.me/R/oaMessage/${officialId}/?${encodedCommand}`
                : `https://line.me/R/ti/p/${officialId}`,
              `https://line.me/R/ti/p/${officialId}`,
            ]
          : [
              `line://ti/p/${officialId}`,
              ...(encodedCommand ? [`https://line.me/R/msg/text/?${encodedCommand}`] : []),
              encodedCommand
                ? `https://line.me/R/oaMessage/${officialId}/?${encodedCommand}`
                : `https://line.me/R/ti/p/${officialId}`,
              `https://line.me/R/ti/p/${officialId}`,
            ];
      return openWithFallbacks(urls, 'LINE');
    }

    return openWithFallbacks([LINE_WEB_URL], 'LINE');
  };

  const pollRecipientLink = async (channel: 'line' | 'telegram') => {
    const normalizedAccountId = accountId.trim();
    if (!normalizedAccountId) {
      return;
    }

    setIsCheckingLinks(true);
    try {
      for (let attempt = 0; attempt < 8; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 2500));
        const links = await getMessengerLinks(normalizedAccountId);
        const linked = channel === 'line' ? Boolean(links.lineUserId) : Boolean(links.telegramChatId);
        if (!linked) {
          continue;
        }

        await setMessengerLinksSetting({
          lineUserId: links.lineUserId,
          telegramId: links.telegramChatId,
          email: links.email || form.email.trim(),
        });

        Alert.alert('Connected', channel === 'line' ? 'LINE recipient linked.' : 'Telegram recipient linked.');
        return;
      }
    } catch {
      // Ignore polling errors.
    } finally {
      setIsCheckingLinks(false);
    }
  };

  const quickConnect = async (channel: 'line' | 'telegram') => {
    const normalizedAccountId = accountId.trim();
    if (!normalizedAccountId) {
      Alert.alert(t('messenger.accountIdMissingTitle'), t('messenger.accountIdMissingBody'));
      return;
    }

    try {
      const result = await createMessengerLinkCode({
        accountId: normalizedAccountId,
        channel,
      });

      const command = `LINK ${result.code}`;
      const copied = await copyText(command);
      const opened = channel === 'line' ? await openLine(result.code) : await openTelegram(result.code);
      if (!opened) {
        return;
      }

      Alert.alert(
        t('messenger.readyTitle'),
        copied
          ? t('messenger.readyBodyCopied', { command })
          : t('messenger.readyBody', { command })
      );
      void pollRecipientLink(channel);
    } catch {
      Alert.alert(t('messenger.failedTitle'), t('messenger.linkCodeFailedBody'));
    }
  };

  const handleLoadRecipients = async () => {
    const normalizedAccountId = accountId.trim();
    if (!normalizedAccountId) {
      Alert.alert(t('messenger.accountIdMissingTitle'), t('messenger.accountIdMissingBody'));
      return;
    }

    setIsCheckingLinks(true);
    try {
      const links = await getMessengerLinks(normalizedAccountId);
      await setMessengerLinksSetting({
        lineUserId: links.lineUserId,
        telegramId: links.telegramChatId,
        email: links.email || form.email.trim(),
      });

      if (links.email && !form.email.trim()) {
        setForm((current) => ({ ...current, email: links.email }));
      }

      Alert.alert(
        'Connection Status',
        `LINE: ${links.lineUserId ? 'Connected' : 'Not connected'}\nTelegram: ${
          links.telegramChatId ? 'Connected' : 'Not connected'
        }`
      );
    } catch {
      Alert.alert('Load Failed', 'Could not load connection status from server.');
    } finally {
      setIsCheckingLinks(false);
    }
  };

  const handleSave = async () => {
    const normalizedAccountId = accountId.trim();
    if (!normalizedAccountId) {
      Alert.alert(t('messenger.tryAgainTitle'));
      return;
    }

    if (!form.lineEnabled && !form.telegramEnabled && !form.emailEnabled) {
      Alert.alert(t('messenger.selectChannelTitle'));
      return;
    }

    if (form.emailEnabled && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      Alert.alert(t('messenger.invalidEmailTitle'));
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
        email: form.emailEnabled ? form.email.trim() : '',
      }),
    ]);

    if (form.emailEnabled && form.email.trim()) {
      try {
        await linkRecipients({
          accountId: normalizedAccountId,
          lineUserId: '',
          telegramChatId: '',
          email: form.email.trim(),
        });
      } catch {
        Alert.alert(t('messenger.savedLocallyTitle'), t('messenger.savedLocallyBody'));
        return;
      }
    }

    Alert.alert(t('messenger.savedTitle'), t('messenger.savedBody'));
  };

  return (
    <ScreenContainer>
      <SectionCard>
        <Text style={[styles.eyebrow, { color: theme.primary }]}>{t('settings.messengerLabel')}</Text>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('messenger.simpleConnectTitle')}</Text>

        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: theme.text }]}>{t('messenger.lineLabel')}</Text>
          <Switch
            value={form.lineEnabled}
            onValueChange={(value) => setForm((current) => ({ ...current, lineEnabled: value }))}
            trackColor={{ false: theme.border, true: theme.secondary }}
            thumbColor={form.lineEnabled ? theme.primary : theme.card}
          />
        </View>
        {form.lineEnabled ? (
          <View style={styles.channelBlock}>
            <Text style={[styles.helperText, { color: theme.mutedText }]}>
              Status: {messengerLinks.lineUserId ? 'Connected' : 'Not connected'}
            </Text>
            <AppButton label={t('messenger.connectLineButton')} onPress={() => void quickConnect('line')} />
          </View>
        ) : null}

        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: theme.text }]}>{t('messenger.telegramLabel')}</Text>
          <Switch
            value={form.telegramEnabled}
            onValueChange={(value) => setForm((current) => ({ ...current, telegramEnabled: value }))}
            trackColor={{ false: theme.border, true: theme.secondary }}
            thumbColor={form.telegramEnabled ? theme.primary : theme.card}
          />
        </View>
        {form.telegramEnabled ? (
          <View style={styles.channelBlock}>
            <Text style={[styles.helperText, { color: theme.mutedText }]}>
              Status: {messengerLinks.telegramId ? 'Connected' : 'Not connected'}
            </Text>
            <AppButton label={t('messenger.connectTelegramButton')} onPress={() => void quickConnect('telegram')} />
          </View>
        ) : null}

        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: theme.text }]}>{t('messenger.emailLabel')}</Text>
          <Switch
            value={form.emailEnabled}
            onValueChange={(value) => setForm((current) => ({ ...current, emailEnabled: value }))}
            trackColor={{ false: theme.border, true: theme.secondary }}
            thumbColor={form.emailEnabled ? theme.primary : theme.card}
          />
        </View>
        {form.emailEnabled ? (
          <View style={styles.channelBlock}>
            <TextInput
              value={form.email}
              onChangeText={(value) => setForm((current) => ({ ...current, email: value }))}
              placeholder={t('messenger.emailPlaceholder')}
              style={[styles.input, { borderColor: theme.border, backgroundColor: theme.input, color: theme.text }]}
              placeholderTextColor="#8A9A92"
              autoCapitalize="none"
              keyboardType="email-address"
              inputMode="email"
            />
          </View>
        ) : null}

        <View style={styles.actionButtons}>
          <AppButton
            label={isCheckingLinks ? 'Checking...' : 'Check connection status'}
            onPress={() => void handleLoadRecipients()}
            variant="secondary"
            disabled={isCheckingLinks}
          />
          {isCheckingLinks ? <ActivityIndicator size="small" color={theme.primary} style={styles.loader} /> : null}
          <View style={styles.actionSpacer} />
          <AppButton label={t('messenger.saveButton')} onPress={() => void handleSave()} />
        </View>
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
  channelBlock: {
    marginBottom: 8,
  },
  helperText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 4,
  },
  actionButtons: {
    marginTop: 8,
  },
  loader: {
    marginTop: 10,
  },
  actionSpacer: {
    height: 8,
  },
});
