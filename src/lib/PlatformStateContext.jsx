import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { validateManifest, getManifestCoverage, PLATFORM_METADATA, invalidateManifestCache } from "./platformManifest";
import { computePlatformHealth } from "./selfHealingEngine";
import { useGuardian } from "./GuardianContext";
import { subscribeAll, getLastBroadcast } from "./platformEventBus";

/**
 * PlatformStateManager — the single observable platform state.
 *
 * Every widget inside Platform Governance Center™ consumes this context
 * instead of computing its own Platform Health. When the Self-Healing Engine
 * repairs and calls invalidateManifestCache(), the resulting
 * "platform-manifest-cache-invalidated" broadcast triggers a recompute here,
 * and all consuming widgets re-render with identical values.
 *
 * Event Flow:
 *   Analyze → Repair → Commit → Persist → Invalidate Cache
 *   → Broadcast platform-manifest-cache-invalidated
 *   → PlatformStateManager recomputes
 *   → Every widget re-renders
 */
const PlatformStateContext = createContext(null);

export function usePlatformState() {
  return useContext(PlatformStateContext);
}

export function PlatformStateProvider({ children }) {
  const guardian = useGuardian();
  const guardianPending = guardian?.pending?.length || 0;

  const computeState = useCallback(() => {
    const coverage = getManifestCoverage();
    const findings = validateManifest();
    const health = computePlatformHealth(guardianPending);
    const errors = findings.filter((f) => f.level === "error");
    const warns = findings.filter((f) => f.level === "warning");
    const infos = findings.filter((f) => f.level === "info");
    const status = errors.length > 0 ? "critical" : warns.length > 0 ? "warning" : "healthy";
    return {
      coverage,
      findings,
      warnings: findings,
      health,
      errors,
      warns,
      infos,
      status,
      totalFindings: findings.length,
      errorCount: errors.length,
      warningCount: warns.length,
      infoCount: infos.length,
      guardianPending,
      platformVersion: PLATFORM_METADATA.platformVersion,
      manifestVersion: PLATFORM_METADATA.manifestVersion,
      knowledgeVersion: PLATFORM_METADATA.knowledgeVersion,
    };
  }, [guardianPending]);

  const [state, setState] = useState(() => computeState());
  const [stateVersion, setStateVersion] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(() => new Date().toISOString());
  const [lastCommit, setLastCommit] = useState(null);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [lastRepair, setLastRepair] = useState(null);
  const [lastBroadcast, setLastBroadcast] = useState(null);
  const [subscribersUpdated, setSubscribersUpdated] = useState(0);
  const [cacheTimestamp, setCacheTimestamp] = useState(() => new Date().toISOString());

  // Subscribe to the Platform Event Bus™. Any platform-state-changing event
  // (CacheInvalidated, RepairCompleted, ManifestUpdated, KnowledgeUpdated, etc.)
  // triggers a recompute so every consuming widget re-renders with identical values.
  useEffect(() => {
    const handler = (payload) => {
      const now = new Date().toISOString();
      const last = getLastBroadcast();
      setState(computeState());
      setLastRefresh(now);
      setCacheTimestamp(now);
      setLastBroadcast(last);
      setSubscribersUpdated(last?.notifiedCount ?? 0);
      if (payload?.source === "repair") setLastRepair(now);
      if (payload?.source === "analyze") setLastAnalysis(now);
      setStateVersion((v) => v + 1);
    };
    return subscribeAll(handler);
  }, [computeState]);

  // Recompute when guardian pending count changes.
  useEffect(() => {
    setState(computeState());
    setLastRefresh(new Date().toISOString());
  }, [computeState]);

  const refreshState = useCallback(() => {
    invalidateManifestCache();
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      stateVersion,
      cacheVersion: `v${stateVersion}`,
      runtimeVersion: PLATFORM_METADATA.platformVersion,
      configVersion: PLATFORM_METADATA.configVersion,
      lastRefresh,
      lastCommit,
      lastAnalysis,
      lastRepair,
      lastBroadcast,
      subscribersUpdated,
      cacheTimestamp,
      refreshState,
    }),
    [state, stateVersion, lastRefresh, lastCommit, lastAnalysis, lastRepair, lastBroadcast, subscribersUpdated, cacheTimestamp, refreshState]
  );

  return <PlatformStateContext.Provider value={value}>{children}</PlatformStateContext.Provider>;
}