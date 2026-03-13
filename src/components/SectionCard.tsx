import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '../theme/ThemeProvider';

type Props = {
  children: React.ReactNode;
  variant?: 'default' | 'hero' | 'warning';
};

export function SectionCard({ children, variant = 'default' }: Props) {
  const { theme, scheme } = useAppTheme();

  const variantStyle =
    variant === 'hero'
      ? { backgroundColor: theme.heroCard, borderColor: theme.border }
      : variant === 'warning'
        ? { backgroundColor: theme.warningCard, borderColor: scheme === 'dark' ? '#3B2A29' : '#F2D8D8' }
        : { backgroundColor: theme.card, borderColor: theme.border };

  return <View style={[styles.card, variantStyle]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#153128',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  default: {},
  hero: {},
  warning: {},
});
