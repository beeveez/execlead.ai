/**
 * EXECLEAD.AI — Enterprise Report Engine™ v2.0 — Shared Utilities
 * Colors, fonts, sanitization, and helpers used across all report sections.
 */

// ── Colors (RGB) ──
export const C = {
  dark: [15, 15, 25],
  primary: [99, 102, 241],
  primaryLight: [165, 180, 252],
  text: [30, 30, 46],
  muted: [120, 120, 128],
  border: [225, 225, 232],
  light: [245, 245, 250],
  emerald: [52, 211, 153],
  amber: [245, 158, 11],
  red: [239, 68, 68],
  blue: [59, 130, 246],
  white: [255, 255, 255],
  headerBg: [20, 20, 35],
  navy: [30, 41, 59],
  slate: [100, 116, 139],
};

export const TONE_COLOR = {
  emerald: C.emerald, success: C.emerald, pass: C.emerald, go: C.emerald,
  amber: C.amber, warning: C.amber, warn: C.amber,
  red: C.red, error: C.red, fail: C.red, critical: C.red, nogo: C.red,
  blue: C.blue, info: C.blue,
  default: C.text,
};

// ── Font Loading (Unicode Roboto — cached) ──
const FONT_SOURCES = {
  regular: [
    "https://cdn.jsdelivr.net/gh/openmaptiles/fonts@master/roboto/Roboto-Regular.ttf",
    "https://raw.githubusercontent.com/openmaptiles/fonts/master/roboto/Roboto-Regular.ttf",
  ],
  bold: [
    "https://cdn.jsdelivr.net/gh/openmaptiles/fonts@master/roboto/Roboto-Bold.ttf",
    "https://raw.githubusercontent.com/openmaptiles/fonts/master/roboto/Roboto-Bold.ttf",
  ],
};

let fontCache = null;

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function fetchWithFallback(urls) {
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const buf = await res.arrayBuffer();
        if (buf && buf.byteLength > 5000) return buf;
      }
    } catch {}
  }
  throw new Error("Unable to load Unicode font for PDF generation");
}

export async function loadFonts() {
  if (fontCache) return fontCache;
  const [regular, bold] = await Promise.all([
    fetchWithFallback(FONT_SOURCES.regular),
    fetchWithFallback(FONT_SOURCES.bold),
  ]);
  fontCache = { regular: arrayBufferToBase64(regular), bold: arrayBufferToBase64(bold) };
  return fontCache;
}

// ── Text Sanitization ──
const EMOJI_RE = /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{2300}-\u{23FF}\u{2B00}-\u{2BFF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2190}-\u{21FF}\u{2460}-\u{24FF}\u{25A0}-\u{25FF}\u{2C60}-\u{2C7F}\u{3000}-\u{303F}\u{3200}-\u{33FF}]/gu;

export function sanitize(input) {
  if (input == null) return "";
  let s = String(input);
  s = s.replace(EMOJI_RE, "");
  s = s.replace(/[\u2022\u2023\u2043\u204C\u204D\u2219\u25AA\u25CF\u25E6\u2044\u00B7\u2024]/g, "\u2022");
  s = s.replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, "-");
  s = s.replace(/[\u2018\u2019\u201A\u2032]/g, "'").replace(/[\u201C\u201D\u201E\u2033]/g, '"');
  s = s.replace(/\u2026/g, "...");
  s = s.replace(/[\u00A0\u2007\u202F\u200B-\u200F\uFEFF]/g, " ");
  s = s.replace(/[\u{10000}-\u{10FFFF}]/gu, "");
  s = s.replace(/[ \t]{2,}/g, " ");
  return s.trim();
}

// ── Utilities ──
export function safe(value, fallback = "—") {
  return value != null && value !== "" ? String(value) : fallback;
}

export function buildReportId(prefix = "RPT") {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

export function toneFromScore(score) {
  const n = Number(score) || 0;
  if (n >= 85) return "emerald";
  if (n >= 70) return "amber";
  return "red";
}

export function recommendationTone(rec) {
  if (!rec) return "default";
  const r = String(rec).toLowerCase();
  if (/go|ready|proceed|certified/i.test(r) && !/no.?go/i.test(r)) return "emerald";
  if (/no.?go|blocked|not ready/i.test(r)) return "red";
  return "amber";
}

// Simple hash for digital verification
export function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, "0");
}