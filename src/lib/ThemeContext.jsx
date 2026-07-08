import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

const ThemeContext = createContext(null);

const STORAGE_KEY = 'execlead_theme';
const PREFS_KEY = 'execlead_appearance_prefs';
const VALID_THEMES = ['dark', 'light', 'system'];
const THEME_ORDER = ['dark', 'light', 'system'];

export const THEME_OPTIONS = [
  { id: 'dark', label: 'Executive Dark', desc: 'Premium dark · gold & purple accents', icon: 'Moon' },
  { id: 'light', label: 'Executive Light', desc: 'Clean white · executive blue', icon: 'Sun' },
  { id: 'system', label: 'System Theme', desc: 'Follow your OS preference', icon: 'Monitor' },
];

const DEFAULT_PREFS = {
  reduced_motion: false,
  high_contrast: false,
  compact_mode: false,
  sidebar_density: 'comfortable',
};

function getSystemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(theme) {
  return theme === 'system' ? getSystemTheme() : theme;
}

function applyThemeClass(resolved) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (resolved === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
}

function flashTransition() {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.add('theme-transitioning');
  window.setTimeout(() => root.classList.remove('theme-transitioning'), 300);
}

function readInitialTheme() {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && VALID_THEMES.includes(stored)) return stored;
  }
  return 'dark';
}

export const ThemeProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [theme, setThemeState] = useState(readInitialTheme);
  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(readInitialTheme()));
  const [prefs, setPrefs] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(PREFS_KEY);
        if (stored) return { ...DEFAULT_PREFS, ...JSON.parse(stored) };
      } catch (e) {}
    }
    return DEFAULT_PREFS;
  });
  const syncedRef = useRef(null);

  // Resolve + apply the .dark class whenever the theme changes
  useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    applyThemeClass(resolved);
  }, [theme]);

  // React to OS preference changes when in system mode
  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const resolved = getSystemTheme();
      setResolvedTheme(resolved);
      applyThemeClass(resolved);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  // Sync from the user profile once per login (cross-device persistence)
  useEffect(() => {
    if (isAuthenticated && user?.id && syncedRef.current !== user.id) {
      syncedRef.current = user.id;
      const pref = user.appearance_theme;
      if (pref && VALID_THEMES.includes(pref)) {
        setThemeState(pref);
        try { localStorage.setItem(STORAGE_KEY, pref); } catch (e) {}
      }
    }
  }, [isAuthenticated, user?.id, user?.appearance_theme]);

  // Apply accessibility preferences as root classes / data attributes
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.toggle('reduce-motion', !!prefs.reduced_motion);
    root.classList.toggle('high-contrast', !!prefs.high_contrast);
    root.classList.toggle('compact-mode', !!prefs.compact_mode);
    root.dataset.sidebarDensity = prefs.sidebar_density;
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (e) {}
  }, [prefs]);

  const setTheme = useCallback((newTheme) => {
    if (!VALID_THEMES.includes(newTheme)) return;
    flashTransition();
    setThemeState(newTheme);
    try { localStorage.setItem(STORAGE_KEY, newTheme); } catch (e) {}
    try {
      base44.analytics.track({ eventName: 'appearance_theme_changed', properties: { theme: newTheme } });
    } catch (e) {}
    // Persist to the user profile for cross-device sync (fire-and-forget)
    base44.auth.updateMe({ appearance_theme: newTheme }).catch(() => {});
  }, []);

  const toggleTheme = useCallback(() => {
    const idx = THEME_ORDER.indexOf(theme);
    setTheme(THEME_ORDER[(idx + 1) % THEME_ORDER.length]);
  }, [theme, setTheme]);

  const updatePrefs = useCallback((updates) => {
    setPrefs((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <ThemeContext.Provider value={{
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
      prefs,
      updatePrefs,
      themeOptions: THEME_OPTIONS,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};