/**
 * Language Context™ — Runtime Language Switching Provider
 *
 * Implements the Global Internationalization Framework™:
 *   • LanguageManager™ — current language state + persistence
 *   • LocaleEngine™ — date/number/currency formatting (delegated to LocaleEngine.js)
 *   • TranslationRegistry™ — key → localized text with placeholder interpolation
 *   • UserLanguagePreference™ — persists to localStorage
 *   • EnterpriseLanguagePolicy™ — org/workspace override resolution
 *
 * Language Hierarchy™ (priority — user always wins):
 *   User Preference → Workspace Preference → Organization Default → Platform Default
 *
 * Runtime switching: no logout, no page refresh required.
 * Entire platform updates dynamically via React context.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { CANONICAL_LANGUAGE, getLanguage, getLocale, isRTL, getFontStack, LANGUAGES } from './languages';
import { translations } from './translations';
import {
  formatDate, formatDateTime, formatTime, formatDateShort,
  formatNumber, formatCurrency, formatPercent, formatRelativeTime,
  getTextDirection, detectTimezone, getTimezoneDisplayName,
} from './LocaleEngine';

const STORAGE_KEY = 'execlead_language_preference';

const LanguageContext = createContext(null);

/**
 * Resolve language from hierarchy: user → workspace → org → platform default
 */
function resolveLanguage(userPref, workspacePref, orgDefault) {
  if (userPref && translations[userPref]) return userPref;
  if (workspacePref && translations[workspacePref]) return workspacePref;
  if (orgDefault && translations[orgDefault]) return orgDefault;
  return CANONICAL_LANGUAGE;
}

/**
 * Translation function with placeholder interpolation
 * t("common.welcome", { name: "John" }) → "Welcome, John"
 * Falls back to canonical (English) if key missing in target language.
 */
function translate(langCode, key, params = null) {
  const langPack = translations[langCode] || {};
  const canonicalPack = translations[CANONICAL_LANGUAGE] || {};

  let str = langPack[key];
  if (str === undefined) {
    str = canonicalPack[key];
  }
  if (str === undefined) {
    // Return the key itself as last resort (aids debugging missing translations)
    return key;
  }

  if (params && typeof str === 'string') {
    str = str.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey] !== undefined ? String(params[paramKey]) : match;
    });
  }
  return str;
}

export function LanguageProvider({ children, workspaceLanguage = null, organizationLanguage = null, allowedLanguages = null }) {
  // User preference (persisted)
  const [userLanguage, setUserLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored && translations[stored]) return stored;
      } catch { /* SSR or restricted */ }
    }
    return null; // null = use hierarchy resolution
  });

  const resolvedLang = resolveLanguage(userLanguage, workspaceLanguage, organizationLanguage);
  const lang = getLanguage(resolvedLang);

  // Apply <html lang> and dir attributes for accessibility + font loading
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = resolvedLang;
      document.documentElement.dir = isRTL(resolvedLang) ? 'rtl' : 'ltr';
      document.documentElement.style.setProperty('--font-body', getFontStack(resolvedLang));
      document.documentElement.style.setProperty('--font-heading', getFontStack(resolvedLang));
    }
  }, [resolvedLang]);

  // Filter allowed languages if enterprise policy restricts
  const effectiveAllowedLanguages = useMemo(() => {
    if (!allowedLanguages || allowedLanguages.length === 0) {
      return Object.keys(LANGUAGES);
    }
    return allowedLanguages;
  }, [allowedLanguages]);

  const setUserLanguagePreference = useCallback((langCode) => {
    if (langCode && translations[langCode]) {
      setUserLanguage(langCode);
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(STORAGE_KEY, langCode);
        } catch { /* restricted */ }
      }
    } else if (langCode === null || langCode === undefined) {
      // Reset to hierarchy default
      setUserLanguage(null);
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch { /* restricted */ }
      }
    }
  }, []);

  // Translation function bound to current language
  const t = useCallback((key, params = null) => {
    return translate(resolvedLang, key, params);
  }, [resolvedLang]);

  // Locale-bound formatting functions
  const formatDateFn = useCallback((date, options) => formatDate(date, resolvedLang, options), [resolvedLang]);
  const formatDateTimeFn = useCallback((date, options) => formatDateTime(date, resolvedLang, options), [resolvedLang]);
  const formatTimeFn = useCallback((date, options) => formatTime(date, resolvedLang, options), [resolvedLang]);
  const formatDateShortFn = useCallback((date) => formatDateShort(date, resolvedLang), [resolvedLang]);
  const formatNumberFn = useCallback((number, options) => formatNumber(number, resolvedLang, options), [resolvedLang]);
  const formatCurrencyFn = useCallback((amount, currencyCode) => formatCurrency(amount, currencyCode, resolvedLang), [resolvedLang]);
  const formatPercentFn = useCallback((value, ratio) => formatPercent(value, resolvedLang, ratio), [resolvedLang]);
  const formatRelativeTimeFn = useCallback((date) => formatRelativeTime(date, resolvedLang), [resolvedLang]);

  const value = useMemo(() => ({
    // Language state
    language: resolvedLang,
    languageMeta: lang,
    isRTL: isRTL(resolvedLang),
    dir: getTextDirection(resolvedLang),
    locale: getLocale(resolvedLang),
    timezone: detectTimezone(),
    timezoneName: getTimezoneDisplayName(resolvedLang),

    // Hierarchy info
    userLanguage,
    workspaceLanguage,
    organizationLanguage,
    canonicalLanguage: CANONICAL_LANGUAGE,

    // Language management
    setUserLanguage: setUserLanguagePreference,
    clearUserLanguage: () => setUserLanguagePreference(null),
    allowedLanguages: effectiveAllowedLanguages,

    // Translation
    t,

    // Locale formatting
    formatDate: formatDateFn,
    formatDateTime: formatDateTimeFn,
    formatTime: formatTimeFn,
    formatDateShort: formatDateShortFn,
    formatNumber: formatNumberFn,
    formatCurrency: formatCurrencyFn,
    formatPercent: formatPercentFn,
    formatRelativeTime: formatRelativeTimeFn,
  }), [
    resolvedLang, lang, userLanguage, workspaceLanguage, organizationLanguage,
    effectiveAllowedLanguages, t, formatDateFn, formatDateTimeFn, formatTimeFn,
    formatDateShortFn, formatNumberFn, formatCurrencyFn, formatPercentFn, formatRelativeTimeFn,
    setUserLanguagePreference,
  ]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * useTranslation — Primary hook for consuming localized resources
 *
 * Usage:
 *   const { t, language, formatCurrency } = useTranslation();
 *   <button>{t('common.save')}</button>
 *   <span>{formatCurrency(99.99, 'USD')}</span>
 *
 * Every visible string MUST use t(). No hardcoded strings.
 */
export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Fallback for components rendered outside provider (shouldn't happen in production)
    return {
      language: CANONICAL_LANGUAGE,
      languageMeta: getLanguage(CANONICAL_LANGUAGE),
      isRTL: false,
      dir: 'ltr',
      locale: 'en-US',
      timezone: detectTimezone(),
      t: (key, params) => translate(CANONICAL_LANGUAGE, key, params),
      formatDate: (d) => formatDate(d, CANONICAL_LANGUAGE),
      formatDateTime: (d) => formatDateTime(d, CANONICAL_LANGUAGE),
      formatTime: (d) => formatTime(d, CANONICAL_LANGUAGE),
      formatDateShort: (d) => formatDateShort(d, CANONICAL_LANGUAGE),
      formatNumber: (n) => formatNumber(n, CANONICAL_LANGUAGE),
      formatCurrency: (a, c) => formatCurrency(a, c, CANONICAL_LANGUAGE),
      formatPercent: (v, r) => formatPercent(v, CANONICAL_LANGUAGE, r),
      formatRelativeTime: (d) => formatRelativeTime(d, CANONICAL_LANGUAGE),
      setUserLanguage: () => {},
      clearUserLanguage: () => {},
    };
  }
  return ctx;
}

export default LanguageContext;