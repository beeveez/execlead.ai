import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { BookMarked, TrendingUp, Sparkles, Activity, Award, ArrowRight, Loader2 } from "lucide-react";

/**
 * GrowthRecordHero — reframes the Executive Portfolio as a living record of
 * executive growth. Surfaces the readiness-specific record sections:
 *   • Executive Readiness Timeline  (trajectory)
 *   • AI Executive Observations      (latest coach insight)
 *   • Strength Evolution             (top competency trend)
 *   • Promotion Readiness Summary    (forecast + readiness)
 *
 * Existing portfolio sections (Simulation History, Leadership Achievements,
 * Executive Milestones, Competency Growth, Evidence Log, Reflection Archive)
 * remain in place below — this hero ties them together under one narrative.
 */
export default function GrowthRecordHero() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke("manageIntelligence", { action: "compute" });
        setData(res.data);
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>;
  }

  const readiness = data?.readiness || {};
  const forecast = data?.forecast || {};
  const profile = data?.profile || {};
  const dims = readiness.dimensions || [];

  const topStrength = [...dims].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
  const timelineTrend = readiness.trend || "Stable";
  const promoProb = Math.round(forecast.promotion_probability || forecast.probability || 0);

  return (
    <div className="bg-gradient-to-br from-indigo-500/8 via-violet-500/4 to-transparent border border-indigo-500/15 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <BookMarked size={16} className="text-indigo-400" />
        <h3 className="text-white font-semibold text-sm">Your Living Record of Executive Growth</h3>
        <span className="text-[10px] text-white/30">A continuous leadership development record</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Executive Readiness Timeline */}
        <RecordTile
          icon={TrendingUp}
          color="#6366f1"
          title="Readiness Timeline"
          value={`${readiness.overallScore || 0}%`}
          sub={`Trend: ${timelineTrend}`}
          path="/executive-readiness"
          linkLabel="View trajectory"
        />

        {/* AI Executive Observations */}
        <RecordTile
          icon={Sparkles}
          color="#8b5cf6"
          title="AI Executive Observations"
          value={readiness.confidence || "—"}
          sub="Latest coach confidence"
          path="/executive-readiness"
          linkLabel="Read observations"
        />

        {/* Strength Evolution */}
        <RecordTile
          icon={Activity}
          color="#10b981"
          title="Strength Evolution"
          value={topStrength ? `${topStrength.score ?? 0}` : "—"}
          sub={topStrength?.label || "—"}
          path="/analytics"
          linkLabel="See competency growth"
        />

        {/* Promotion Readiness Summary */}
        <RecordTile
          icon={Award}
          color="#f59e0b"
          title="Promotion Readiness"
          value={`${promoProb}%`}
          sub={readiness.estimatedMonths > 0 ? `${readiness.estimatedMonths} mo to target` : "On track"}
          path="/promotion-forecast"
          linkLabel="View forecast"
        />
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5 flex-wrap">
        <span className="text-white/30 text-[11px]">Full record:</span>
        {["Simulation History", "Leadership Achievements", "Executive Milestones", "Competency Growth", "Evidence Log", "Reflection Archive"].map((s) => (
          <Link key={s} to="/executive-portfolio" className="text-[11px] px-2 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-white/50 hover:text-white/80 border border-white/5 transition-colors">
            {s}
          </Link>
        ))}
      </div>
    </div>
  );
}

function RecordTile({ icon: Icon, color, title, value, sub, path, linkLabel }) {
  return (
    <Link to={path} className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-xl p-3.5 transition-all">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={13} style={{ color }} />
        <span className="text-white/40 text-[10px] uppercase tracking-wider truncate">{title}</span>
      </div>
      <div className="text-white font-bold text-lg">{value}</div>
      <div className="text-white/40 text-[11px] truncate mt-0.5">{sub}</div>
      <div className="flex items-center gap-1 mt-2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ color }}>
        {linkLabel} <ArrowRight size={9} className="group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}