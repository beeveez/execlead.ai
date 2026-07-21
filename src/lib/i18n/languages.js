/**
 * Language Registry™ — Supported Languages
 *
 * Canonical language: English (en)
 * All engineering terminology, governance terminology, framework names,
 * and capability names originate in English and remain consistent globally.
 *
 * Architecture supports unlimited future language expansion.
 */

export const CANONICAL_LANGUAGE = 'en';

export const LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    locale: 'en-US',
    rtl: false,
    flag: '🇺🇸',
    fontStack: "'Inter', ui-sans-serif, system-ui, sans-serif",
    phase: 1,
    canonical: true,
  },
  fil: {
    code: 'fil',
    name: 'Filipino',
    nativeName: 'Filipino',
    locale: 'fil-PH',
    rtl: false,
    flag: '🇵🇭',
    fontStack: "'Inter', ui-sans-serif, system-ui, sans-serif",
    phase: 1,
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    locale: 'es-ES',
    rtl: false,
    flag: '🇪🇸',
    fontStack: "'Inter', ui-sans-serif, system-ui, sans-serif",
    phase: 1,
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    locale: 'fr-FR',
    rtl: false,
    flag: '🇫🇷',
    fontStack: "'Inter', ui-sans-serif, system-ui, sans-serif",
    phase: 1,
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    locale: 'de-DE',
    rtl: false,
    flag: '🇩🇪',
    fontStack: "'Inter', ui-sans-serif, system-ui, sans-serif",
    phase: 1,
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    locale: 'ja-JP',
    rtl: false,
    flag: '🇯🇵',
    fontStack: "'Noto Sans JP', 'Inter', ui-sans-serif, sans-serif",
    phase: 1,
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    locale: 'ko-KR',
    rtl: false,
    flag: '🇰🇷',
    fontStack: "'Noto Sans KR', 'Inter', ui-sans-serif, sans-serif",
    phase: 1,
  },
  zh: {
    code: 'zh',
    name: 'Simplified Chinese',
    nativeName: '简体中文',
    locale: 'zh-CN',
    rtl: false,
    flag: '🇨🇳',
    fontStack: "'Noto Sans SC', 'Inter', ui-sans-serif, sans-serif",
    phase: 1,
  },
  // ── Future languages (RTL + additional) — architecture ready ──
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    locale: 'ar-SA',
    rtl: true,
    flag: '🇸🇦',
    fontStack: "'Noto Sans Arabic', 'Inter', ui-sans-serif, sans-serif",
    phase: 2,
  },
  he: {
    code: 'he',
    name: 'Hebrew',
    nativeName: 'עברית',
    locale: 'he-IL',
    rtl: true,
    flag: '🇮🇱',
    fontStack: "'Noto Sans Hebrew', 'Inter', ui-sans-serif, sans-serif",
    phase: 2,
  },
};

export const PHASE_1_LANGUAGES = Object.values(LANGUAGES).filter((l) => l.phase === 1);
export const ALL_LANGUAGES = Object.values(LANGUAGES);
export const RTL_LANGUAGES = Object.values(LANGUAGES).filter((l) => l.rtl);

export function getLanguage(code) {
  return LANGUAGES[code] || LANGUAGES[CANONICAL_LANGUAGE];
}

export function isRTL(code) {
  return !!getLanguage(code)?.rtl;
}

export function getLocale(code) {
  return getLanguage(code)?.locale || 'en-US';
}

export function getFontStack(code) {
  return getLanguage(code)?.fontStack || LANGUAGES[CANONICAL_LANGUAGE].fontStack;
}