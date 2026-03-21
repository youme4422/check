import { ActivityIndicator, Alert, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useEffect, useState } from 'react';

import { AppButton } from '../components/AppButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionCard } from '../components/SectionCard';
import { useI18n } from '../i18n/I18nProvider';
import { createMessengerLinkCode, getMessengerLinks, linkRecipients } from '../services/messengerApi';
import { copyText } from '../storage/copy';
import { useAppState } from '../storage/AppStateContext';
import type { Locale } from '../storage/types';
import { useAppTheme } from '../theme/ThemeProvider';

type FormState = {
  lineEnabled: boolean;
  telegramEnabled: boolean;
  emailEnabled: boolean;
  email: string;
};

const TELEGRAM_BOT_USERNAME = 'TaeB_Aiert_Bot';

export function MessengerLinksScreen() {
  const { t, locale } = useI18n();
  const { theme } = useAppTheme();
  const { accountId, messengerChannels, messengerLinks, setMessengerChannelsSetting, setMessengerLinksSetting } = useAppState();
  const [isCheckingLinks, setIsCheckingLinks] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<{ line: string; telegram: string }>({ line: '', telegram: '' });
  const [form, setForm] = useState<FormState>({
    lineEnabled: false,
    telegramEnabled: false,
    emailEnabled: false,
    email: '',
  });

  const ui = getMessengerUiText(locale);

  useEffect(() => {
    setForm({
      lineEnabled: messengerChannels.line,
      telegramEnabled: messengerChannels.telegram,
      emailEnabled: messengerChannels.email,
      email: messengerLinks.email,
    });
  }, [messengerChannels.email, messengerChannels.line, messengerChannels.telegram, messengerLinks.email]);

  const generateLinkCode = async (channel: 'line' | 'telegram') => {
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

      const code = result.code;
      const copied = await copyText(code);
      setGeneratedCode((current) => ({ ...current, [channel]: code }));

      Alert.alert(
        ui.codeReadyTitle,
        copied
          ? ui.codeReadyCopiedBody(channel, TELEGRAM_BOT_USERNAME, code)
          : ui.codeReadyBody(channel, TELEGRAM_BOT_USERNAME, code)
      );
    } catch {
      Alert.alert(t('messenger.failedTitle'), t('messenger.linkCodeFailedBody'));
    }
  };

  const handleConnectChannel = async (channel: 'line' | 'telegram') => {
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

      const isConnected = channel === 'line' ? Boolean(links.lineUserId) : Boolean(links.telegramChatId);
      if (isConnected) {
        Alert.alert(ui.connectedTitle, channel === 'line' ? ui.connectedLineBody : ui.connectedTelegramBody);
      } else {
        Alert.alert(
          ui.notConnectedTitle,
          channel === 'line'
            ? ui.notConnectedLineBody
            : ui.notConnectedTelegramBody
        );
      }
    } catch {
      Alert.alert(ui.connectCheckFailedTitle, ui.connectCheckFailedBody);
    } finally {
      setIsCheckingLinks(false);
    }
  };

  const handleCopyCode = async (channel: 'line' | 'telegram') => {
    const code = channel === 'line' ? generatedCode.line : generatedCode.telegram;
    if (!code) {
      Alert.alert(ui.noCodeTitle, ui.noCodeBody);
      return;
    }

    const copied = await copyText(code);
    if (copied) {
      Alert.alert(ui.copiedTitle, ui.copiedBody);
      return;
    }

    Alert.alert(ui.copyFailedTitle, ui.copyFailedBody);
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
              {ui.statusLabel}: {messengerLinks.lineUserId ? ui.connectedShort : ui.notConnectedShort}
            </Text>
            <AppButton label={ui.generateLineCodeButton} onPress={() => void generateLinkCode('line')} />
            {generatedCode.line ? (
              <View style={styles.codeBox}>
                <Text style={[styles.codeLabel, { color: theme.mutedText }]}>{ui.codeLabel}</Text>
                <Text selectable style={[styles.codeText, { color: theme.text }]}>
                  {generatedCode.line}
                </Text>
                <AppButton
                  label={ui.copyLineCodeButton}
                  variant="secondary"
                  onPress={() => {
                    void handleCopyCode('line');
                  }}
                />
                <AppButton
                  label={isCheckingLinks ? ui.checkingButton : ui.checkLineConnectionButton}
                  disabled={isCheckingLinks}
                  onPress={() => void handleConnectChannel('line')}
                />
              </View>
            ) : null}
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
              {ui.statusLabel}: {messengerLinks.telegramId ? ui.connectedShort : ui.notConnectedShort}
            </Text>
            <AppButton label={ui.generateTelegramCodeButton} onPress={() => void generateLinkCode('telegram')} />
            {generatedCode.telegram ? (
              <View style={styles.codeBox}>
                <Text style={[styles.codeLabel, { color: theme.mutedText }]}>{ui.codeLabel}</Text>
                <Text selectable style={[styles.codeText, { color: theme.text }]}>
                  {generatedCode.telegram}
                </Text>
                <AppButton
                  label={ui.copyTelegramCodeButton}
                  variant="secondary"
                  onPress={() => {
                    void handleCopyCode('telegram');
                  }}
                />
                <AppButton
                  label={isCheckingLinks ? ui.checkingButton : ui.checkTelegramConnectionButton}
                  disabled={isCheckingLinks}
                  onPress={() => void handleConnectChannel('telegram')}
                />
              </View>
            ) : null}
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
          {isCheckingLinks ? <ActivityIndicator size="small" color={theme.primary} style={styles.loader} /> : null}
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
  codeBox: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 12,
    borderColor: '#CFDBD5',
    padding: 10,
  },
  codeText: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: 2,
  },
  codeLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
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

function getMessengerUiText(locale: Locale) {
  const byLocale = {
    ko: {
      codeReadyTitle: '코드 생성 완료',
      codeReadyBody: (channel: 'line' | 'telegram', bot: string, code: string) =>
        `${channel === 'line' ? 'LINE' : `Telegram (@${bot})`} 채팅에 아래 코드를 보내세요.\n${code}`,
      codeReadyCopiedBody: (channel: 'line' | 'telegram', bot: string, code: string) =>
        `코드가 복사되었습니다. ${channel === 'line' ? 'LINE' : `Telegram (@${bot})`} 채팅에 붙여넣어 보내세요.\n${code}`,
      connectedTitle: '연결 완료',
      connectedLineBody: 'LINE 연결이 확인되었습니다.',
      connectedTelegramBody: 'Telegram 연결이 확인되었습니다.',
      notConnectedTitle: '아직 연결되지 않음',
      notConnectedLineBody: '생성한 코드를 LINE 채팅에 보낸 뒤 다시 연결 확인을 눌러주세요.',
      notConnectedTelegramBody: '생성한 코드를 Telegram 채팅에 보낸 뒤 다시 연결 확인을 눌러주세요.',
      connectCheckFailedTitle: '연결 확인 실패',
      connectCheckFailedBody: '채널 연결 상태를 확인하지 못했습니다.',
      noCodeTitle: '코드 없음',
      noCodeBody: '먼저 코드를 생성해 주세요.',
      copiedTitle: '복사 완료',
      copiedBody: '코드가 클립보드에 복사되었습니다.',
      copyFailedTitle: '복사 실패',
      copyFailedBody: '코드를 길게 눌러 수동으로 복사해 주세요.',
      statusLabel: '상태',
      connectedShort: '연결됨',
      notConnectedShort: '미연결',
      generateLineCodeButton: 'LINE 코드 생성',
      generateTelegramCodeButton: 'Telegram 코드 생성',
      copyLineCodeButton: 'LINE 코드 복사',
      copyTelegramCodeButton: 'Telegram 코드 복사',
      checkLineConnectionButton: 'LINE 연결 확인',
      checkTelegramConnectionButton: 'Telegram 연결 확인',
      checkingButton: '확인 중...',
      codeLabel: '코드',
    },
    en: {
      codeReadyTitle: 'Code Ready',
      codeReadyBody: (channel: 'line' | 'telegram', bot: string, code: string) =>
        `Send this code in ${channel === 'line' ? 'LINE' : `Telegram (@${bot})`} chat.\n${code}`,
      codeReadyCopiedBody: (channel: 'line' | 'telegram', bot: string, code: string) =>
        `Code copied. Paste and send in ${channel === 'line' ? 'LINE' : `Telegram (@${bot})`} chat.\n${code}`,
      connectedTitle: 'Connected',
      connectedLineBody: 'LINE is connected.',
      connectedTelegramBody: 'Telegram is connected.',
      notConnectedTitle: 'Not connected yet',
      notConnectedLineBody: 'Send the generated code in LINE chat, then check again.',
      notConnectedTelegramBody: 'Send the generated code in Telegram chat, then check again.',
      connectCheckFailedTitle: 'Connect check failed',
      connectCheckFailedBody: 'Could not verify channel connection.',
      noCodeTitle: 'No code',
      noCodeBody: 'Please generate a code first.',
      copiedTitle: 'Copied',
      copiedBody: 'Code copied to clipboard.',
      copyFailedTitle: 'Copy failed',
      copyFailedBody: 'Tap and hold the code to copy manually.',
      statusLabel: 'Status',
      connectedShort: 'Connected',
      notConnectedShort: 'Not connected',
      generateLineCodeButton: 'Generate LINE code',
      generateTelegramCodeButton: 'Generate Telegram code',
      copyLineCodeButton: 'Copy LINE code',
      copyTelegramCodeButton: 'Copy Telegram code',
      checkLineConnectionButton: 'Check LINE connection',
      checkTelegramConnectionButton: 'Check Telegram connection',
      checkingButton: 'Checking...',
      codeLabel: 'Code',
    },
  } as const;

  return byLocale[locale === 'ko' ? 'ko' : 'en'];
}
