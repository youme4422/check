import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { I18nProvider } from './src/i18n/I18nProvider';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AppStateProvider } from './src/storage/AppStateContext';
import { configureNotificationHandler } from './src/storage/notifications';
import { AppThemeProvider } from './src/theme/ThemeProvider';

export default function App() {
  useEffect(() => {
    void configureNotificationHandler();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppThemeProvider>
          <I18nProvider>
            <AppStateProvider>
              <AppShell />
            </AppStateProvider>
          </I18nProvider>
        </AppThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppShell() {
  return (
    <>
      <AppNavigator />
    </>
  );
}
