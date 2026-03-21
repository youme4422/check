export type AppTheme = {
  background: string;
  text: string;
  primary: string;
  secondary: string;
  card: string;
  mutedText: string;
  border: string;
  heroCard: string;
  warningCard: string;
  warningText: string;
  overlay: string;
  softSurface: string;
  input: string;
};

export const LIGHT_THEME: AppTheme = {
  background: '#F4F7F6',
  text: '#1F2933',
  primary: '#0F766E',
  secondary: '#2C9C8A',
  card: '#FFFFFF',
  mutedText: '#5F6C76',
  border: '#D7E1DD',
  heroCard: '#F9FCFB',
  warningCard: '#FFF7F5',
  warningText: '#B4534D',
  overlay: 'rgba(15, 26, 24, 0.34)',
  softSurface: '#EEF4F1',
  input: '#F8FBFA',
} as const;

export const DARK_THEME: AppTheme = {
  background: '#0F1A18',
  text: '#E8EEEC',
  primary: '#2C9C8A',
  secondary: '#0F766E',
  card: '#152321',
  mutedText: '#A8B7B3',
  border: '#243835',
  heroCard: '#12201E',
  warningCard: '#211918',
  warningText: '#F0B0AA',
  overlay: 'rgba(3, 8, 7, 0.68)',
  softSurface: '#10201D',
  input: '#10201D',
};
