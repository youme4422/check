import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { useEffect, useState } from 'react';

import { AppButton } from '../components/AppButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionCard } from '../components/SectionCard';
import { sendMessengerMessage, syncMessengerLinks } from '../features/messaging/api/messagingApi';
import type { MessengerChannel } from '../features/messaging/types';
import { useI18n } from '../i18n/I18nProvider';
import { useAppState } from '../storage/AppStateContext';
import type { Locale } from '../storage/types';

type Copy = {
  title: string;
  linkTitle: string;
  linkHelper: string;
  lineLabel: string;
  linePlaceholder: string;
  telegramLabel: string;
  telegramPlaceholder: string;
  saveLinks: string;
  saveError: string;
  saveSuccess: string;
  savePartial: string;
  messageTitle: string;
  messageLabel: string;
  messagePlaceholder: string;
  sendLine: string;
  sendTelegram: string;
  sendBoth: string;
  validationTitle: string;
  validationLinks: string;
  validationMessage: string;
  validationLineMissing: string;
  validationTelegramMissing: string;
  sendSuccess: string;
  sendError: string;
};

const COPY: Record<Locale, Copy> = {
  ko: {
    title: '메신저 전송',
    linkTitle: '메신저 ID 연동',
    linkHelper: '본인 LINE ID와 Telegram Chat ID를 저장해 두면 서버가 해당 메신저로 알림을 보낼 수 있습니다.',
    lineLabel: 'LINE User ID',
    linePlaceholder: '예: U1234567890abcdef',
    telegramLabel: 'Telegram Chat ID',
    telegramPlaceholder: '예: 123456789',
    saveLinks: '연동 저장',
    saveError: '연동 정보를 저장할 수 없습니다.',
    saveSuccess: '연동 정보가 저장되었습니다.',
    savePartial: '기기에는 저장했지만 서버 동기화는 실패했습니다. 서버 주소와 실행 상태를 확인해 주세요.',
    messageTitle: '메시지 보내기',
    messageLabel: '보낼 메시지',
    messagePlaceholder: '예: 정해진 시간 안에 체크인이 없습니다. 확인 부탁드립니다.',
    sendLine: 'LINE 보내기',
    sendTelegram: 'Telegram 보내기',
    sendBoth: '둘 다 보내기',
    validationTitle: '입력 내용을 확인해 주세요.',
    validationLinks: 'LINE 또는 Telegram ID를 하나 이상 연동해 주세요.',
    validationMessage: '보낼 메시지를 입력해 주세요.',
    validationLineMissing: 'LINE ID가 저장되지 않았습니다.',
    validationTelegramMissing: 'Telegram Chat ID가 저장되지 않았습니다.',
    sendSuccess: '메시지 전송 요청이 완료되었습니다.',
    sendError: '메시지를 전송할 수 없습니다.',
  },
  en: {
    title: 'Messenger delivery',
    linkTitle: 'Link messenger IDs',
    linkHelper:
      'Save your LINE user ID and Telegram chat ID so the server can deliver alerts to those channels.',
    lineLabel: 'LINE user ID',
    linePlaceholder: 'Example: U1234567890abcdef',
    telegramLabel: 'Telegram chat ID',
    telegramPlaceholder: 'Example: 123456789',
    saveLinks: 'Save links',
    saveError: 'Unable to save messenger links.',
    saveSuccess: 'Messenger links saved.',
    savePartial:
      'Saved on this device, but the server sync failed. Check the API URL and whether the backend is running.',
    messageTitle: 'Send message',
    messageLabel: 'Message',
    messagePlaceholder: 'Example: No check-in has been recorded. Please check in with me.',
    sendLine: 'Send LINE',
    sendTelegram: 'Send Telegram',
    sendBoth: 'Send both',
    validationTitle: 'Please check the input.',
    validationLinks: 'Link at least one LINE or Telegram ID first.',
    validationMessage: 'Please enter a message.',
    validationLineMissing: 'No LINE ID is saved yet.',
    validationTelegramMissing: 'No Telegram chat ID is saved yet.',
    sendSuccess: 'Message delivery request sent.',
    sendError: 'Unable to send the message.',
  },
  ja: {
    title: 'メッセンジャー送信',
    linkTitle: 'メッセンジャーID連携',
    linkHelper: '自分のLINE IDとTelegram Chat IDを保存すると、サーバーがそのメッセンジャーへ通知を送れます。',
    lineLabel: 'LINE User ID',
    linePlaceholder: '例: U1234567890abcdef',
    telegramLabel: 'Telegram Chat ID',
    telegramPlaceholder: '例: 123456789',
    saveLinks: '連携を保存',
    saveError: '連携情報を保存できません。',
    saveSuccess: '連携情報を保存しました。',
    savePartial: '端末には保存しましたが、サーバー同期に失敗しました。サーバーURLと起動状態を確認してください。',
    messageTitle: 'メッセージ送信',
    messageLabel: '送信するメッセージ',
    messagePlaceholder: '例: 決められた時間までにチェックインがありません。確認をお願いします。',
    sendLine: 'LINE送信',
    sendTelegram: 'Telegram送信',
    sendBoth: '両方に送信',
    validationTitle: '入力内容を確認してください。',
    validationLinks: 'LINEまたはTelegram IDを1つ以上連携してください。',
    validationMessage: '送信するメッセージを入力してください。',
    validationLineMissing: 'LINE IDが保存されていません。',
    validationTelegramMissing: 'Telegram Chat IDが保存されていません。',
    sendSuccess: 'メッセージ送信リクエストが完了しました。',
    sendError: 'メッセージを送信できません。',
  },
  es: {
    title: 'Envío por mensajería',
    linkTitle: 'Vincular IDs de mensajería',
    linkHelper: 'Guarda tu ID de LINE y tu chat ID de Telegram para que el servidor pueda enviar alertas a esos canales.',
    lineLabel: 'LINE User ID',
    linePlaceholder: 'Ejemplo: U1234567890abcdef',
    telegramLabel: 'Telegram Chat ID',
    telegramPlaceholder: 'Ejemplo: 123456789',
    saveLinks: 'Guardar vínculo',
    saveError: 'No se pueden guardar los datos de vinculación.',
    saveSuccess: 'Datos de vinculación guardados.',
    savePartial: 'Se guardó en este dispositivo, pero falló la sincronización con el servidor. Revisa la URL y el estado del servidor.',
    messageTitle: 'Enviar mensaje',
    messageLabel: 'Mensaje a enviar',
    messagePlaceholder: 'Ejemplo: No hay check-in dentro del tiempo esperado. Por favor, revísalo.',
    sendLine: 'Enviar por LINE',
    sendTelegram: 'Enviar por Telegram',
    sendBoth: 'Enviar a ambos',
    validationTitle: 'Revisa la información ingresada.',
    validationLinks: 'Vincula al menos un ID de LINE o Telegram.',
    validationMessage: 'Ingresa el mensaje que deseas enviar.',
    validationLineMissing: 'Aún no hay un ID de LINE guardado.',
    validationTelegramMissing: 'Aún no hay un Chat ID de Telegram guardado.',
    sendSuccess: 'La solicitud de envío del mensaje se completó.',
    sendError: 'No se puede enviar el mensaje.',
  },
};

export function MessengerScreen() {
  const { locale } = useI18n();
  const copy = COPY[locale];
  const { messengerProfile, setMessengerProfile } = useAppState();
  const [lineUserId, setLineUserId] = useState(messengerProfile.lineUserId);
  const [telegramChatId, setTelegramChatId] = useState(messengerProfile.telegramChatId);
  const [message, setMessage] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    setLineUserId(messengerProfile.lineUserId);
    setTelegramChatId(messengerProfile.telegramChatId);
  }, [messengerProfile.lineUserId, messengerProfile.telegramChatId]);

  const handleSaveLinks = async () => {
    const nextProfile = {
      ...messengerProfile,
      lineUserId: lineUserId.trim(),
      telegramChatId: telegramChatId.trim(),
    };

    if (!nextProfile.lineUserId && !nextProfile.telegramChatId) {
      Alert.alert(copy.validationTitle, copy.validationLinks);
      return;
    }

    setIsBusy(true);

    try {
      await setMessengerProfile(nextProfile);

      try {
        await syncMessengerLinks(nextProfile);
        Alert.alert(copy.linkTitle, copy.saveSuccess);
      } catch {
        Alert.alert(copy.linkTitle, copy.savePartial);
      }
    } catch {
      Alert.alert(copy.linkTitle, copy.saveError);
    } finally {
      setIsBusy(false);
    }
  };

  const handleSend = async (channel: MessengerChannel) => {
    const trimmedMessage = message.trim();

    if (!messengerProfile.lineUserId && !messengerProfile.telegramChatId) {
      Alert.alert(copy.validationTitle, copy.validationLinks);
      return;
    }

    if (!trimmedMessage) {
      Alert.alert(copy.validationTitle, copy.validationMessage);
      return;
    }

    if (channel !== 'telegram' && !messengerProfile.lineUserId) {
      Alert.alert(copy.validationTitle, copy.validationLineMissing);
      return;
    }

    if (channel !== 'line' && !messengerProfile.telegramChatId) {
      Alert.alert(copy.validationTitle, copy.validationTelegramMissing);
      return;
    }

    setIsBusy(true);

    try {
      await sendMessengerMessage({
        userId: messengerProfile.userId,
        channel,
        text: trimmedMessage,
      });

      Alert.alert(copy.messageTitle, copy.sendSuccess);
    } catch (error) {
      const detail = error instanceof Error ? error.message : copy.sendError;
      Alert.alert(copy.messageTitle, detail);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <ScreenContainer>
      <SectionCard>
        <Text style={styles.sectionTitle}>{copy.linkTitle}</Text>
        <Text style={styles.helper}>{copy.linkHelper}</Text>

        <Text style={styles.label}>{copy.lineLabel}</Text>
        <TextInput
          autoCapitalize="none"
          value={lineUserId}
          onChangeText={setLineUserId}
          placeholder={copy.linePlaceholder}
          placeholderTextColor="#8A9A92"
          style={styles.input}
        />

        <Text style={styles.label}>{copy.telegramLabel}</Text>
        <TextInput
          autoCapitalize="none"
          value={telegramChatId}
          onChangeText={setTelegramChatId}
          placeholder={copy.telegramPlaceholder}
          placeholderTextColor="#8A9A92"
          style={styles.input}
        />

        <AppButton label={copy.saveLinks} onPress={() => void handleSaveLinks()} disabled={isBusy} />
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>{copy.messageTitle}</Text>
        <Text style={styles.label}>{copy.messageLabel}</Text>
        <TextInput
          multiline
          value={message}
          onChangeText={setMessage}
          placeholder={copy.messagePlaceholder}
          placeholderTextColor="#8A9A92"
          style={[styles.input, styles.messageInput]}
          textAlignVertical="top"
        />

        <View style={styles.row}>
          <View style={styles.cell}>
            <AppButton
              label={copy.sendLine}
              onPress={() => void handleSend('line')}
              disabled={isBusy}
              variant="secondary"
            />
          </View>
          <View style={styles.cell}>
            <AppButton
              label={copy.sendTelegram}
              onPress={() => void handleSend('telegram')}
              disabled={isBusy}
              variant="secondary"
            />
          </View>
        </View>

        <AppButton label={copy.sendBoth} onPress={() => void handleSend('both')} disabled={isBusy} />
      </SectionCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C3B31',
  },
  helper: {
    marginTop: 6,
    color: '#607067',
    lineHeight: 22,
  },
  label: {
    marginTop: 12,
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#496158',
  },
  input: {
    borderWidth: 1,
    borderColor: '#C8D5CD',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#F9FCFA',
    color: '#1C3B31',
  },
  messageInput: {
    minHeight: 120,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  cell: {
    flex: 1,
  },
});
