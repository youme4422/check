import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import { loadThemeMode, saveThemeMode } from '../storage/storage';
import type { ThemeMode } from '../storage/types';
import { DARK_THEME, LIGHT_THEME, type AppTheme } from './theme';

type ThemeContextValue = {
  scheme: 'light' | 'dark';
  theme: AppTheme;
  themeMode: ThemeMode;
  setThemeMode: (value: ThemeMode) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const resolvedScheme =
    themeMode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themeMode;
  const theme = resolvedScheme === 'dark' ? DARK_THEME : LIGHT_THEME;

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      const stored = await loadThemeMode();

      if (!isMounted) {
        return;
      }

      setThemeModeState(stored);
    };

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  const setThemeMode = async (value: ThemeMode) => {
    setThemeModeState(value);
    await saveThemeMode(value);
  };

  return (
    <ThemeContext.Provider value={{ scheme: resolvedScheme, theme, themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used inside AppThemeProvider');
  }

  return context;
}
