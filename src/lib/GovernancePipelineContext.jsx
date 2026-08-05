import React, {
  createContext, useContext, useState, useEffect, useCallback, useMemo, useRef,
} from "react";
import { runGovernancePipeline, PIPELINE_TRIGGERS } from "./governancePipeline";
import { subscribeAll } from "./platformEventBus";
import { useGuardian } from "./GuardianContext";
import { useAuth } from "./AuthContext";
import { base44 } from "@/api/base44Client";
import {
  canCreateGovernanceRecord, newGovernanceRequestId, logGovernanceCreate,
} from "@/lib/governanceAuditLogger";

/**
 * Platform Governance Pipeline™ Context
 * --------------------------------------
 * Automatically runs the 16-stage governance pipeline after every
 * significant platform event (debounced), stores the latest
 * Governance Certificate™, and persists it to the database for
 * audit trail.
 *
 * The pipeline is READ-ONLY — it never mutates platform state.
 */
const GovernancePipelineContext = createContext(null);

const SAFE_DEFAULT = {
  certificate: null,
  pipelineRunning: false,
  lastTrigger: null,
  runPipeline: () => {},
  pipelineHistory: [],
};

export function useGovernancePipeline() {
  const ctx = useContext(GovernancePipelineContext);
  return ctx || SAFE_DEFAULT;
}

const DEBOUNCE_MS = 2000;

export function GovernancePipelineProvider({ children }) {
  const guardian = useGuardian();
  const { user } = useAuth();
  const [certificate, setCertificate] = useState(null);
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [lastTrigger, setLastTrigger] = useState(null);
  const [pipelineHistory, setPipelineHistory] = useState([]);
  const debounceRef = useRef(null);
  const runningRef = useRef(false);

  const persistCertificate = useCallback((cert) => {
    // Workspace Isolation™ — GovernanceCertificate is an internal platform
    // governance record. Only authenticated trusted-administrative roles may
    // persist it; executives / members / anonymous skip persistence entirely.
    if (!canCreateGovernanceRecord(user)) return;
    const requestId = newGovernanceRequestId();
    try {
      const record = {
        certificate_id: cert.certificateId,
        trigger: cert.trigger,
        certified: cert.certified,
        overall_governance_score: cert.overallGovernanceScore,
        manifest_health: cert.manifestHealth,
        registry_health: cert.registryHealth,
        knowledge_health: cert.knowledgeHealth,
        synchronization_health: cert.synchronizationHealth,
        deployment_readiness: cert.deploymentReadiness,
        platform_state: cert.platformState,
        enterprise_readiness: cert.enterpriseReadiness,
        warnings: cert.warnings,
        failures: cert.failures,
        repair_actions: cert.repairActions,
        stages_json: JSON.stringify(cert.stages.map((s) => ({
          id: s.id, name: s.name, order: s.order,
          status: s.status, score: s.score, summary: s.summary, duration: s.duration,
          findings: s.findings?.length || 0,
        }))),
        findings_json: JSON.stringify((cert.findings || []).slice(0, 50).map((f) => ({
          id: f.id, stageId: f.stageId, code: f.code,
          level: f.level, autoRepairable: f.autoRepairable,
          message: (f.message || "").slice(0, 200),
        }))),
        pipeline_version: cert.pipelineVersion,
        platform_version: cert.platformVersion,
        execution_time_ms: cert.duration,
        user_id: user?.id || "system",
        user_name: user?.full_name || "System",
        user_role: user?.role || "",
        request_id: requestId,
      };
      base44.entities.GovernanceCertificate.create(record)
        .then(() => logGovernanceCreate({
          entity: "GovernanceCertificate", record, user, requestId, workspace: "developer",
        }))
        .catch(() => {});
    } catch {}
  }, [user]);

  const executePipeline = useCallback((trigger) => {
    if (runningRef.current) return;
    runningRef.current = true;
    setPipelineRunning(true);
    setLastTrigger(trigger);

    try {
      const guardianPending = guardian?.pending?.length || 0;
      const cert = runGovernancePipeline(trigger, guardianPending);
      setCertificate(cert);
      setPipelineHistory((prev) => [cert, ...prev].slice(0, 10));
      persistCertificate(cert);
    } catch (e) {
      console.error("[GovernancePipeline] Pipeline execution failed:", e);
    } finally {
      runningRef.current = false;
      setPipelineRunning(false);
    }
  }, [guardian, persistCertificate]);

  // Initial certification + subscribe to trigger events
  useEffect(() => {
    executePipeline("initial");

    const handler = (eventName) => {
      if (!PIPELINE_TRIGGERS.includes(eventName)) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        executePipeline(eventName);
      }, DEBOUNCE_MS);
    };

    const unsub = subscribeAll(handler);
    return () => {
      unsub();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [executePipeline]);

  const runPipeline = useCallback((trigger = "manual") => {
    executePipeline(trigger);
  }, [executePipeline]);

  const value = useMemo(() => ({
    certificate,
    pipelineRunning,
    lastTrigger,
    runPipeline,
    pipelineHistory,
  }), [certificate, pipelineRunning, lastTrigger, runPipeline, pipelineHistory]);

  return (
    <GovernancePipelineContext.Provider value={value}>
      {children}
    </GovernancePipelineContext.Provider>
  );
}