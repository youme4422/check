import { Alert, StyleSheet, Text } from 'react-native';

import { AppButton } from '../components/AppButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionCard } from '../components/SectionCard';
import { formatDateTime } from '../i18n/formatters';
import { useI18n } from '../i18n/I18nProvider';
import { useAppState } from '../storage/AppStateContext';

export function HistoryScreen() {
  const { t, locale } = useI18n();
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
        <Text style={styles.title}>{t('history.title')}</Text>
        <Text style={styles.helper}>{t('history.helper')}</Text>

        {checkInHistory.length === 0 ? <Text style={styles.empty}>{t('history.empty')}</Text> : null}

        {checkInHistory.map((item) => (
          <Text key={item} style={styles.item}>
            {formatDateTime(item, locale)}
          </Text>
        ))}

        <AppButton label={t('history.clearButton')} onPress={handleClear} variant="danger" />
      </SectionCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C3B31',
  },
  helper: {
    marginTop: 6,
    color: '#607067',
    lineHeight: 22,
  },
  empty: {
    marginTop: 14,
    color: '#607067',
  },
  item: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#F9FCFA',
    color: '#1C3B31',
    fontWeight: '600',
  },
});
