import { Alert, Linking, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';

import { AppButton } from '../components/AppButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionCard } from '../components/SectionCard';
import { useI18n } from '../i18n/I18nProvider';
import { useAppState } from '../storage/AppStateContext';
import type { Contact } from '../storage/types';

type FormState = {
  id: string | null;
  name: string;
  phone: string;
  email: string;
};

const EMPTY_FORM: FormState = {
  id: null,
  name: '',
  phone: '',
  email: '',
};

export function EmergencyContactsScreen() {
  const { t } = useI18n();
  const { contacts, upsertContact, removeContact } = useAppState();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const handleSave = async () => {
    const validationError = validate(form, t);

    if (validationError) {
      Alert.alert(t('contacts.validationTitle'), validationError);
      return;
    }

    const nextContact: Contact = {
      id: form.id ?? String(Date.now()),
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
    };

    await upsertContact(nextContact);
    setForm(EMPTY_FORM);

    Alert.alert(t('contacts.savedTitle'), form.id ? t('contacts.updatedBody') : t('contacts.savedBody'));
  };

  const handleDelete = (contact: Contact) => {
    Alert.alert(t('contacts.deleteConfirmTitle'), t('contacts.deleteConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          void removeContact(contact.id);
          if (form.id === contact.id) {
            setForm(EMPTY_FORM);
          }
        },
      },
    ]);
  };

  const openQuickMessage = async (contact: Contact, mode: 'sms' | 'email') => {
    const body = encodeURIComponent(t('messages.emergencyBody'));
    const subject = encodeURIComponent(t('messages.emergencySubject'));

    try {
      if (mode === 'sms') {
        if (!contact.phone.trim()) {
          Alert.alert(t('contacts.validationTitle'), t('home.missingPhone'));
          return;
        }

        await Linking.openURL(`sms:${contact.phone}?body=${body}`);
        return;
      }

      if (!contact.email.trim()) {
        Alert.alert(t('contacts.validationTitle'), t('home.missingEmail'));
        return;
      }

      await Linking.openURL(`mailto:${contact.email}?subject=${subject}&body=${body}`);
    } catch {
      Alert.alert(t('home.composerErrorTitle'), t('home.composerErrorBody'));
    }
  };

  return (
    <ScreenContainer>
      <SectionCard>
        <Text style={styles.sectionTitle}>
          {form.id ? t('contacts.editSectionTitle') : t('contacts.addSectionTitle')}
        </Text>

        <Text style={styles.label}>{t('contacts.nameLabel')}</Text>
        <TextInput
          value={form.name}
          onChangeText={(value) => setForm((current) => ({ ...current, name: value }))}
          placeholder={t('contacts.namePlaceholder')}
          style={styles.input}
          placeholderTextColor="#8A9A92"
        />

        <Text style={styles.label}>{t('contacts.phoneLabel')}</Text>
        <TextInput
          value={form.phone}
          onChangeText={(value) => setForm((current) => ({ ...current, phone: value }))}
          placeholder={t('contacts.phonePlaceholder')}
          style={styles.input}
          keyboardType="phone-pad"
          inputMode="tel"
          placeholderTextColor="#8A9A92"
        />

        <Text style={styles.label}>{t('contacts.emailLabel')}</Text>
        <TextInput
          value={form.email}
          onChangeText={(value) => setForm((current) => ({ ...current, email: value }))}
          placeholder={t('contacts.emailPlaceholder')}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          inputMode="email"
          placeholderTextColor="#8A9A92"
        />

        <AppButton label={t('contacts.saveButton')} onPress={handleSave} />
        {form.id ? (
          <AppButton label={t('contacts.cancelEditButton')} onPress={() => setForm(EMPTY_FORM)} variant="secondary" />
        ) : null}
      </SectionCard>

      <SectionCard>
        <Text style={styles.sectionTitle}>{t('contacts.savedContactsTitle')}</Text>

        {contacts.length === 0 ? <Text style={styles.empty}>{t('contacts.empty')}</Text> : null}

        {contacts.map((contact) => (
          <View key={contact.id} style={styles.contactCard}>
            <Text style={styles.contactName}>{contact.name}</Text>
            <Text style={styles.contactMeta}>{contact.phone || t('contacts.noPhone')}</Text>
            <Text style={styles.contactMeta}>{contact.email || t('contacts.noEmail')}</Text>

            <View style={styles.buttonRow}>
              <View style={styles.buttonCell}>
                <AppButton label={t('contacts.editButton')} onPress={() => setForm(contact)} variant="secondary" />
              </View>
              <View style={styles.buttonCell}>
                <AppButton
                  label={t('contacts.deleteButton')}
                  onPress={() => handleDelete(contact)}
                  variant="danger"
                />
              </View>
            </View>

            <View style={styles.buttonRow}>
              <View style={styles.buttonCell}>
                <AppButton
                  label={t('contacts.quickSmsButton')}
                  onPress={() => {
                    void openQuickMessage(contact, 'sms');
                  }}
                  variant="secondary"
                />
              </View>
              <View style={styles.buttonCell}>
                <AppButton
                  label={t('contacts.quickEmailButton')}
                  onPress={() => {
                    void openQuickMessage(contact, 'email');
                  }}
                  variant="secondary"
                />
              </View>
            </View>
          </View>
        ))}
      </SectionCard>
    </ScreenContainer>
  );
}

function validate(form: FormState, t: (key: string) => string) {
  if (!form.name.trim()) {
    return t('contacts.validationNameRequired');
  }

  if (!form.phone.trim() && !form.email.trim()) {
    return t('contacts.validationContactRequired');
  }

  if (form.phone.trim() && !/^[0-9+\-() ]{7,20}$/.test(form.phone.trim())) {
    return t('contacts.validationPhoneInvalid');
  }

  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    return t('contacts.validationEmailInvalid');
  }

  return '';
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C3B31',
    marginBottom: 8,
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
  empty: {
    marginTop: 6,
    color: '#607067',
    lineHeight: 22,
  },
  contactCard: {
    marginTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D8E2DC',
    paddingTop: 14,
  },
  contactName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C3B31',
  },
  contactMeta: {
    marginTop: 4,
    color: '#607067',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  buttonCell: {
    flex: 1,
  },
});
