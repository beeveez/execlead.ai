import React from "react";
import { Sparkles, CheckCircle2, AlertCircle, Repeat, XCircle } from "lucide-react";

/**
 * RecommendationEffectivenessPanel — tracks every recommendation:
 * shown → accepted → completed → outcome improved → effectiveness score.
 * Recommendations producing stronger outcomes increase in priority.
 */
export default function RecommendationEffectivenessPanel({ effectiveness }) {
  if (!effectiveness) return null;
  const rows = effectiveness.byActivityType || [];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-amber-400" />
          <h3 className="text-white font-semibold text-sm">Recommendation Effectiveness™</h3>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold" style={{ color: effectiveness.overall.grade.color }}>{effectiveness.overall.effectivenessScore}</span>
          <span className="text-[10px] text-white/30 ml-1">/100 overall</span>
        </div>
      </div>
      <p className="text-white/40 text-[11px] mb-4">Recommendations producing stronger outcomes increase in priority; poor performers decrease.</p>

      {rows.length === 0 ? (
        <div className="text-center py-6 text-white/40 text-xs">
          No recommendation tracking yet. Accept and complete Next Best Evidence™ recommendations to measure effectiveness.
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.activityType} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-xs font-medium">{r.label}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${r.grade.color}20`, color: r.grade.color, border: `1px solid ${r.grade.color}40` }}>
                  {r.grade.label}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <Stat label="Accept" value={`${r.acceptanceRate}%`} icon={CheckCircle2} color="#10b981" />
                <Stat label="Complete" value={`${r.completionRate}%`} icon={Repeat} color="#6366f1" />
                <Stat label="Improved" value={`${r.outcomeImprovementRate}%`} icon={Sparkles} color="#f59e0b" />
                <Stat label="Score" value={`${r.effectivenessScore}`} icon={r.grade.id === "ineffective" ? XCircle : AlertCircle} color={r.grade.color} />
              </div>
              {r.outcomes > 0 && (
                <div className="mt-2 text-[10px] text-white/40">{r.outcomes} outcome{r.outcomes === 1 ? "" : "s"} attributed · avg gain +{r.avgGain} · {r.avgConfidence}% confidence</div>
              )}
            </div>
          ))}
        </div>
      )}

      {effectiveness.underperformers.length > 0 && (
        <div className="mt-3 flex items-center gap-2 text-[11px] text-rose-300/80">
          <AlertCircle size={12} />
          Deprioritizing: {effectiveness.underperformers.map((u) => u.label).join(", ")}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white/[0.02] rounded-lg py-1.5">
      <Icon size={11} style={{ color }} className="mx-auto mb-0.5" />
      <div className="text-xs font-bold" style={{ color }}>{value}</div>
      <div className="text-[9px] text-white/30">{label}</div>
    </div>
  );
}