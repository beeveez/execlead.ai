import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { usePlatformState } from "./PlatformStateContext";
import { useGuardian } from "./GuardianContext";
import {
  computePlatformReadiness,
  subscribeToReadiness,
  getReadinessState,
} from "./platformReadinessEngine";

/**
 * Platform Readiness Context™
 * ------------------------------
 * Provides the single runtime readiness state to the entire app.
 *
 * Every page that needs readiness data consumes this context —
 * no page calculates readiness independently.
 */
const PlatformReadinessContext = createContext(null);

const SAFE_STATE = {
  overallReadiness: 0,
  deploymentReadiness: 0,
  platformCertification: "not_certified",
  launchReadiness: "no_go",
  productionDecision: "no_go",
  confidence: 0,
  blockingIssues: [],
  warnings: [],
  inputs: [],
  timestamp: null,
};

export function usePlatformReadiness() {
  const ctx = useContext(PlatformReadinessContext);
  return ctx || SAFE_STATE;
}

export function PlatformReadinessProvider({ children }) {
  const platformState = usePlatformState();
  const guardian = useGuardian();
  const guardianPending = guardian?.pending?.length || 0;

  // Gather raw inputs from platform state
  const rawInputs = useMemo(() => {
    const health = platformState.health || {};
    const coverage = platformState.coverage || {};

    return {
      foundation_certification: {
        score: health.entityHealth ?? 100,
        metadata: { source: "platform_state" },
      },
      guardian: {
        score: guardianPending === 0 ? 100 : Math.max(0, 100 - guardianPending * 10),
        metadata: { pending: guardianPending },
      },
      knowledge_health: {
        score: health.knowledgeCoverage ?? 100,
        metadata: { source: "platform_state" },
      },
      runtime_health: {
        score: health.overall ?? 100,
        metadata: { source: "platform_state" },
      },
      security: {
        score: 100,
        metadata: { source: "default", note: "Security intelligence not yet wired" },
      },
      performance: {
        score: 100,
        metadata: { source: "default", note: "Performance engine not yet wired" },
      },
      scalability: {
        score: 100,
        metadata: { source: "default", note: "Scalability engine not yet wired" },
      },
      commercial_readiness: {
        score: 100,
        metadata: { source: "default", note: "Commercial readiness not yet wired" },
      },
      architecture_audit: {
        score: coverage.routeCoverage ?? 100,
        metadata: { source: "platform_state" },
      },
      platform_intelligence: {
        score: 100,
        metadata: { source: "default", note: "Platform intelligence not yet wired" },
      },
      observability: {
        score: health.apiHealth ?? 100,
        metadata: { source: "platform_state" },
      },
    };
  }, [platformState.stateVersion, guardianPending]);

  // Compute readiness from raw inputs
  const computed = useMemo(() => computePlatformReadiness(rawInputs), [rawInputs]);

  // Subscribe to engine-level updates (from other sources that may call updateReadinessState)
  const [engineState, setEngineState] = useState(null);
  useEffect(() => {
    return subscribeToReadiness((state) => setEngineState(state));
  }, []);

  // Merge: engine state takes priority if available, otherwise use computed
  const value = engineState || computed;

  return (
    <PlatformReadinessContext.Provider value={value}>
      {children}
    </PlatformReadinessContext.Provider>
  );
}