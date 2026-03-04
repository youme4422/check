import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';

import { useI18n } from '../i18n/I18nProvider';
import { EmergencyContactsScreen } from '../screens/EmergencyContactsScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MessengerScreen } from '../screens/MessengerScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { syncScheduledNotifications } from '../storage/notifications';
import { useAppState } from '../storage/AppStateContext';

export type RootStackParamList = {
  Home: undefined;
  EmergencyContacts: undefined;
  Settings: undefined;
  History: undefined;
  Messenger: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { isReady: i18nReady, t, locale } = useI18n();
  const appState = useAppState();

  useEffect(() => {
    if (!appState.isReady) {
      return;
    }

    void syncScheduledNotifications({
      lastCheckInAt: appState.lastCheckInAt,
      intervalHours: appState.intervalHours,
      notificationsEnabled: appState.notificationsEnabled,
      locale,
    });
  }, [
    appState.isReady,
    appState.intervalHours,
    appState.lastCheckInAt,
    appState.notificationsEnabled,
    locale,
  ]);

  if (!i18nReady || !appState.isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1A7F64" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerShadowVisible: false,
          headerTintColor: '#16392E',
          headerTitleStyle: {
            fontWeight: '800',
            fontSize: 18,
          },
          headerTitleAlign: 'center',
          contentStyle: {
            backgroundColor: '#EEF4F0',
          },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: t('common.appName') }} />
        <Stack.Screen
          name="EmergencyContacts"
          component={EmergencyContactsScreen}
          options={{ title: t('contacts.title') }}
        />
        <Stack.Screen name="Messenger" component={MessengerScreen} options={{ title: 'Messenger' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: t('settings.title') }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: t('history.title') }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF4F0',
  },
});
