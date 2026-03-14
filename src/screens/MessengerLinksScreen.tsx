import { Alert, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useEffect, useState } from 'react';

import { AppButton } from '../components/AppButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionCard } from '../components/SectionCard';
import { useI18n } from '../i18n/I18nProvider';
import { linkRecipients } from '../services/messengerApi';
import { useAppState } from '../storage/AppStateContext';
import { useAppTheme } from '../theme/ThemeProvider';

type FormState = {
  accountId: string;
  line: boolean;
  whatsapp: boolean;
  telegram: boolean;
  email: boolean;
  lineUserId: string;
  whatsappId: string;
  telegramId: string;
  emailValue: string;
};

export function MessengerLinksScreen() {
  const { t } = useI18n();
  const { theme } = useAppTheme();
  const {
    accountId,
    messengerChannels,
    messengerLinks,
    setAccountIdSetting,
    setMessengerChannelsSetting,
    setMessengerLinksSetting,
  } = useAppState();
  const [form, setForm] = useState<FormState>({
    accountId: '',
    line: false,
    whatsapp: false,
    telegram: false,
    email: false,
    lineUserId: '',
    whatsappId: '',
    telegramId: '',
    emailValue: '',
  });

  useEffect(() => {
    setForm({
      accountId,
      line: messengerChannels.line,
      whatsapp: messengerChannels.whatsapp,
      telegram: messengerChannels.telegram,
      email: messengerChannels.email,
      lineUserId: messengerLinks.lineUserId,
      whatsappId: messengerLinks.whatsappId,
      telegramId: messengerLinks.telegramId,
      emailValue: messengerLinks.email,
    });
  }, [accountId, messengerChannels, messengerLinks]);

  const handleSave = async () => {
    const normalizedAccountId = form.accountId.trim();

    if (!normalizedAccountId) {
      Alert.alert('확인', '계정 ID를 입력해 주세요.');
      return;
    }

    await Promise.all([
      setAccountIdSetting(normalizedAccountId),
      setMessengerChannelsSetting({
        line: form.line,
        whatsapp: form.whatsapp,
        telegram: form.telegram,
        email: form.email,
      }),
      setMessengerLinksSetting({
        lineUserId: form.lineUserId,
        whatsappId: form.whatsappId,
        telegramId: form.telegramId,
        email: form.emailValue,
      }),
    ]);

    try {
      await linkRecipients({
        accountId: normalizedAccountId,
        lineUserId: form.line && form.lineUserId.trim() ? form.lineUserId : '',
        telegramChatId: form.telegram && form.telegramId.trim() ? form.telegramId : '',
        email: form.email && form.emailValue.trim() ? form.emailValue : '',
        whatsappTo: form.whatsapp && form.whatsappId.trim() ? form.whatsappId : '',
      });
      Alert.alert('저장 완료', '메신저 설정이 저장되고 서버에 등록되었습니다.');
    } catch {
      Alert.alert('저장됨', '앱에는 저장됐지만 서버 등록은 실패했습니다. 서버 주소/상태를 확인해 주세요.');
    }
  };

  return (
    <ScreenContainer>
      <SectionCard>
        <Text style={[styles.eyebrow, { color: theme.primary }]}>{t('settings.messengerLabel')}</Text>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>계정 및 채널</Text>

        <Text style={[styles.label, { color: theme.mutedText }]}>계정 ID</Text>
        <TextInput
          value={form.accountId}
          onChangeText={(value) => setForm((current) => ({ ...current, accountId: value }))}
          placeholder="예: my-account-01"
          style={[styles.input, { borderColor: theme.border, backgroundColor: theme.input, color: theme.text }]}
          placeholderTextColor="#8A9A92"
          autoCapitalize="none"
        />

        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: theme.text }]}>{t('settings.messengerLine')}</Text>
          <Switch
            value={form.line}
            onValueChange={(value) => setForm((current) => ({ ...current, line: value }))}
            trackColor={{ false: theme.border, true: theme.secondary }}
            thumbColor={form.line ? theme.primary : theme.card}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: theme.text }]}>{t('settings.messengerWhatsApp')}</Text>
          <Switch
            value={form.whatsapp}
            onValueChange={(value) => setForm((current) => ({ ...current, whatsapp: value }))}
            trackColor={{ false: theme.border, true: theme.secondary }}
            thumbColor={form.whatsapp ? theme.primary : theme.card}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: theme.text }]}>{t('settings.messengerTelegram')}</Text>
          <Switch
            value={form.telegram}
            onValueChange={(value) => setForm((current) => ({ ...current, telegram: value }))}
            trackColor={{ false: theme.border, true: theme.secondary }}
            thumbColor={form.telegram ? theme.primary : theme.card}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: theme.text }]}>{t('settings.messengerEmail')}</Text>
          <Switch
            value={form.email}
            onValueChange={(value) => setForm((current) => ({ ...current, email: value }))}
            trackColor={{ false: theme.border, true: theme.secondary }}
            thumbColor={form.email ? theme.primary : theme.card}
          />
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={[styles.eyebrow, { color: theme.primary }]}>{t('settings.messengerLabel')}</Text>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>수신 대상 등록</Text>

        {form.line ? (
          <>
            <Text style={[styles.label, { color: theme.mutedText }]}>LINE User ID</Text>
            <TextInput
              value={form.lineUserId}
              onChangeText={(value) => setForm((current) => ({ ...current, lineUserId: value }))}
              placeholder="예: Uxxxxxxxxxxxx"
              style={[styles.input, { borderColor: theme.border, backgroundColor: theme.input, color: theme.text }]}
              placeholderTextColor="#8A9A92"
              autoCapitalize="none"
            />
          </>
        ) : null}

        {form.whatsapp ? (
          <>
            <Text style={[styles.label, { color: theme.mutedText }]}>WhatsApp Number</Text>
            <TextInput
              value={form.whatsappId}
              onChangeText={(value) => setForm((current) => ({ ...current, whatsappId: value }))}
              placeholder="예: +821012345678"
              style={[styles.input, { borderColor: theme.border, backgroundColor: theme.input, color: theme.text }]}
              placeholderTextColor="#8A9A92"
              autoCapitalize="none"
            />
          </>
        ) : null}

        {form.telegram ? (
          <>
            <Text style={[styles.label, { color: theme.mutedText }]}>Telegram Chat ID</Text>
            <TextInput
              value={form.telegramId}
              onChangeText={(value) => setForm((current) => ({ ...current, telegramId: value }))}
              placeholder="예: 123456789"
              style={[styles.input, { borderColor: theme.border, backgroundColor: theme.input, color: theme.text }]}
              placeholderTextColor="#8A9A92"
              autoCapitalize="none"
            />
          </>
        ) : null}

        {form.email ? (
          <>
            <Text style={[styles.label, { color: theme.mutedText }]}>Email</Text>
            <TextInput
              value={form.emailValue}
              onChangeText={(value) => setForm((current) => ({ ...current, emailValue: value }))}
              placeholder="예: hello@example.com"
              style={[styles.input, { borderColor: theme.border, backgroundColor: theme.input, color: theme.text }]}
              placeholderTextColor="#8A9A92"
              autoCapitalize="none"
              keyboardType="email-address"
              inputMode="email"
            />
          </>
        ) : null}

        {!form.line && !form.whatsapp && !form.telegram && !form.email ? (
          <Text style={[styles.helper, { color: theme.mutedText }]}>
            채널을 활성화하면 아래에 수신 대상 입력칸이 표시됩니다.
          </Text>
        ) : null}

        <AppButton label="저장" onPress={() => void handleSave()} />
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
  label: {
    marginTop: 12,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  helper: {
    marginTop: 8,
    lineHeight: 22,
  },
});
