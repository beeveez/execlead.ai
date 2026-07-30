import React, { useState } from "react";
import { Clock, Eye, CheckCircle2, Award, Crown, ShieldCheck } from "lucide-react";
import { EVIDENCE_LEVELS } from "@/lib/readinessEvidenceEngine";

const LEVEL_ICON = { exposure: Eye, participation: CheckCircle2, demonstrated: Award, mastery: Crown };
const LEVEL_COLOR = { exposure: "#64748b", participation: "#0ea5e9", demonstrated: "#6366f1", mastery: "#f59e0b" };

/**
 * ReadinessEvidenceTimeline — visual timeline of evidence collected,
 * competencies strengthened, milestones, and AI observations.
 * Users see WHY their readiness changed, not just that it did.
 */
export default function ReadinessEvidenceTimeline({ timeline = [], compact = false }) {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all"
    ? timeline
    : timeline.filter((t) => t.level === filter);

  const filters = [
    { id: "all", label: "All evidence" },
    { id: "demonstrated", label: "Demonstrated" },
    { id: "mastery", label: "Mastery" },
    { id: "participation", label: "Participation" },
  ];

  if (!timeline || timeline.length === 0) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8 text-center">
        <Clock size={28} className="mx-auto text-white/10 mb-3" />
        <p className="text-white/40 text-sm">No evidence yet.</p>
        <p className="text-white/30 text-xs mt-1">Complete a challenge, simulation, or reflection to start your evidence record.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
        <div>
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <Clock size={16} className="text-indigo-400" />
            Readiness Evidence Timeline
          </h3>
          <p className="text-white/40 text-[11px] mt-0.5">Why your readiness changed — evidence by evidence</p>
        </div>
        {!compact && (
          <div className="flex items-center gap-1 flex-wrap">
            {filters.map((f) => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className={`px-2 py-1 rounded-md text-[10px] font-medium transition-colors border ${
                  filter === f.id ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" : "bg-white/5 text-white/40 border-white/10 hover:text-white/70"
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="mt-4 relative">
        <div className="absolute left-[14px] top-0 bottom-0 w-px bg-white/5" />
        <div className={`space-y-3 ${compact ? "max-h-64" : "max-h-[480px]"} overflow-y-auto pr-1`}>
          {filtered.map((ev) => {
            const Icon = LEVEL_ICON[ev.level] || Eye;
            const color = LEVEL_COLOR[ev.level] || "#64748b";
            const level = EVIDENCE_LEVELS[ev.level];
            return (
              <div key={ev.id} className="relative flex items-start gap-3 pl-1">
                <div className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-[#0a0a0f] border" style={{ borderColor: `${color}40` }}>
                  <Icon size={12} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[12px] text-white/85 font-medium">{ev.competency}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}30` }}>
                      L{level.level} {level.label}
                    </span>
                    {ev.validated && (
                      <span className="flex items-center gap-0.5 text-[9px] text-emerald-400/70">
                        <ShieldCheck size={9} /> validated
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-white/50 mt-0.5">
                    {ev.outcome === "demonstrated" ? "Demonstrated" : ev.outcome === "completed" ? "Completed" : "Viewed"} {ev.module}
                    <span className="text-white/30"> · +{ev.gain} readiness</span>
                  </div>
                  <div className="text-[9px] text-white/30 mt-0.5">{new Date(ev.timestamp).toLocaleString()}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}