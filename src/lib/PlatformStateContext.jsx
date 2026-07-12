import React, {
  createContext, useContext, useState, useEffect, useCallback, useMemo, useRef,
} from "react";
import {
  validateManifest, getManifestCoverage, PLATFORM_METADATA, invalidateManifestCache,
} from "./platformManifest";
import { computePlatformHealth } from "./selfHealingEngine";
import { useGuardian } from "./GuardianContext";
import { subscribeAll, getLastBroadcast, getSubscriberCount } from "./platformEventBus";
import { computeReadinessIndex } from "./platformReadinessIndex";
import { runKnowledgeSync } from "./execKnowledgeSyncEngine";
import { useAuth } from "./AuthContext";
import { base44 } from "@/api/base44Client";

/**
 * Platform State Manager™ — Core Platform Service #7
 *
 * The single runtime source of truth for the entire platform.
 *
 * Safety guarantees:
 *   • usePlatformState() NEVER returns null — returns SAFE_DEFAULT_STATE
 *   • computeState() is wrapped in try/catch — returns safe defaults on failure
 *   • Auto-recovery retries state computation every 3s while in safe mode
 *   • safeMode flag exposed so consumers can render recovery UI
 */
const PlatformStateContext = createContext(null);

// ── SAFE DEFAULT STATE ──
// Used when PlatformStateManager cannot initialize or context is null.
// Never assume PlatformState exists — always fall back to these healthy defaults.
const SAFE_DEFAULT_STATE = {
  coverage: {
    routeCoverage: 100, modules: 0, routes: 0, indexedRoutes: 0,
    relevantRoutes: 0, workspaces: 0, frameworks: 0, knowledgePacks: 0,
    aiPersonas: 0, capabilities: 0, activeCapabilities: 0, futureCapabilities: 0,
    subscriptions: 0, featureFlags: 0, liveFeatures: 0, betaFeatures: 0,
  },
  findings: [],
  warnings: [],
  health: {
    overall: 100, manifestCoverage: 100, knowledgeCoverage: 100, routeCoverage: 100,
    entityHealth: 100, guardianHealth: 100, featureFlagHealth: 100,
    deploymentHealth: 100, apiHealth: 100, errors: 0, warnings: 0, infos: 0,
  },
  errors: [],
  warns: [],
  infos: [],
  status: "healthy",
  totalFindings: 0,
  errorCount: 0,
  warningCount: 0,
  infoCount: 0,
  guardianPending: 0,
  readiness: { overall: 100, label: "Enterprise Ready", signals: [] },
  platformVersion: PLATFORM_METADATA.platformVersion,
  manifestVersion: PLATFORM_METADATA.manifestVersion,
  knowledgeVersion: PLATFORM_METADATA.knowledgeVersion,
  frameworkVersion: PLATFORM_METADATA.frameworkVersion,
  configVersion: PLATFORM_METADATA.configVersion,
  environment: PLATFORM_METADATA.environment,
  buildNumber: PLATFORM_METADATA.buildNumber,
  releaseVersion: PLATFORM_METADATA.releaseVersion,
  databaseHealth: 100,
  cacheHealth: 100,
  queueHealth: 100,
  backgroundJobs: 0,
  apiHealth: 100,
  safeMode: true,
  stateVersion: 0,
  runtimeStateVersion: 0,
  cacheVersion: "v0",
  runtimeVersion: PLATFORM_METADATA.platformVersion,
  lastRefresh: null,
  lastCommit: null,
  lastAnalysis: null,
  lastRepair: null,
  lastKnowledgeSync: null,
  lastGuardianScan: null,
  lastDeployment: null,
  lastBroadcast: null,
  subscribersUpdated: 0,
  cacheTimestamp: null,
  liveEvents: [],
  refreshState: () => {},
};

/**
 * Consume platform state. NEVER returns null — returns safe defaults
 * if the PlatformStateProvider hasn't mounted or has crashed.
 */
export function usePlatformState() {
  const ctx = useContext(PlatformStateContext);
  return ctx || SAFE_DEFAULT_STATE;
}

const MAX_LIVE_EVENTS = 25;

export function PlatformStateProvider({ children }) {
  const guardian = useGuardian();
  const guardianPending = guardian?.pending?.length || 0;
  const { user } = useAuth();
  const liveEventsRef = useRef([]);

  // ── COMPUTE STATE (wrapped in try/catch) ──
  // If any manifest validation function throws, return safe defaults
  // and set safeMode=true so auto-recovery can retry.
  const computeState = useCallback(() => {
    try {
      const coverage = getManifestCoverage();
      const findings = validateManifest();
      const health = computePlatformHealth(guardianPending);
      const errors = findings.filter((f) => f.level === "error");
      const warns = findings.filter((f) => f.level === "warning");
      const infos = findings.filter((f) => f.level === "info");
      const status = errors.length > 0 ? "critical" : warns.length > 0 ? "warning" : "healthy";
      const readiness = computeReadinessIndex(health, guardianPending);
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
        readiness,
        platformVersion: PLATFORM_METADATA.platformVersion,
        manifestVersion: PLATFORM_METADATA.manifestVersion,
        knowledgeVersion: PLATFORM_METADATA.knowledgeVersion,
        frameworkVersion: PLATFORM_METADATA.frameworkVersion,
        configVersion: PLATFORM_METADATA.configVersion,
        environment: PLATFORM_METADATA.environment,
        buildNumber: PLATFORM_METADATA.buildNumber,
        releaseVersion: PLATFORM_METADATA.releaseVersion,
        databaseHealth: health.entityHealth,
        cacheHealth: 100,
        queueHealth: 100,
        backgroundJobs: 0,
        apiHealth: health.apiHealth,
        safeMode: false,
      };
    } catch (e) {
      console.error("[PlatformStateManager] computeState failed — entering safe mode:", e);
      return { ...SAFE_DEFAULT_STATE, guardianPending, safeMode: true };
    }
  }, [guardianPending]);

  const [state, setState] = useState(() => computeState());
  const [stateVersion, setStateVersion] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(() => new Date().toISOString());
  const [lastCommit, setLastCommit] = useState(null);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [lastRepair, setLastRepair] = useState(null);
  const [lastKnowledgeSync, setLastKnowledgeSync] = useState(null);
  const [lastGuardianScan, setLastGuardianScan] = useState(null);
  const [lastDeployment, setLastDeployment] = useState(null);
  const [lastBroadcast, setLastBroadcast] = useState(null);
  const [subscribersUpdated, setSubscribersUpdated] = useState(0);
  const [cacheTimestamp, setCacheTimestamp] = useState(() => new Date().toISOString());
  const [liveEvents, setLiveEvents] = useState([]);

  const addLiveEvent = useCallback((event, payload) => {
    const entry = {
      event,
      timestamp: new Date().toISOString(),
      source: payload?.source || "system",
    };
    liveEventsRef.current = [entry, ...liveEventsRef.current].slice(0, MAX_LIVE_EVENTS);
    setLiveEvents([...liveEventsRef.current]);
  }, []);

  const persistStateEvent = useCallback((event, payload, currentState) => {
    if (!currentState) return;
    try {
      base44.entities.PlatformStateEvent.create({
        trigger: event,
        source: payload?.source || "system",
        platform_version: currentState.platformVersion,
        manifest_version: currentState.manifestVersion,
        coverage: currentState.coverage?.routeCoverage ?? 0,
        health: currentState.health?.overall ?? 0,
        warnings: currentState.totalFindings ?? 0,
        errors: currentState.errorCount ?? 0,
        execution_time_ms: 0,
        user_id: user?.id || "system",
        user_name: user?.full_name || "System",
      });
    } catch {}
  }, [user]);

  // ── AUTO-RECOVERY ──
  // If safeMode is true, retry computing state every 3 seconds.
  // This automatically rebuilds PlatformState without user intervention.
  useEffect(() => {
    if (!state.safeMode) return;
    const timer = setTimeout(() => {
      const newState = computeState();
      setState(newState);
      if (!newState.safeMode) {
        setLastRefresh(new Date().toISOString());
        setCacheTimestamp(new Date().toISOString());
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [state.safeMode, computeState]);

  // Subscribe to the Platform Event Bus™.
  useEffect(() => {
    const handler = (eventName, payload) => {
      try {
        const now = new Date().toISOString();
        const last = getLastBroadcast();
        const newState = computeState();
        setState(newState);
        setLastRefresh(now);
        setCacheTimestamp(now);
        setLastBroadcast(last);
        setSubscribersUpdated(getSubscriberCount());

        if (payload?.source === "repair" || eventName === "SelfHealingCompleted") {
          setLastRepair(now);
          persistStateEvent("SelfHealingCompleted", payload, newState);
        }
        if (payload?.source === "analyze" || eventName === "ManifestUpdated") {
          setLastAnalysis(now);
        }
        if (eventName === "KnowledgeSyncCompleted" || eventName === "KnowledgeUpdated") {
          setLastKnowledgeSync(now);
          persistStateEvent(eventName, payload, newState);
        }
        if (eventName === "RegistrySynchronizationCompleted") {
          persistStateEvent("RegistrySynchronizationCompleted", payload, newState);
        }
        if (eventName === "GovernancePipelineCompleted") {
          persistStateEvent("GovernancePipelineCompleted", payload, newState);
        }
        if (eventName === "GuardianCompleted") {
          setLastGuardianScan(now);
        }
        if (eventName === "DeploymentCompleted") {
          setLastDeployment(now);
          persistStateEvent(eventName, payload, newState);
        }
        if (eventName === "PlatformCommitted") {
          setLastCommit(now);
          persistStateEvent(eventName, payload, newState);
        }

        addLiveEvent(eventName, payload);
        setStateVersion((v) => v + 1);
      } catch (e) {
        console.error("[PlatformStateManager] Event handler failed:", e);
      }
    };
    return subscribeAll(handler);
  }, [computeState, addLiveEvent, persistStateEvent]);

  // Recompute when guardian pending count changes.
  useEffect(() => {
    setState(computeState());
    setLastRefresh(new Date().toISOString());
  }, [computeState]);

  // ── AUTOMATIC KNOWLEDGE SYNCHRONIZATION ──
  // After significant platform events, EXEC™ automatically synchronizes
  // its knowledge so every AI persona understands the latest platform state.
  // Debounced 5s to avoid rapid-fire syncs during batch changes.
  useEffect(() => {
    const TRIGGER_EVENTS = [
      "PlatformCommitted", "ManifestUpdated", "DeploymentCompleted",
      "KnowledgeUpdated", "RegistrySynchronizationCompleted", "GuardianCompleted",
    ];
    let debounceTimer = null;
    const unsub = subscribeAll((eventName) => {
      if (!TRIGGER_EVENTS.includes(eventName)) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        try {
          runKnowledgeSync();
          setLastKnowledgeSync(new Date().toISOString());
        } catch (e) {
          console.error("[PlatformStateManager] Auto knowledge sync failed:", e);
        }
      }, 5000);
    });
    return () => {
      unsub();
      clearTimeout(debounceTimer);
    };
  }, []);

  const refreshState = useCallback(() => {
    try {
      invalidateManifestCache();
    } catch (e) {
      console.error("[PlatformStateManager] refreshState failed:", e);
    }
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      stateVersion,
      runtimeStateVersion: stateVersion,
      cacheVersion: `v${stateVersion}`,
      runtimeVersion: PLATFORM_METADATA.platformVersion,
      lastRefresh,
      lastCommit,
      lastAnalysis,
      lastRepair,
      lastKnowledgeSync,
      lastGuardianScan,
      lastDeployment,
      lastBroadcast,
      subscribersUpdated,
      cacheTimestamp,
      liveEvents,
      refreshState,
    }),
    [
      state, stateVersion, lastRefresh, lastCommit, lastAnalysis, lastRepair,
      lastKnowledgeSync, lastGuardianScan, lastDeployment, lastBroadcast,
      subscribersUpdated, cacheTimestamp, liveEvents, refreshState,
    ]
  );

  return (
    <PlatformStateContext.Provider value={value}>
      {children}
    </PlatformStateContext.Provider>
  );
}