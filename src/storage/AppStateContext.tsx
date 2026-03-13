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
const ALLOWED_INTERVALS = new Set([12, 24, 48]);
const MAX_HISTORY_ITEMS = 90;

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
    const nextHistory = [checkedAt, ...state.checkInHistory].slice(0, MAX_HISTORY_ITEMS);

    setState((current) => ({
      ...current,
      lastCheckInAt: checkedAt,
      checkInHistory: nextHistory,
    }));

    await Promise.all([saveLastCheckInAt(checkedAt), saveCheckInHistory(nextHistory)]);

    return checkedAt;
  };

  const setIntervalSetting = async (value: number) => {
    const nextValue = ALLOWED_INTERVALS.has(value) ? value : DEFAULT_APP_STATE.intervalHours;
    setState((current) => ({ ...current, intervalHours: nextValue }));
    await saveIntervalHours(nextValue);
  };

  const setNotificationsSetting = async (value: boolean) => {
    setState((current) => ({ ...current, notificationsEnabled: value }));
    await saveNotificationsEnabled(value);
  };

  const upsertContact = async (contact: Contact) => {
    const normalizedContact = {
      id: contact.id.trim(),
      name: contact.name.trim().slice(0, 80),
      phone: contact.phone.trim().slice(0, 32),
      email: contact.email.trim().toLowerCase().slice(0, 120),
    };
    const existingIndex = state.contacts.findIndex((item) => item.id === normalizedContact.id);
    const nextContacts = [...state.contacts];

    if (existingIndex >= 0) {
      nextContacts[existingIndex] = normalizedContact;
    } else {
      nextContacts.unshift(normalizedContact);
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
