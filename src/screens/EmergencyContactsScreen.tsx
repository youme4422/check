import { Alert, StyleSheet, Text, TextInput } from 'react-native';
import { useEffect, useState } from 'react';

import { AppButton } from '../components/AppButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionCard } from '../components/SectionCard';
import { useI18n } from '../i18n/I18nProvider';
import { useAppState } from '../storage/AppStateContext';
import { useAppTheme } from '../theme/ThemeProvider';

export function EmergencyContactsScreen() {
  const { t } = useI18n();
  const { theme } = useAppTheme();
  const { emergencyMessage, setEmergencyMessageSetting } = useAppState();
  const [messageDraft, setMessageDraft] = useState(emergencyMessage || t('messages.emergencyBody'));

  useEffect(() => {
    setMessageDraft(emergencyMessage || t('messages.emergencyBody'));
  }, [emergencyMessage, t]);

  return (
    <ScreenContainer>
      <SectionCard>
        <Text style={[styles.eyebrow, { color: theme.primary }]}>{t('contacts.title')}</Text>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('contacts.messageSectionTitle')}</Text>
        <Text style={[styles.label, { color: theme.mutedText }]}>{t('contacts.messageLabel')}</Text>
        <TextInput
          value={messageDraft}
          onChangeText={setMessageDraft}
          placeholder={t('contacts.messagePlaceholder')}
          style={[
            styles.input,
            styles.messageInput,
            { borderColor: theme.border, backgroundColor: theme.input, color: theme.text },
          ]}
          multiline
          textAlignVertical="top"
          maxLength={600}
          placeholderTextColor="#8A9A92"
        />
        <AppButton
          label={t('contacts.saveMessageButton')}
          onPress={() => {
            void (async () => {
              await setEmergencyMessageSetting(messageDraft);
              Alert.alert(t('contacts.savedTitle'), t('contacts.savedBody'));
            })();
          }}
          variant="secondary"
        />
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
    marginBottom: 10,
  },
  label: {
    marginTop: 12,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    color: '#5D756B',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D6E2DB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F7FBF8',
    color: '#17362C',
  },
  messageInput: {
    minHeight: 120,
  },
});
