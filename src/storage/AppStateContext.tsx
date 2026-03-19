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
  saveAccountId,
  saveContacts,
  saveDeadmanLastSentForCheckInAt,
  saveEmergencyMessage,
  saveIntervalHours,
  saveLastCheckInAt,
  saveMessengerChannels,
  saveMessengerLinks,
  saveNotificationsEnabled,
} from './storage';

type AppStateContextValue = AppState & {
  isReady: boolean;
  recordCheckIn: () => Promise<string>;
  setAccountIdSetting: (value: string) => Promise<void>;
  setIntervalSetting: (value: number) => Promise<void>;
  setNotificationsSetting: (value: boolean) => Promise<void>;
  setDeadmanLastSentForCheckInSetting: (value: string | null) => Promise<void>;
  setEmergencyMessageSetting: (value: string) => Promise<void>;
  setMessengerChannelsSetting: (value: AppState['messengerChannels']) => Promise<void>;
  setMessengerLinksSetting: (value: AppState['messengerLinks']) => Promise<void>;
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
      let nextState = stored;

      if (!stored.accountId) {
        const generatedAccountId = createDefaultAccountId();
        nextState = { ...stored, accountId: generatedAccountId };
        await saveAccountId(generatedAccountId);
      }

      if (!isMounted) {
        return;
      }

      setState(nextState);
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
      deadmanLastSentForCheckInAt: null,
      checkInHistory: nextHistory,
    }));

    await Promise.all([
      saveLastCheckInAt(checkedAt),
      saveDeadmanLastSentForCheckInAt(null),
      saveCheckInHistory(nextHistory),
    ]);

    return checkedAt;
  };

  const setAccountIdSetting = async (value: string) => {
    const nextValue = value
      .trim()
      .slice(0, 64)
      .replace(/[^a-zA-Z0-9._-]/g, '');
    setState((current) => ({ ...current, accountId: nextValue }));
    await saveAccountId(nextValue);
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

  const setEmergencyMessageSetting = async (value: string) => {
    const nextValue = value.trim().slice(0, 600);
    setState((current) => ({ ...current, emergencyMessage: nextValue }));
    await saveEmergencyMessage(nextValue);
  };

  const setDeadmanLastSentForCheckInSetting = async (value: string | null) => {
    setState((current) => ({ ...current, deadmanLastSentForCheckInAt: value }));
    await saveDeadmanLastSentForCheckInAt(value);
  };

  const setMessengerChannelsSetting = async (value: AppState['messengerChannels']) => {
    const next = {
      line: Boolean(value.line),
      telegram: Boolean(value.telegram),
      email: Boolean(value.email),
    };
    setState((current) => ({ ...current, messengerChannels: next }));
    await saveMessengerChannels(next);
  };

  const setMessengerLinksSetting = async (value: AppState['messengerLinks']) => {
    const next = {
      lineUserId: value.lineUserId.trim().slice(0, 128),
      telegramId: value.telegramId.trim().slice(0, 64),
      email: value.email.trim().toLowerCase().slice(0, 120),
    };

    setState((current) => ({ ...current, messengerLinks: next }));
    await saveMessengerLinks(next);
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
        setAccountIdSetting,
        setIntervalSetting,
        setNotificationsSetting,
        setDeadmanLastSentForCheckInSetting,
        setEmergencyMessageSetting,
        setMessengerChannelsSetting,
        setMessengerLinksSetting,
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

function createDefaultAccountId() {
  const seed = Math.random().toString(36).slice(2, 8);
  return `taeb-${Date.now().toString(36)}-${seed}`;
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('useAppState must be used inside AppStateProvider');
  }

  return context;
}
