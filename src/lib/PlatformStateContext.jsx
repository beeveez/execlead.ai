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
import { useAuth } from "./AuthContext";
import { base44 } from "@/api/base44Client";

/**
 * Platform State Manager™ — Core Platform Service #7
 *
 * The single runtime source of truth for the entire platform.
 * Every widget inside Platform Governance Center™ consumes this context
 * instead of computing its own Platform Health.
 *
 * Event Flow:
 *   Platform Change → Persist → Refresh PlatformStateManager
 *   → Broadcast PlatformStateUpdated → Refresh All Subscribers
 *   → Every UI reflects identical values
 */
const PlatformStateContext = createContext(null);

export function usePlatformState() {
  return useContext(PlatformStateContext);
}

const MAX_LIVE_EVENTS = 25;

export function PlatformStateProvider({ children }) {
  const guardian = useGuardian();
  const guardianPending = guardian?.pending?.length || 0;
  const { user } = useAuth();
  const liveEventsRef = useRef([]);

  const computeState = useCallback(() => {
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
    };
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

  // Subscribe to the Platform Event Bus™. Any platform-state-changing event
  // triggers a recompute so every consuming widget re-renders with identical values.
  useEffect(() => {
    const handler = (eventName, payload) => {
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
    };
    return subscribeAll(handler);
  }, [computeState, addLiveEvent, persistStateEvent]);

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