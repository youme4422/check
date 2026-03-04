import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { I18nProvider } from './src/i18n/I18nProvider';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AppStateProvider } from './src/storage/AppStateContext';
import { configureNotificationHandler } from './src/storage/notifications';

export default function App() {
  useEffect(() => {
    void configureNotificationHandler();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <I18nProvider>
          <AppStateProvider>
            <StatusBar style="dark" />
            <AppNavigator />
          </AppStateProvider>
        </I18nProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
