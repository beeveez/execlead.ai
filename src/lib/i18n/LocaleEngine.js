/**
 * Locale Engine™ — Regional Formatting Engine™
 *
 * Uses the native Intl API for locale-aware formatting of:
 *   • Dates & Times (timezone-aware)
 *   • Numbers (thousands/decimal separators)
 *   • Currency (symbol, precision, locale)
 *   • Percentages
 *   • Relative time ("2 hours ago")
 *   • Calendar formatting
 *
 * Automatically adapts to the user's selected language locale.
 * Examples:
 *   en-US → "July 20, 2026"
 *   ja-JP → "2026年7月20日"
 *   de-DE → "20.07.2026"
 */

import { getLocale, isRTL } from './languages';
import { CURRENCIES } from './translations';

const timezoneCache = {};

/**
 * Detect the user's local timezone
 */
export function detectTimezone() {
  if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  }
  return 'UTC';
}

/**
 * Format a date in the user's locale and timezone
 * @param {Date|string|number} date
 * @param {string} langCode
 * @param {object} options — Intl.DateTimeFormat options
 */
export function formatDate(date, langCode = 'en', options = {}) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  const locale = getLocale(langCode);
  const defaults = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: detectTimezone(),
  };
  try {
    return new Intl.DateTimeFormat(locale, { ...defaults, ...options }).format(d);
  } catch {
    return new Intl.DateTimeFormat('en-US', { ...defaults, ...options }).format(d);
  }
}

/**
 * Format a date+time in the user's locale and timezone
 */
export function formatDateTime(date, langCode = 'en', options = {}) {
  return formatDate(date, langCode, {
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
}

/**
 * Format time only
 */
export function formatTime(date, langCode = 'en', options = {}) {
  return formatDate(date, langCode, {
    year: undefined,
    month: undefined,
    day: undefined,
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  });
}

/**
 * Short date format (e.g. "07/20/2026" or "2026/07/20")
 */
export function formatDateShort(date, langCode = 'en') {
  return formatDate(date, langCode, { month: '2-digit', day: '2-digit', year: 'numeric' });
}

/**
 * Format a number with locale-appropriate grouping and separators
 * @param {number} number
 * @param {string} langCode
 * @param {object} options — Intl.NumberFormat options
 */
export function formatNumber(number, langCode = 'en', options = {}) {
  if (number == null || isNaN(number)) return '';
  const locale = getLocale(langCode);
  try {
    return new Intl.NumberFormat(locale, options).format(number);
  } catch {
    return new Intl.NumberFormat('en-US', options).format(number);
  }
}

/**
 * Format a currency amount
 * @param {number} amount
 * @param {string} currencyCode — USD, SGD, PHP, EUR, GBP, JPY, AUD, CAD
 * @param {string} langCode
 */
export function formatCurrency(amount, currencyCode = 'USD', langCode = 'en') {
  if (amount == null || isNaN(amount)) return '';
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const locale = getLocale(langCode);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: currency.code === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency.code === 'JPY' ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency.symbol}${amount.toFixed(2)}`;
  }
}

/**
 * Format a percentage value
 * @param {number} value — 0 to 100 (or 0-1 if ratio=true)
 * @param {string} langCode
 * @param {boolean} ratio — if true, value is 0-1
 */
export function formatPercent(value, langCode = 'en', ratio = false) {
  if (value == null || isNaN(value)) return '';
  const v = ratio ? value : value / 100;
  const locale = getLocale(langCode);
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(v);
  } catch {
    return `${value}%`;
  }
}

/**
 * Format relative time ("2 hours ago", "in 3 days")
 * @param {Date|string|number} date
 * @param {string} langCode
 */
export function formatRelativeTime(date, langCode = 'en') {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  const now = Date.now();
  const diffSeconds = Math.round((d.getTime() - now) / 1000);
  const locale = getLocale(langCode);
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    const units = [
      ['year', 31536000],
      ['month', 2592000],
      ['week', 604800],
      ['day', 86400],
      ['hour', 3600],
      ['minute', 60],
      ['second', 1],
    ];
    for (const [unit, seconds] of units) {
      const value = Math.round(diffSeconds / seconds);
      if (Math.abs(value) >= 1 || unit === 'second') {
        return rtf.format(value, unit);
      }
    }
    return rtf.format(0, 'second');
  } catch {
    const abs = Math.abs(diffSeconds);
    if (abs < 60) return 'just now';
    if (abs < 3600) return `${Math.floor(abs / 60)} min ago`;
    if (abs < 86400) return `${Math.floor(abs / 3600)} hours ago`;
    return `${Math.floor(abs / 86400)} days ago`;
  }
}

/**
 * Get the text direction for a language code
 * @returns {'ltr'|'rtl'}
 */
export function getTextDirection(langCode = 'en') {
  return isRTL(langCode) ? 'rtl' : 'ltr';
}

/**
 * Get all available currencies
 */
export function getAvailableCurrencies() {
  return Object.values(CURRENCIES);
}

/**
 * Get user's detected timezone display name
 */
export function getTimezoneDisplayName(langCode = 'en') {
  const tz = detectTimezone();
  try {
    const locale = getLocale(langCode);
    return new Intl.DateTimeFormat(locale, { timeZoneName: 'long' })
      .formatToParts(new Date())
      .find((p) => p.type === 'timeZoneName')?.value || tz;
  } catch {
    return tz;
  }
}