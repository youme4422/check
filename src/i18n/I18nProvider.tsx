import { createContext, useContext, useEffect, useState } from 'react';

import en from '../locales/en.json';
import es from '../locales/es.json';
import ja from '../locales/ja.json';
import ko from '../locales/ko.json';
import zh from '../locales/zh.json';
import { loadLocale, saveLocale } from '../storage/storage';
import type { Locale } from '../storage/types';

const dictionaries = {
  en,
  es,
  ja,
  ko,
  zh,
} as const;

type Dictionary = (typeof dictionaries)['ko'];

type I18nContextValue = {
  isReady: boolean;
  locale: Locale;
  setLocale: (value: Locale) => Promise<void>;
  t: (key: string, values?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ko');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      const stored = await loadLocale();

      if (!isMounted) {
        return;
      }

      setLocaleState(stored);
      setIsReady(true);
    };

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  const setLocaleValue = async (value: Locale) => {
    setLocaleState(value);
    await saveLocale(value);
  };

  const translate = (key: string, values?: Record<string, string | number>) => {
    const template = getValueByPath(dictionaries[locale], key) ?? key;

    if (!values) {
      return template;
    }

    return template.replace(/\{\{(.*?)\}\}/g, (_, match: string) => {
      const token = match.trim();
      return String(values[token] ?? '');
    });
  };

  return (
    <I18nContext.Provider
      value={{
        isReady,
        locale,
        setLocale: setLocaleValue,
        t: translate,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used inside I18nProvider');
  }

  return context;
}

function getValueByPath(dictionary: Dictionary, key: string) {
  return key.split('.').reduce<unknown>((current, segment) => {
    if (typeof current !== 'object' || current === null || !(segment in current)) {
      return undefined;
    }

    return (current as Record<string, unknown>)[segment];
  }, dictionary) as string | undefined;
}
