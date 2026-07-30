import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import {
  recordEvidence,
  computeReadinessFromEvidence,
  generateInsights,
  getReadinessTimeline,
  getDashboardEvidenceSummary,
  entityToEvidence,
} from "@/lib/readinessEvidenceEngine";

/**
 * useReadinessEvidence — syncs entity-derived evidence into the ledger,
 * then returns the computed readiness, insights, timeline, and dashboard
 * summary. This is what makes readiness "demonstrated, not visited":
 * real completed activities (challenges, simulations, reflections, lessons,
 * achievements) feed Level 2–4 evidence into the engine.
 */
const SYNC_ENTITIES = ["ChallengeResult", "SimulationSession", "JournalEntry", "LessonProgress", "Achievement"];

export function useReadinessEvidence() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [readiness, setReadiness] = useState(null);
  const [insights, setInsights] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [summary, setSummary] = useState(null);
  const syncedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function syncEntities() {
      setSyncing(true);
      try {
        const results = await Promise.allSettled(
          SYNC_ENTITIES.map((name) => base44.entities[name].list("-created_date", 15))
        );
        results.forEach((res, i) => {
          if (res.status !== "fulfilled" || !Array.isArray(res.value)) return;
          res.value.forEach((record) => {
            const ev = entityToEvidence(SYNC_ENTITIES[i], record);
            if (ev) recordEvidence(ev);
          });
        });
      } catch (e) {
        console.error("[useReadinessEvidence] sync failed:", e.message);
      }
      setSyncing(false);
    }

    async function load() {
      await syncEntities();
      if (cancelled) return;
      setReadiness(computeReadinessFromEvidence());
      setInsights(generateInsights());
      setTimeline(getReadinessTimeline(40));
      setSummary(getDashboardEvidenceSummary());
      setLoading(false);
    }

    if (!syncedRef.current) {
      syncedRef.current = true;
      load();
    } else {
      setReadiness(computeReadinessFromEvidence());
      setInsights(generateInsights());
      setTimeline(getReadinessTimeline(40));
      setSummary(getDashboardEvidenceSummary());
      setLoading(false);
    }

    return () => { cancelled = true; };
  }, []);

  return { loading, syncing, readiness, insights, timeline, summary };
}