import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { computeOutcomeIntelligence } from "@/lib/executiveOutcomeIntelligenceEngine";
import {
  recordRecommendationAcceptance,
  recordRecommendationCompletion,
  recordRecommendationShown,
} from "@/lib/recommendationEffectivenessEngine";
import { computeReadinessFromEvidence } from "@/lib/readinessEvidenceEngine";

/**
 * useOutcomeIntelligence — loads the user's ExecutiveOutcome records,
 * computes Outcome Intelligence, and exposes recommendation tracking actions.
 */
export function useOutcomeIntelligence() {
  const { user } = useAuth();
  const [outcomes, setOutcomes] = useState([]);
  const [intelligence, setIntelligence] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const res = await base44.entities.ExecutiveOutcome.filter({}, "-outcome_date", 100);
      setOutcomes(res || []);
    } catch (e) {
      console.error("[useOutcomeIntelligence] load failed:", e.message);
      setOutcomes([]);
    }
  }, [user]);

  useEffect(() => {
    (async () => {
      await load();
      setLoading(false);
    })();
  }, [load]);

  useEffect(() => {
    // Recompute intelligence whenever outcomes change. Readiness is computed
    // fresh from the local evidence ledger (no nested hook).
    const r = computeReadinessFromEvidence();
    setIntelligence(computeOutcomeIntelligence(outcomes, r));
  }, [outcomes]);

  const recordOutcome = useCallback(
    async (data) => {
      if (!user) return null;
      const outcome_id = `OC-${new Date().getFullYear()}-${Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase()}`;
      const payload = {
        outcome_id,
        user_id: user.id,
        user_name: user.full_name || user.data?.full_name || "",
        status: "observed",
        verification_source: "self_reported",
        ...data,
      };
      try {
        const created = await base44.entities.ExecutiveOutcome.create(payload);
        setOutcomes((prev) => [created, ...prev]);
        return created;
      } catch (e) {
        console.error("[useOutcomeIntelligence] record failed:", e.message);
        return null;
      }
    },
    [user]
  );

  return {
    loading,
    outcomes,
    intelligence,
    recordOutcome,
    acceptRecommendation: recordRecommendationAcceptance,
    completeRecommendation: recordRecommendationCompletion,
    showRecommendation: recordRecommendationShown,
    refresh: load,
  };
}