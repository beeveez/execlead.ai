import React from "react";
import { TrendingUp, ArrowRight, CalendarClock, Gauge } from "lucide-react";

/**
 * Enterprise Readiness™ Timeline
 * Shows the projected score progression as each remaining capability ships.
 */
export default function EnterpriseTimeline({ currentScore, projectedAfterScim, projectedAfterProcurement, projectedCompletion, confidence }) {
  const stages = [
    { label: "Current Score", value: `${currentScore}%`, tone: "text-white", active: true },
    { label: "After SCIM™", value: `${projectedAfterScim}%`, tone: "text-cyan-400" },
    { label: "After Procurement™", value: `${projectedAfterProcurement}%`, tone: "text-emerald-400" },
  ];
  const confidenceColor = confidence === "High" ? "#10b981" : confidence === "Medium" ? "#f59e0b" : "#ef4444";

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={13} className="text-cyan-400" />
        <span className="text-xs font-medium text-white/70 uppercase tracking-wider">Enterprise Readiness™ Timeline</span>
      </div>
      <div className="flex items-center gap-1 mb-3">
        {stages.map((s, i) => (
          <React.Fragment key={s.label}>
            <div className="flex-1 text-center">
              <div className="text-[9px] text-white/30 uppercase mb-0.5">{s.label}</div>
              <div className={`text-sm font-bold ${s.tone}`}>{s.value}</div>
            </div>
            {i < stages.length - 1 && <ArrowRight size={12} className="text-white/20 shrink-0" />}
          </React.Fragment>
        ))}
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <CalendarClock size={11} className="text-white/30" />
          <span className="text-[10px] text-white/40">Est. Completion</span>
          <span className="text-xs text-white/70 font-medium">{projectedCompletion}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Gauge size={11} className="text-white/30" />
          <span className="text-[10px] text-white/40">Confidence</span>
          <span className="text-xs font-bold" style={{ color: confidenceColor }}>{confidence}</span>
        </div>
      </div>
    </div>
  );
}