/**
 * EXEC™ Intelligent Magnetic Cursor — Platform Service
 *
 * Provides platform-wide cursor context, settings management,
 * workspace color detection, and accessibility checks.
 *
 * Every component automatically inherits the cursor behavior.
 * Components can optionally control the cursor via:
 *   - data-cursor-label="Drill Down"   (hover label)
 *   - data-cursor-state="loading"     (cursor state)
 *   - data-cursor-color="#f59e0b"     (custom color override)
 *   - useEXECursor().setCursorLabel()  (programmatic)
 *   - useEXECursor().setCursorState()  (programmatic)
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const EXECursorContext = createContext(null);

const DEFAULT_SETTINGS = {
  enabled: true,
  magneticStrength: 'medium',
  cursorSize: 'medium',
  animationSpeed: 'normal',
  hoverLabels: true,
  workspaceColors: true,
};

const SETTINGS_KEY = 'exec_cursor_settings';

export const WORKSPACE_COLORS = {
  executive: '#f59e0b',
  developer: '#3b82f6',
  operations: '#e2e8f0',
  founder: '#a855f7',
  enterprise: '#10b981',
  platform: '#f59e0b',
};

export const STRENGTH_MAP = { low: 0.08, medium: 0.18, high: 0.3 };
export const SIZE_MAP = { small: 18, medium: 26, large: 36 };
export const SPEED_MAP = { slow: 0.1, normal: 0.18, fast: 0.28 };

function detectWorkspace(pathname) {
  if (pathname.startsWith('/developer')) return 'developer';
  if (pathname.startsWith('/founder')) return 'founder';
  if (pathname.startsWith('/enterprise')) return 'enterprise';
  if (pathname.startsWith('/operations')) return 'operations';
  if (pathname.startsWith('/platform')) return 'platform';
  if (pathname.startsWith('/guardian')) return 'developer';
  if (pathname.startsWith('/intelligence')) return 'executive';
  return 'executive';
}

export function EXECursorProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [cursorState, setCursorState] = useState('default');
  const [label, setLabel] = useState(null);
  const [workspace, setWorkspace] = useState('executive');
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const handler = () => setWorkspace(detectWorkspace(window.location.pathname));
    handler();
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  const setCursorLabel = useCallback((l) => setLabel(l), []);
  const setCursorStateExternal = useCallback((s) => setCursorState(s), []);

  const isDisabled = !settings.enabled || isTouchDevice || prefersReducedMotion;

  const value = {
    settings,
    updateSettings,
    cursorState,
    setCursorState: setCursorStateExternal,
    label,
    setCursorLabel,
    workspace,
    workspaceColor: WORKSPACE_COLORS[workspace] || WORKSPACE_COLORS.executive,
    isTouchDevice,
    prefersReducedMotion,
    isDisabled,
  };

  return (
    <EXECursorContext.Provider value={value}>
      {children}
    </EXECursorContext.Provider>
  );
}

export function useEXECursor() {
  return useContext(EXECursorContext);
}