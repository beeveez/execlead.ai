import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { runGuardianScan, rollbackActivity, approveActivity, dismissActivity } from "@/lib/guardianEngine";

const GuardianContext = createContext(null);
export const useGuardian = () => useContext(GuardianContext);

const DEFAULT_INTERVAL_MIN = 5;
const STORAGE_KEY = "execlead_guardian_config";

function loadConfig() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}

export function GuardianProvider({ children }) {
  const [user, setUser] = useState(null);
  const [config, setConfig] = useState({
    intervalMin: DEFAULT_INTERVAL_MIN,
    autoResolve: true,
    enabled: true,
    ...loadConfig(),
  });
  const [status, setStatus] = useState("idle");
  const [lastScan, setLastScan] = useState(null);
  const [pending, setPending] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [brokenNavPaths, setBrokenNavPaths] = useState(new Set());
  const scanningRef = useRef(false);
  const intervalRef = useRef(null);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const saveConfig = useCallback((next) => {
    setConfig(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  }, []);

  const refreshPending = useCallback(async () => {
    try {
      const recs = await base44.entities.GuardianActivity.filter({ result: "queued" }, "-created_date", 50);
      setPending(recs || []);
    } catch {}
  }, []);

  const refreshActivity = useCallback(async () => {
    try {
      const recs = await base44.entities.GuardianActivity.list("-created_date", 50);
      setRecentActivity(recs || []);
    } catch {}
  }, []);

  const runScan = useCallback(async (trigger = "manual") => {
    if (scanningRef.current) return;
    scanningRef.current = true;
    setStatus("scanning");
    try {
      const result = await runGuardianScan({ trigger, userId: user?.id, autoResolve: config.autoResolve });
      setLastScan(result);
      setBrokenNavPaths(result.brokenNavPaths);
      await Promise.all([refreshPending(), refreshActivity()]);
    } catch {
      // silent — Guardian never disrupts the user experience
    }
    setStatus("idle");
    scanningRef.current = false;
  }, [config.autoResolve, user?.id, refreshPending, refreshActivity]);

  // Startup + post-deployment scan
  useEffect(() => {
    if (!isAdmin || !config.enabled) return;
    runScan("startup");
  }, [isAdmin, config.enabled, runScan]);

  // Configurable interval scan (default 5 min)
  useEffect(() => {
    if (!isAdmin || !config.enabled) return;
    const ms = Math.max(1, config.intervalMin) * 60 * 1000;
    intervalRef.current = setInterval(() => runScan("interval"), ms);
    return () => clearInterval(intervalRef.current);
  }, [isAdmin, config.enabled, config.intervalMin, runScan]);

  // Re-run after feature-flag updates (realtime subscription, debounced)
  useEffect(() => {
    if (!isAdmin || !config.enabled) return;
    let debounce;
    let unsub;
    try {
      unsub = base44.entities.Feature.subscribe(() => {
        clearTimeout(debounce);
        debounce = setTimeout(() => runScan("feature_update"), 5000);
      });
    } catch {}
    return () => {
      if (typeof unsub === "function") unsub();
      clearTimeout(debounce);
    };
  }, [isAdmin, config.enabled, runScan]);

  const approve = useCallback(async (activity) => {
    const ok = await approveActivity(activity, user?.id);
    if (ok) await Promise.all([refreshPending(), refreshActivity()]);
    return ok;
  }, [user?.id, refreshPending, refreshActivity]);

  const rollback = useCallback(async (activity) => {
    const ok = await rollbackActivity(activity);
    if (ok) await Promise.all([refreshPending(), refreshActivity()]);
    return ok;
  }, [refreshPending, refreshActivity]);

  const dismiss = useCallback(async (activity) => {
    const ok = await dismissActivity(activity);
    if (ok) await refreshPending();
    return ok;
  }, [refreshPending]);

  const value = {
    enabled: config.enabled && isAdmin,
    status,
    lastScan,
    pending,
    recentActivity,
    brokenNavPaths,
    config,
    saveConfig,
    runScan,
    approve,
    rollback,
    dismiss,
    refreshPending,
    refreshActivity,
  };

  return <GuardianContext.Provider value={value}>{children}</GuardianContext.Provider>;
}