import { createContext, useContext, useEffect, useState } from 'react';

import {
  DEFAULT_APP_STATE,
  type AppState,
  type Contact,
} from './types';
import {
  loadAppState,
  resetAppStateStorage,
  saveCheckInHistory,
  saveContacts,
  saveIntervalHours,
  saveLastCheckInAt,
  saveNotificationsEnabled,
} from './storage';

type AppStateContextValue = AppState & {
  isReady: boolean;
  recordCheckIn: () => Promise<string>;
  setIntervalSetting: (value: number) => Promise<void>;
  setNotificationsSetting: (value: boolean) => Promise<void>;
  upsertContact: (contact: Contact) => Promise<void>;
  removeContact: (contactId: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  resetAllData: () => Promise<void>;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(DEFAULT_APP_STATE);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      const stored = await loadAppState();

      if (!isMounted) {
        return;
      }

      setState(stored);
      setIsReady(true);
    };

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  const recordCheckIn = async () => {
    const checkedAt = new Date().toISOString();
    const nextHistory = [checkedAt, ...state.checkInHistory];

    setState((current) => ({
      ...current,
      lastCheckInAt: checkedAt,
      checkInHistory: nextHistory,
    }));

    await Promise.all([saveLastCheckInAt(checkedAt), saveCheckInHistory(nextHistory)]);

    return checkedAt;
  };

  const setIntervalSetting = async (value: number) => {
    setState((current) => ({ ...current, intervalHours: value }));
    await saveIntervalHours(value);
  };

  const setNotificationsSetting = async (value: boolean) => {
    setState((current) => ({ ...current, notificationsEnabled: value }));
    await saveNotificationsEnabled(value);
  };

  const upsertContact = async (contact: Contact) => {
    const existingIndex = state.contacts.findIndex((item) => item.id === contact.id);
    const nextContacts = [...state.contacts];

    if (existingIndex >= 0) {
      nextContacts[existingIndex] = contact;
    } else {
      nextContacts.unshift(contact);
    }

    setState((current) => ({ ...current, contacts: nextContacts }));
    await saveContacts(nextContacts);
  };

  const removeContact = async (contactId: string) => {
    const nextContacts = state.contacts.filter((contact) => contact.id !== contactId);
    setState((current) => ({ ...current, contacts: nextContacts }));
    await saveContacts(nextContacts);
  };

  const clearHistory = async () => {
    setState((current) => ({
      ...current,
      lastCheckInAt: null,
      checkInHistory: [],
    }));

    await Promise.all([saveLastCheckInAt(null), saveCheckInHistory([])]);
  };

  const resetAllData = async () => {
    setState(DEFAULT_APP_STATE);
    await resetAppStateStorage();
  };

  return (
    <AppStateContext.Provider
      value={{
        ...state,
        isReady,
        recordCheckIn,
        setIntervalSetting,
        setNotificationsSetting,
        upsertContact,
        removeContact,
        clearHistory,
        resetAllData,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('useAppState must be used inside AppStateProvider');
  }

  return context;
}
