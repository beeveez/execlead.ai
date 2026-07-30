import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Layers, ChevronDown, ChevronRight, Check, X, TrendingUp } from "lucide-react";
import { analyzeAllGaps } from "@/lib/evidenceGapEngine";

const STATUS_DOT = {
  complete: "#10b981", strong: "#0ea5e9", developing: "#6366f1",
  needs_evidence: "#f59e0b", critical_gap: "#ef4444", unknown: "#94a3b8",
};

function CompetencyRow({ gap }) {
  const [expanded, setExpanded] = useState(false);
  const dot = STATUS_DOT[gap.status.id] || "#94a3b8";

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-3 p-3 hover:bg-white/[0.02] transition-colors">
        {expanded ? <ChevronDown size={14} className="text-white/30" /> : <ChevronRight size={14} className="text-white/30" />}
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dot }} />
        <span className="text-sm font-medium text-white flex-1 text-left">{gap.competency}</span>
        <div className="flex items-center gap-4 text-[10px]">
          <span className="text-white/40">{gap.evidenceCount} items</span>
          <span className="text-white/40">{gap.evidenceDiversity} types</span>
          <span className="font-bold" style={{ color: dot }}>{gap.coverage}%</span>
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-3 space-y-2 border-t border-white/5">
          {/* Coverage bar */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/40 w-20">Coverage</span>
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${gap.coverage}%`, backgroundColor: dot }} />
            </div>
            <span className="text-[10px] font-medium" style={{ color: dot }}>{gap.coverage}%</span>
          </div>
          {/* Metrics */}
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center bg-white/[0.02] rounded-lg p-1.5">
              <div className="text-xs font-bold text-white">{gap.currentScore}</div>
              <div className="text-[8px] text-white/30 uppercase">Score</div>
            </div>
            <div className="text-center bg-white/[0.02] rounded-lg p-1.5">
              <div className="text-xs font-bold text-emerald-400">{gap.confidence}%</div>
              <div className="text-[8px] text-white/30 uppercase">Confidence</div>
            </div>
            <div className="text-center bg-white/[0.02] rounded-lg p-1.5">
              <div className="text-xs font-bold text-amber-400">{gap.evidenceReliability}</div>
              <div className="text-[8px] text-white/30 uppercase">Reliability</div>
            </div>
            <div className="text-center bg-white/[0.02] rounded-lg p-1.5">
              <div className="text-xs font-bold text-indigo-400">{gap.mastery.label.split(" ")[0]}</div>
              <div className="text-[8px] text-white/30 uppercase">Mastery</div>
            </div>
          </div>
          {/* Evidence types */}
          <div>
            <div className="text-[10px] text-white/40 mb-1">Required Evidence ({gap.expectedEvidence.length})</div>
            <div className="flex flex-wrap gap-1">
              {gap.expectedEvidence.map((t) => {
                const observed = gap.observedEvidence.includes(t);
                return (
                  <span key={t} className={`text-[9px] px-1.5 py-0.5 rounded-md flex items-center gap-1 ${observed ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
                    {observed ? <Check size={9} /> : <X size={9} />}
                    {t.replace(/_/g, " ")}
                  </span>
                );
              })}
            </div>
          </div>
          {/* Gap types */}
          {gap.gapTypes.length > 0 && (
            <div>
              <div className="text-[10px] text-white/40 mb-1">Gap Types ({gap.gapTypes.length})</div>
              <div className="flex flex-wrap gap-1">
                {gap.gapTypes.map((g) => (
                  <span key={g.id} className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {g.label}
                  </span>
                ))}
              </div>
            </div>
          )}
          {/* Next Best + Estimated Gain */}
          {gap.nextBest && (
            <Link to={gap.nextBest.activity?.path || "/dashboard"} className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-2 group">
              <div>
                <div className="text-[10px] text-white/40">Next Best Evidence</div>
                <div className="text-xs font-medium text-white">{gap.nextBest.activity?.label}</div>
              </div>
              <div className="flex items-center gap-2 text-right">
                <span className="text-[10px] flex items-center gap-1 text-emerald-400"><TrendingUp size={10} />+{gap.improvementOpportunity.readiness}</span>
                <span className="text-[10px] text-amber-400">+{gap.improvementOpportunity.reliability}R</span>
                <span className="text-[10px] text-sky-400">+{gap.improvementOpportunity.confidence}C</span>
              </div>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default function CompetencyCoveragePanel() {
  const gaps = useMemo(() => analyzeAllGaps(), []);
  const [filter, setFilter] = useState("all");
  const filterMap = { all: null, gaps: (g) => g.missingEvidence.length > 0, complete: (g) => g.status.id === "complete", critical: (g) => g.status.id === "critical_gap" || g.status.id === "needs_evidence" };
  const filtered = filterMap[filter] ? gaps.competencies.filter(filterMap[filter]) : gaps.competencies;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2 px-1">
        <Layers size={14} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">Competency Coverage™</h3>
        <span className="text-[10px] text-white/30">{filtered.length} competencies</span>
        <div className="ml-auto flex gap-1">
          {[["all", "All"], ["gaps", "Gaps"], ["complete", "Complete"], ["critical", "Critical"]].map(([id, label]) => (
            <button key={id} onClick={() => setFilter(id)} className={`text-[10px] px-2 py-1 rounded-md transition-colors ${filter === id ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-white/[0.02] text-white/40 border border-white/5 hover:text-white/60"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center text-xs text-white/40">No competencies match this filter.</div>
        ) : (
          filtered.map((g) => <CompetencyRow key={g.competency} gap={g} />)
        )}
      </div>
    </div>
  );
}