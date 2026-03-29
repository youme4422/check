import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ONBOARDING_STORAGE_KEY, ONBOARDING_VERSION } from '../constants/onboarding';
import { useI18n } from '../i18n/I18nProvider';
import { EmergencyContactsScreen } from '../screens/EmergencyContactsScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { MessengerLinksScreen } from '../screens/MessengerLinksScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useAppState } from '../storage/AppStateContext';
import { syncScheduledNotifications } from '../storage/notifications';
import { useAppTheme } from '../theme/ThemeProvider';

export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  EmergencyContacts: undefined;
  MessengerLinks: undefined;
  Settings: undefined;
  History: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { isReady: i18nReady, t, locale } = useI18n();
  const appState = useAppState();
  const { theme, scheme } = useAppTheme();
  const [onboardingReady, setOnboardingReady] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadOnboarding = async () => {
      const raw = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (!mounted) {
        return;
      }

      setOnboardingDone(raw === ONBOARDING_VERSION);
      setOnboardingReady(true);
    };

    void loadOnboarding();

    return () => {
      mounted = false;
    };
  }, []);

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

  if (!i18nReady || !appState.isReady || !onboardingReady) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const navigationTheme = scheme === 'dark'
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: theme.background,
          card: theme.card,
          text: theme.text,
          border: theme.border,
          primary: theme.primary,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: theme.background,
          card: theme.card,
          text: theme.text,
          border: theme.border,
          primary: theme.primary,
        },
      };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName={onboardingDone ? 'Home' : 'Onboarding'}
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.card,
          },
          headerShadowVisible: false,
          headerTintColor: theme.text,
          headerTitleStyle: {
            fontWeight: '800',
            fontSize: 18,
          },
          headerTitleAlign: 'center',
          contentStyle: {
            backgroundColor: theme.background,
          },
        }}
      >
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: t('common.appName') }} />
        <Stack.Screen
          name="EmergencyContacts"
          component={EmergencyContactsScreen}
          options={{ title: t('contacts.title') }}
        />
        <Stack.Screen
          name="MessengerLinks"
          component={MessengerLinksScreen}
          options={{ title: t('settings.messengerLabel') }}
        />
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
