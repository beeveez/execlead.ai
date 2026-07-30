import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useOutcomeIntelligence } from "@/hooks/useOutcomeIntelligence";
import { Trophy, TrendingUp, Gauge, ArrowUpRight, Sparkles } from "lucide-react";

/**
 * OutcomeIntelligenceSummary — compact card for the Dashboard & Portfolio.
 * Surfaces total outcomes, executive momentum, top improvement, and the
 * most effective activity, with a link to the full Outcome Intelligence page.
 */
export default function OutcomeIntelligenceSummary() {
  const { loading, intelligence } = useOutcomeIntelligence();

  const metrics = useMemo(() => {
    if (!intelligence) return null;
    const s = intelligence.summary;
    const topImproved = intelligence.mostImprovedCompetencies[0];
    const topEff = (intelligence.effectiveness.byActivityType || [])[0];
    return { s, topImproved, topEff };
  }, [intelligence]);

  return (
    <Link
      to="/outcome-intelligence"
      className="block group bg-gradient-to-br from-indigo-500/[0.07] to-violet-500/[0.04] border border-indigo-500/15 hover:border-indigo-500/30 rounded-2xl p-5 transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
            <Trophy size={16} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Executive Outcome Intelligence™</h3>
            <p className="text-white/40 text-[10px]">From evidence to measurable outcomes</p>
          </div>
        </div>
        <ArrowUpRight size={16} className="text-white/30 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
      </div>

      {loading || !metrics ? (
        <div className="text-white/30 text-xs">Measuring outcomes…</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MiniMetric icon={Trophy} label="Outcomes" value={metrics.s.totalOutcomes} color="#f59e0b" />
          <MiniMetric icon={Gauge} label="Momentum" value={metrics.s.executiveMomentum} color="#6366f1" suffix="" />
          <MiniMetric
            icon={TrendingUp}
            label="Top growth"
            value={metrics.topImproved ? metrics.topImproved.competency : "—"}
            color="#10b981"
            isText
          />
          <MiniMetric
            icon={Sparkles}
            label="Most effective"
            value={metrics.topEff ? metrics.topEff.label : "—"}
            color="#0ea5e9"
            isText
          />
        </div>
      )}
    </Link>
  );
}

function MiniMetric({ icon: Icon, label, value, color, isText, suffix }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={11} style={{ color }} />
        <span className="text-[9px] text-white/40 uppercase tracking-wider">{label}</span>
      </div>
      <div className={`${isText ? "text-xs" : "text-lg"} font-bold leading-tight`} style={{ color }}>
        {isText ? value : `${value}${suffix || ""}`}
      </div>
    </div>
  );
}