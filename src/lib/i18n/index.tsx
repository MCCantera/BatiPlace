import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fragment, createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

import { EN } from './en';

export type Lang = 'fr' | 'en';

const STORE_KEY = 'batiplace.lang';

function deviceLang(): Lang {
  try {
    const locale = Platform.OS === 'web' && typeof navigator !== 'undefined' ? navigator.language : Intl.DateTimeFormat().resolvedOptions().locale;
    return locale?.toLowerCase().startsWith('en') ? 'en' : 'fr';
  } catch {
    return 'fr';
  }
}

// Current language, readable outside React (money, timeAgo, friendlyError…). Components re-render through useI18n().
let current: Lang = deviceLang();

export const getLang = () => current;
/** Locale for Intl number and date formats. */
export const locale = () => (current === 'en' ? 'en-CA' : 'fr-CA');

/**
 * Translates a French UI string. French is the source text and the key; English comes from ./en.
 * Placeholders: tr('Vos {n} premières annonces sont gratuites.', { n: 5 }).
 */
export function tr(fr: string, vars?: Record<string, string | number>) {
  return translate(current, fr, vars);
}

function translate(lang: Lang, fr: string, vars?: Record<string, string | number>) {
  let s = lang === 'en' ? (EN[fr] ?? fr) : fr;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  return s;
}

type I18nState = { lang: Lang; setLang: (l: Lang) => void; tr: typeof tr };

const I18nContext = createContext<I18nState>({ lang: current, setLang: () => {}, tr });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(current);
  const [loaded, setLoaded] = useState(false);

  const apply = useCallback((l: Lang) => {
    current = l;
    setLangState(l);
    if (Platform.OS === 'web' && typeof document !== 'undefined') document.documentElement.lang = l === 'en' ? 'en-CA' : 'fr-CA';
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(STORE_KEY)
      .then((saved) => (saved === 'fr' || saved === 'en' ? apply(saved) : apply(current)))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [apply]);

  const setLang = useCallback(
    (l: Lang) => {
      apply(l);
      AsyncStorage.setItem(STORE_KEY, l).catch(() => {});
    },
    [apply],
  );

  // `tr` captures `lang`, so it gets a new identity on each change and memoized callers (React Compiler) refresh too.
  const value = useMemo(() => ({ lang, setLang, tr: (fr: string, vars?: Record<string, string | number>) => translate(lang, fr, vars) }), [lang, setLang]);
  // Wait for the saved language, then remount the app on each change: helpers such as conditionLabel() or
  // timeAgo() read the language directly and their results may be memoized by the React Compiler.
  if (!loaded) return null;
  return (
    <I18nContext.Provider value={value}>
      <Fragment key={lang}>{children}</Fragment>
    </I18nContext.Provider>
  );
}

/** Call in every component that shows text, so it re-renders when the language changes. */
export function useI18n() {
  return useContext(I18nContext);
}
