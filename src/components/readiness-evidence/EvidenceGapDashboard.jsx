import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Target, TrendingUp, ShieldCheck, Gauge, Layers, Zap, Clock, Award, ArrowRight, AlertCircle,
} from "lucide-react";
import { analyzeAllGaps, getNextBestActivities, getEvidenceCoverage } from "@/lib/evidenceGapEngine";

const STATUS_STYLES = {
  complete: { color: "#10b981", bg: "from-emerald-500/15 to-emerald-500/5", border: "border-emerald-500/25" },
  strong: { color: "#0ea5e9", bg: "from-sky-500/15 to-sky-500/5", border: "border-sky-500/25" },
  developing: { color: "#6366f1", bg: "from-indigo-500/15 to-indigo-500/5", border: "border-indigo-500/25" },
  needs_evidence: { color: "#f59e0b", bg: "from-amber-500/15 to-amber-500/5", border: "border-amber-500/25" },
  critical_gap: { color: "#ef4444", bg: "from-rose-500/15 to-rose-500/5", border: "border-rose-500/25" },
  unknown: { color: "#94a3b8", bg: "from-slate-500/15 to-slate-500/5", border: "border-slate-500/25" },
};

function CoverageMetric({ label, value, suffix = "%", color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
      <div className="text-2xl font-bold" style={{ color }}>{value}<span className="text-xs text-white/30 font-normal">{suffix}</span></div>
      <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}

function GapRow({ gap }) {
  const style = STATUS_STYLES[gap.status.id] || STATUS_STYLES.unknown;
  return (
    <div className={`bg-gradient-to-br ${style.bg} border ${style.border} rounded-xl p-3`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-sm font-semibold text-white">{gap.competency}</span>
          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full" style={{ color: style.color, backgroundColor: `${style.color}1a` }}>
            {gap.status.label}
          </span>
        </div>
        <div className="text-right">
          <div className="text-xs text-white/40">Coverage</div>
          <div className="text-lg font-bold" style={{ color: style.color }}>{gap.coverage}%</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {gap.missingEvidence.slice(0, 3).map((t) => (
          <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 text-white/50 border border-white/5">
            Missing: {t.replace(/_/g, " ")}
          </span>
        ))}
      </div>
      {gap.nextBest && (
        <Link to={gap.nextBest.activity?.path || "/dashboard"} className="flex items-center justify-between mt-2 group">
          <span className="text-[11px] text-white/60">
            Next: <span className="text-white/80 font-medium">{gap.nextBest.activity?.label}</span>
          </span>
          <span className="text-[10px] flex items-center gap-1" style={{ color: style.color }}>
            +{gap.improvementOpportunity.readiness} readiness <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </Link>
      )}
    </div>
  );
}

function ActivityCard({ rec, label, accent }) {
  if (!rec) return null;
  return (
    <div className={`bg-white/[0.02] border ${accent} rounded-xl p-3`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[9px] uppercase tracking-wider text-white/40 font-medium">{label}</span>
      </div>
      <Link to={rec.path} className="block group">
        <div className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">{rec.activity}</div>
        <div className="text-[10px] text-white/40 mt-0.5">for {rec.competency}</div>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-[10px] flex items-center gap-1 text-emerald-400"><TrendingUp size={10} />+{rec.estimatedGain.readiness}</span>
          <span className="text-[10px] flex items-center gap-1 text-amber-400"><ShieldCheck size={10} />+{rec.estimatedGain.reliability}</span>
          <span className="text-[10px] flex items-center gap-1 text-sky-400"><Gauge size={10} />+{rec.estimatedGain.confidence}</span>
          <span className="text-[10px] flex items-center gap-1 text-white/30 ml-auto"><Clock size={10} />{rec.estMinutes}m</span>
        </div>
      </Link>
    </div>
  );
}

export default function EvidenceGapDashboard() {
  const gaps = useMemo(() => analyzeAllGaps(), []);
  const nextBest = useMemo(() => getNextBestActivities(8), []);
  const coverage = useMemo(() => getEvidenceCoverage(gaps), [gaps]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-amber-500/5 border border-indigo-500/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Target size={18} className="text-indigo-400" />
          <h2 className="text-base font-bold text-white">Evidence Gap Analysis™</h2>
          <span className="text-[10px] text-white/30 ml-auto">Proactive readiness development</span>
        </div>
        <p className="text-xs text-white/50 leading-relaxed">
          Instead of measuring where you are today, this identifies the evidence that will most improve your Executive Readiness —
          the shortest path toward stronger executive capability.
        </p>
        <div className="grid grid-cols-4 gap-2 mt-4">
          <CoverageMetric label="Coverage" value={coverage.coverage} color="#6366f1" />
          <CoverageMetric label="Confidence" value={coverage.confidence} color="#10b981" />
          <CoverageMetric label="Reliability" value={coverage.reliability} color="#f59e0b" />
          <CoverageMetric label="Readiness" value={coverage.readiness} color="#0ea5e9" />
        </div>
      </div>

      {/* Top 5 Gaps */}
      <div>
        <div className="flex items-center gap-2 mb-2 px-1">
          <AlertCircle size={14} className="text-amber-400" />
          <h3 className="text-sm font-semibold text-white">Top 5 Evidence Gaps</h3>
          <span className="text-[10px] text-white/30">Highest improvement opportunity</span>
        </div>
        {gaps.summary.totalCompetencies === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center text-xs text-white/40">
            No evidence yet. Complete a Challenge, Simulation, or Coaching session to begin your evidence journey.
          </div>
        ) : gaps.topGaps.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center text-xs text-white/40">
            All competencies have complete evidence coverage. Continue practicing to sustain mastery.
          </div>
        ) : (
          <div className="space-y-2">{gaps.topGaps.map((g) => <GapRow key={g.competency} gap={g} />)}</div>
        )}
      </div>

      {/* AI Prioritization — Next Best Activities */}
      <div>
        <div className="flex items-center gap-2 mb-2 px-1">
          <Zap size={14} className="text-amber-400" />
          <h3 className="text-sm font-semibold text-white">Next Best Evidence™</h3>
          <span className="text-[10px] text-white/30">AI-ranked by expected gain × efficiency</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(!nextBest.highestROI && !nextBest.quickWins[0] && !nextBest.longTermGrowth[0]) ? (
            <div className="col-span-full bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center text-xs text-white/40">
              Complete activities to unlock personalized Next Best Evidence™ recommendations.
            </div>
          ) : (
            <>
              <ActivityCard rec={nextBest.highestROI} label="Highest ROI Activity" accent="border-amber-500/25" />
              <ActivityCard rec={nextBest.quickWins[0]} label="Quick Win" accent="border-emerald-500/25" />
              <ActivityCard rec={nextBest.longTermGrowth[0]} label="Long-Term Growth" accent="border-indigo-500/25" />
            </>
          )}
        </div>
      </div>

      {/* Summary — Gap distribution */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Layers size={14} className="text-white/40" />
          <span className="text-xs font-medium text-white/70">Competency Gap Distribution</span>
          <span className="text-[10px] text-white/30 ml-auto">{gaps.summary.totalCompetencies} competencies tracked</span>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {[
            { label: "Complete", value: gaps.summary.complete, color: "#10b981" },
            { label: "Strong", value: gaps.summary.strong, color: "#0ea5e9" },
            { label: "Developing", value: gaps.summary.developing, color: "#6366f1" },
            { label: "Needs Evidence", value: gaps.summary.needsEvidence, color: "#f59e0b" },
            { label: "Critical Gap", value: gaps.summary.criticalGap, color: "#ef4444" },
            { label: "Unknown", value: gaps.summary.unknown, color: "#94a3b8" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[9px] text-white/40 uppercase tracking-wider mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}