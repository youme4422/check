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

  const openLineChat = async () => {
    const officialIdRaw = LINE_OFFICIAL_ACCOUNT_ID.trim();
    const officialId = officialIdRaw ? (officialIdRaw.startsWith('@') ? officialIdRaw : `@${officialIdRaw}`) : '';
    const lineIdForPath = officialId.replace('@', '');
    const urls =
      Platform.OS === 'android'
        ? [
            ...(officialId ? [`line://oaMessage/${lineIdForPath}`] : []),
            ...(officialId ? [`intent://oaMessage/${lineIdForPath}#Intent;scheme=line;package=jp.naver.line.android;end`] : []),
            ...(officialId ? [`https://line.me/R/oaMessage/${officialId}`] : []),
            ...(officialId ? [`line://ti/p/${officialId}`] : []),
            ...(officialId ? [`intent://ti/p/${officialId}#Intent;scheme=line;package=jp.naver.line.android;end`] : []),
            ...(officialId ? [`https://line.me/R/ti/p/${officialId}`] : []),
            'https://line.me',
          ]
        : [
            ...(officialId ? [`line://oaMessage/${lineIdForPath}`] : []),
            ...(officialId ? [`https://line.me/R/oaMessage/${officialId}`] : []),
            ...(officialId ? [`line://ti/p/${officialId}`] : []),
            ...(officialId ? [`https://line.me/R/ti/p/${officialId}`] : []),
            'https://line.me',
          ];

    for (const url of urls) {
      try {
        await Linking.openURL(url);
        return;
      } catch {
        // try next
      }
    }
    Alert.alert(ui.openFailedTitle, ui.openFailedBody('LINE'));
  };

  const openTelegramChat = async () => {
    const urls = [
      `tg://resolve?domain=${TELEGRAM_BOT_USERNAME}`,
      `https://t.me/${TELEGRAM_BOT_USERNAME}`,
    ];

    for (const url of urls) {
      try {
        await Linking.openURL(url);
        return;
      } catch {
        // try next
      }
    }
    Alert.alert(ui.openFailedTitle, ui.openFailedBody('Telegram'));
  };

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
        <View style={[styles.guideBox, { borderColor: theme.border, backgroundColor: theme.input }]}>
          <Text style={[styles.guideTitle, { color: theme.text }]}>{ui.guideTitle}</Text>
          <Text style={[styles.guideItem, { color: theme.mutedText }]}>{ui.guideStep1}</Text>
          <Text style={[styles.guideItem, { color: theme.mutedText }]}>{ui.guideStep2}</Text>
          <Text style={[styles.guideItem, { color: theme.mutedText }]}>{ui.guideStep3}</Text>
          <Text style={[styles.guideTip, { color: theme.primary }]}>{ui.guideTip}</Text>
        </View>

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
                <AppButton label={ui.openLineButton} variant="secondary" onPress={() => void openLineChat()} />
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
                <AppButton label={ui.openTelegramButton} variant="secondary" onPress={() => void openTelegramChat()} />
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
  guideBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  guideTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  guideItem: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  guideTip: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
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
  const uiByLocale = {
    ko: {
      guideTitle: '연결 방법 (3단계)',
      guideStep1: '1) 코드 생성',
      guideStep2: '2) 코드를 수신자에게 전달',
      guideStep3: '3) 수신자가 봇 채팅에 코드 전송',
      guideTip: '완료 후 [연결 확인]을 눌러주세요.',
      codeReadyTitle: '코드 생성 완료',
      codeReadyBody: (channel: 'line' | 'telegram', bot: string, code: string) =>
        `${channel === 'line' ? 'LINE' : `Telegram (@${bot})`} 채팅에 아래 코드를 보내주세요.\n${code}`,
      codeReadyCopiedBody: (channel: 'line' | 'telegram', bot: string, code: string) =>
        `코드가 복사되었습니다. ${channel === 'line' ? 'LINE' : `Telegram (@${bot})`} 채팅에 붙여 넣어 보내주세요.\n${code}`,
      connectedTitle: '연결 완료',
      connectedLineBody: 'LINE 연결을 확인했습니다.',
      connectedTelegramBody: 'Telegram 연결을 확인했습니다.',
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
      openLineButton: 'LINE 열기',
      openTelegramButton: 'Telegram 열기',
      openFailedTitle: '열기 실패',
      openFailedBody: (app: string) => `${app} 앱을 열 수 없습니다.`,
    },
    en: {
      guideTitle: 'How to connect (3 steps)',
      guideStep1: '1) Generate code',
      guideStep2: '2) Share code with recipient',
      guideStep3: '3) Recipient sends code in bot chat',
      guideTip: 'After that, tap [Check connection].',
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
      openLineButton: 'Open LINE',
      openTelegramButton: 'Open Telegram',
      openFailedTitle: 'Open failed',
      openFailedBody: (app: string) => `Could not open ${app}.`,
    },
    ja: {
      guideTitle: '連携方法（3ステップ）',
      guideStep1: '1) コードを生成',
      guideStep2: '2) コードを相手に共有',
      guideStep3: '3) 相手がボットチャットにコード送信',
      guideTip: '完了後に「接続確認」を押してください。',
      codeReadyTitle: 'コード作成完了',
      codeReadyBody: (channel: 'line' | 'telegram', bot: string, code: string) =>
        `${channel === 'line' ? 'LINE' : `Telegram (@${bot})`} チャットに次のコードを送信してください。\n${code}`,
      codeReadyCopiedBody: (channel: 'line' | 'telegram', bot: string, code: string) =>
        `コードをコピーしました。${channel === 'line' ? 'LINE' : `Telegram (@${bot})`} チャットに貼り付けて送信してください。\n${code}`,
      connectedTitle: '接続完了',
      connectedLineBody: 'LINE との接続を確認しました。',
      connectedTelegramBody: 'Telegram との接続を確認しました。',
      notConnectedTitle: '未接続',
      notConnectedLineBody: '生成したコードをLINEチャットに送信してから、もう一度接続確認を押してください。',
      notConnectedTelegramBody: '生成したコードをTelegramチャットに送信してから、もう一度接続確認を押してください。',
      connectCheckFailedTitle: '接続確認に失敗しました',
      connectCheckFailedBody: 'チャンネル接続状態を確認できませんでした。',
      noCodeTitle: 'コードがありません',
      noCodeBody: '先にコードを作成してください。',
      copiedTitle: 'コピー完了',
      copiedBody: 'コードをクリップボードにコピーしました。',
      copyFailedTitle: 'コピー失敗',
      copyFailedBody: 'コードを長押しして手動でコピーしてください。',
      statusLabel: '状態',
      connectedShort: '接続済み',
      notConnectedShort: '未接続',
      generateLineCodeButton: 'LINEコード作成',
      generateTelegramCodeButton: 'Telegramコード作成',
      copyLineCodeButton: 'LINEコードをコピー',
      copyTelegramCodeButton: 'Telegramコードをコピー',
      checkLineConnectionButton: 'LINE接続確認',
      checkTelegramConnectionButton: 'Telegram接続確認',
      checkingButton: '確認中...',
      codeLabel: 'コード',
      openLineButton: 'LINEを開く',
      openTelegramButton: 'Telegramを開く',
      openFailedTitle: '起動失敗',
      openFailedBody: (app: string) => `${app} を開けませんでした。`,
    },
    es: {
      guideTitle: 'Cómo conectar (3 pasos)',
      guideStep1: '1) Genera el código',
      guideStep2: '2) Comparte el código con el destinatario',
      guideStep3: '3) El destinatario envía el código en el chat del bot',
      guideTip: 'Después, toca [Comprobar conexión].',
      codeReadyTitle: 'Código listo',
      codeReadyBody: (channel: 'line' | 'telegram', bot: string, code: string) =>
        `Envía este código en el chat de ${channel === 'line' ? 'LINE' : `Telegram (@${bot})`}.\n${code}`,
      codeReadyCopiedBody: (channel: 'line' | 'telegram', bot: string, code: string) =>
        `Código copiado. Pégalo y envíalo en el chat de ${channel === 'line' ? 'LINE' : `Telegram (@${bot})`}.\n${code}`,
      connectedTitle: 'Conectado',
      connectedLineBody: 'LINE está conectado.',
      connectedTelegramBody: 'Telegram está conectado.',
      notConnectedTitle: 'Aún no conectado',
      notConnectedLineBody: 'Envía el código generado en el chat de LINE y vuelve a comprobar.',
      notConnectedTelegramBody: 'Envía el código generado en el chat de Telegram y vuelve a comprobar.',
      connectCheckFailedTitle: 'Falló la verificación',
      connectCheckFailedBody: 'No se pudo verificar la conexión del canal.',
      noCodeTitle: 'Sin código',
      noCodeBody: 'Primero genera un código.',
      copiedTitle: 'Copiado',
      copiedBody: 'El código se copió al portapapeles.',
      copyFailedTitle: 'Error al copiar',
      copyFailedBody: 'Mantén presionado el código para copiar manualmente.',
      statusLabel: 'Estado',
      connectedShort: 'Conectado',
      notConnectedShort: 'Sin conectar',
      generateLineCodeButton: 'Generar código de LINE',
      generateTelegramCodeButton: 'Generar código de Telegram',
      copyLineCodeButton: 'Copiar código de LINE',
      copyTelegramCodeButton: 'Copiar código de Telegram',
      checkLineConnectionButton: 'Comprobar LINE',
      checkTelegramConnectionButton: 'Comprobar Telegram',
      checkingButton: 'Comprobando...',
      codeLabel: 'Código',
      openLineButton: 'Abrir LINE',
      openTelegramButton: 'Abrir Telegram',
      openFailedTitle: 'No se pudo abrir',
      openFailedBody: (app: string) => `No se pudo abrir ${app}.`,
    },
    zh: {
      guideTitle: '连接方法（3步）',
      guideStep1: '1) 生成代码',
      guideStep2: '2) 将代码发给接收人',
      guideStep3: '3) 接收人在机器人聊天中发送代码',
      guideTip: '完成后请点击“检查连接”。',
      codeReadyTitle: '代码已生成',
      codeReadyBody: (channel: 'line' | 'telegram', bot: string, code: string) =>
        `请在${channel === 'line' ? 'LINE' : `Telegram (@${bot})`}聊天中发送以下代码。\n${code}`,
      codeReadyCopiedBody: (channel: 'line' | 'telegram', bot: string, code: string) =>
        `代码已复制。请粘贴并发送到${channel === 'line' ? 'LINE' : `Telegram (@${bot})`}聊天。\n${code}`,
      connectedTitle: '连接成功',
      connectedLineBody: 'LINE 已连接。',
      connectedTelegramBody: 'Telegram 已连接。',
      notConnectedTitle: '尚未连接',
      notConnectedLineBody: '请先把生成的代码发送到 LINE 聊天，然后再点一次检查连接。',
      notConnectedTelegramBody: '请先把生成的代码发送到 Telegram 聊天，然后再点一次检查连接。',
      connectCheckFailedTitle: '检查连接失败',
      connectCheckFailedBody: '无法验证频道连接状态。',
      noCodeTitle: '没有代码',
      noCodeBody: '请先生成代码。',
      copiedTitle: '已复制',
      copiedBody: '代码已复制到剪贴板。',
      copyFailedTitle: '复制失败',
      copyFailedBody: '请长按代码手动复制。',
      statusLabel: '状态',
      connectedShort: '已连接',
      notConnectedShort: '未连接',
      generateLineCodeButton: '生成 LINE 代码',
      generateTelegramCodeButton: '生成 Telegram 代码',
      copyLineCodeButton: '复制 LINE 代码',
      copyTelegramCodeButton: '复制 Telegram 代码',
      checkLineConnectionButton: '检查 LINE 连接',
      checkTelegramConnectionButton: '检查 Telegram 连接',
      checkingButton: '检查中...',
      codeLabel: '代码',
      openLineButton: '打开 LINE',
      openTelegramButton: '打开 Telegram',
      openFailedTitle: '打开失败',
      openFailedBody: (app: string) => `无法打开 ${app}。`,
    },
  } as const;

  if (locale in uiByLocale) {
    return uiByLocale[locale as keyof typeof uiByLocale];
  }

  return uiByLocale.en;
}