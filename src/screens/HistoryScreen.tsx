import { Alert, StyleSheet, Text } from 'react-native';

import { AppButton } from '../components/AppButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionCard } from '../components/SectionCard';
import { formatDateTime } from '../i18n/formatters';
import { useI18n } from '../i18n/I18nProvider';
import { useAppState } from '../storage/AppStateContext';
import { useAppTheme } from '../theme/ThemeProvider';

export function HistoryScreen() {
  const { t, locale } = useI18n();
  const { theme } = useAppTheme();
  const { checkInHistory, clearHistory } = useAppState();

  const handleClear = () => {
    Alert.alert(t('history.clearConfirmTitle'), t('history.clearConfirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('history.clearButton'),
        style: 'destructive',
        onPress: () => {
          void clearHistory();
        },
      },
    ]);
  };

  return (
    <ScreenContainer>
      <SectionCard>
        <Text style={[styles.eyebrow, { color: theme.primary }]}>{t('common.appName')}</Text>
        <Text style={[styles.title, { color: theme.text }]}>{t('history.title')}</Text>
        <Text style={[styles.helper, { color: theme.mutedText }]}>{t('history.helper')}</Text>

        {checkInHistory.length === 0 ? <Text style={[styles.empty, { color: theme.mutedText }]}>{t('history.empty')}</Text> : null}

        {checkInHistory.map((item) => (
          <Text
            key={item}
            style={[
              styles.item,
              {
                backgroundColor: theme.softSurface,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
          >
            {formatDateTime(item, locale)}
          </Text>
        ))}

        <AppButton label={t('history.clearButton')} onPress={handleClear} variant="danger" />
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
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#17362C',
  },
  helper: {
    marginTop: 8,
    color: '#66766E',
    lineHeight: 22,
  },
  empty: {
    marginTop: 14,
    color: '#66766E',
  },
  item: {
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: '#F7FBF8',
    borderWidth: 1,
    borderColor: '#DCE7E0',
    color: '#17362C',
    fontWeight: '700',
  },
});
