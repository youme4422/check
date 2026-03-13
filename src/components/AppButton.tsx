import { Pressable, StyleSheet, Text } from 'react-native';

import { useAppTheme } from '../theme/ThemeProvider';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
};

export function AppButton({ label, onPress, variant = 'primary', disabled = false }: Props) {
  const { theme, scheme } = useAppTheme();
  const variantStyle =
    variant === 'secondary'
      ? { backgroundColor: theme.softSurface, borderColor: theme.border }
      : variant === 'danger'
        ? {
            backgroundColor: scheme === 'dark' ? '#8A3C3C' : '#C74B4B',
            borderColor: scheme === 'dark' ? '#A34B4B' : '#AF3E3E',
            shadowColor: scheme === 'dark' ? '#000000' : '#7D2323',
          }
        : {
            backgroundColor: theme.primary,
            borderColor: theme.secondary,
            shadowColor: scheme === 'dark' ? '#000000' : '#114136',
          };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        variantStyle,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === 'secondary' ? styles.secondaryLabel : null,
          { color: variant === 'secondary' ? theme.text : '#FFFFFF' },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 18,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 12,
  },
  primary: {
    backgroundColor: '#196B57',
    borderWidth: 1,
    borderColor: '#145847',
    shadowColor: '#114136',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 3,
  },
  secondary: {
    backgroundColor: '#F7FBF8',
    borderWidth: 1,
    borderColor: '#D5E4DB',
  },
  danger: {
    backgroundColor: '#C74B4B',
    borderWidth: 1,
    borderColor: '#AF3E3E',
    shadowColor: '#7D2323',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  disabled: {
    opacity: 0.42,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  secondaryLabel: {
    color: '#16392E',
  },
});
