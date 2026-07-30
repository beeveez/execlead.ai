import React, { useMemo, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Target, TrendingUp, Sparkles, ChevronDown } from "lucide-react";
import { getReadinessContribution, logReadinessEngagement } from "@/lib/readinessContributionRegistry";
import { recordEvidence } from "@/lib/readinessEvidenceEngine";

/**
 * Readiness Contribution Banner™
 * Surfaces, on every authenticated screen, the measurable answer to
 * "How does this screen measurably improve Executive Readiness?"
 *
 * Auto-resolves the contribution from the registry by route — no per-page
 * wiring required. Dismissible per-route (remembered in localStorage).
 * Logs engagement to the Readiness Engine on mount.
 */
export default function ReadinessContributionBanner() {
  const location = useLocation();
  const [dismissed, setDismissed] = useState(false);

  const contribution = useMemo(() => getReadinessContribution(location.pathname), [location.pathname]);

  // Reset dismissal when route changes
  useEffect(() => {
    const key = `rcb_dismissed_${location.pathname}`;
    setDismissed(localStorage.getItem(key) === "1");
  }, [location.pathname]);

  // Log this screen's engagement as readiness evidence.
  // Phase 2: page visits are Level 1 Exposure (very low weight) — they feed
  // the evidence ledger but do not meaningfully increase readiness. Real
  // readiness is earned through demonstrated competency (Levels 2–4).
  useEffect(() => {
    logReadinessEngagement(contribution, location.pathname);
    recordEvidence({
      evidenceType: "page_visit",
      module: location.pathname,
      competency: contribution.competencies?.[0] || "Leadership",
      evidenceLevel: "exposure",
      source: "navigation",
      aiValidation: false,
      outcome: "viewed",
    });
  }, [contribution, location.pathname]);

  function handleDismiss() {
    const key = `rcb_dismissed_${location.pathname}`;
    localStorage.setItem(key, "1");
    setDismissed(true);
  }

  if (dismissed) {
    return (
      <button
        onClick={() => { localStorage.removeItem(`rcb_dismissed_${location.pathname}`); setDismissed(false); }}
        className="mx-4 md:mx-8 mt-2 flex items-center gap-1.5 text-[10px] text-white/30 hover:text-white/60 transition-colors"
        title="Show readiness contribution"
      >
        <ChevronDown size={12} /> Readiness contribution hidden — click to show
      </button>
    );
  }

  const isIntegrity = contribution.platformIntegrity;

  return (
    <div className={`mx-4 md:mx-8 mt-2 mb-1 rounded-xl border ${isIntegrity ? "bg-white/[0.02] border-white/5" : "bg-indigo-500/[0.04] border-indigo-500/15"}`}>
      <div className="flex items-start gap-3 px-4 py-2.5">
        <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isIntegrity ? "bg-white/5" : "bg-indigo-500/10"}`}>
          {isIntegrity ? <Sparkles size={13} className="text-white/50" /> : <Target size={13} className="text-indigo-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-wider text-white/30">Readiness Contribution</span>
            <span className="text-[11px] font-semibold text-white/80">{contribution.title}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded ${isIntegrity ? "bg-white/5 text-white/40" : "bg-indigo-500/10 text-indigo-400"}`}>
              {contribution.loopStage?.label} · {contribution.journeyStage?.label}
            </span>
          </div>
          <p className="text-[11px] text-white/55 mt-1 leading-relaxed">{contribution.contribution}</p>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <div className="flex items-center gap-1">
              <TrendingUp size={10} className="text-emerald-400/70" />
              <span className="text-[10px] text-white/40">Measures: </span>
              <span className="text-[10px] text-white/70 font-medium">{contribution.measurableOutcome}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {contribution.competencies.slice(0, 3).map((c) => (
                <span key={c} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/50 border border-white/5">{c}</span>
              ))}
            </div>
          </div>
        </div>
        <button onClick={handleDismiss}
          className="text-white/30 hover:text-white/60 text-[10px] flex-shrink-0 px-1.5 py-1 rounded hover:bg-white/5 transition-colors"
          title="Hide on this screen">
          Dismiss
        </button>
      </div>
    </div>
  );
}