import { StyleSheet, View } from 'react-native';

type Props = {
  children: React.ReactNode;
  variant?: 'default' | 'hero' | 'warning';
};

export function SectionCard({ children, variant = 'default' }: Props) {
  return <View style={[styles.card, styles[variant]]}>{children}</View>;
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
  default: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0EBE4',
  },
  hero: {
    backgroundColor: '#F4FAF6',
    borderColor: '#D5E6DB',
  },
  warning: {
    backgroundColor: '#FFF8F7',
    borderColor: '#F2D8D8',
  },
});
