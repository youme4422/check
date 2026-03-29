import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppButton } from '../components/AppButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionCard } from '../components/SectionCard';
import { ONBOARDING_STORAGE_KEY, ONBOARDING_VERSION } from '../constants/onboarding';
import { useI18n } from '../i18n/I18nProvider';
import type { RootStackParamList } from '../navigation/AppNavigator';
import type { Locale } from '../storage/types';
import { useAppTheme } from '../theme/ThemeProvider';

const LANGUAGE_OPTIONS: { value: Locale; label: string }[] = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
  { value: 'es', label: 'Español' },
  { value: 'zh', label: '中文' },
];

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export function OnboardingScreen({ navigation }: Props) {
  const { locale, setLocale, t } = useI18n();
  const { theme } = useAppTheme();

  const steps = [t('onboarding.step1Title'), t('onboarding.step2Title'), t('onboarding.step3Title')];

  const handleStart = async () => {
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, ONBOARDING_VERSION);
    navigation.replace('Home');
  };

  return (
    <ScreenContainer>
      <SectionCard variant="hero">
        <Text style={[styles.badge, { color: theme.primary }]}>{t('onboarding.badge')}</Text>
        <Text style={[styles.title, { color: theme.text }]}>{t('onboarding.title')}</Text>
        <Text style={[styles.subtitle, { color: theme.mutedText }]}>{t('onboarding.subtitle')}</Text>

        <View style={[styles.block, { borderColor: theme.border, backgroundColor: theme.softSurface }]}>
          <Text style={[styles.blockTitle, { color: theme.text }]}>{t('onboarding.languageTitle')}</Text>
          <Text style={[styles.blockHint, { color: theme.mutedText }]}>{t('onboarding.languageHint')}</Text>
        </View>

        <View style={styles.languageRow}>
          {LANGUAGE_OPTIONS.map((option) => {
            const selected = option.value === locale;
            return (
              <Pressable
                key={option.value}
                accessibilityRole="button"
                onPress={() => {
                  void setLocale(option.value);
                }}
                style={[
                  styles.languageChip,
                  {
                    backgroundColor: selected ? theme.primary : theme.softSurface,
                    borderColor: selected ? theme.secondary : theme.border,
                  },
                ]}
              >
                <Text style={[styles.languageChipText, { color: selected ? '#FFFFFF' : theme.text }]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.stepBox, { borderColor: theme.border, backgroundColor: theme.softSurface }]}>
          <Text style={[styles.stepHeading, { color: theme.text }]}>{t('onboarding.stepsTitle')}</Text>
          {steps.map((step, index) => (
            <View key={`step-${index + 1}`} style={styles.stepRow}>
              <View style={[styles.stepBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.stepBadgeText}>{String(index + 1)}</Text>
              </View>
              <Text style={[styles.stepTitle, { color: theme.text }]}>{step}</Text>
            </View>
          ))}
        </View>

        <AppButton label={t('onboarding.cta')} onPress={() => void handleStart()} />
      </SectionCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  badge: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 4,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  block: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  blockTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  blockHint: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
  },
  languageRow: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  languageChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  stepBox: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  stepHeading: {
    fontSize: 15,
    fontWeight: '800',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  stepTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 22,
  },
});
