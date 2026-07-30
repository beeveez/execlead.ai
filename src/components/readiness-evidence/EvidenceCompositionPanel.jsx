import React from "react";
import { Eye, CheckCircle2, Award, Crown, TrendingUp } from "lucide-react";
import { EVIDENCE_LEVELS } from "@/lib/readinessEvidenceEngine";

const LEVEL_ORDER = ["exposure", "participation", "demonstrated", "mastery"];

/**
 * EvidenceCompositionPanel — visualizes the Phase 2 readiness computation:
 * Exposure + Participation + Competency Demonstration + Consistency +
 * Reflection + Practice + Improvement Trend = Executive Readiness.
 *
 * Every point is explainable — users see exactly which evidence feeds
 * their score and how much each component contributes.
 */
export default function EvidenceCompositionPanel({ readiness }) {
  if (!readiness) return null;

  const { components, totalScore, confidence, evidenceCount, streak } = readiness;
  const c = components;

  const compositionRows = [
    { label: "Exposure", value: c.exposure, weight: 0.05, icon: Eye, color: "#64748b", hint: "Pages viewed, articles read" },
    { label: "Participation", value: c.participation, weight: 0.15, icon: CheckCircle2, color: "#0ea5e9", hint: "Sessions, lessons, reflections completed" },
    { label: "Competency Demonstration", value: c.competencyDemonstration, weight: 0.30, icon: Award, color: "#6366f1", hint: "Simulations, challenges, debates passed" },
    { label: "Consistency", value: c.consistency, weight: 0.15, icon: TrendingUp, color: "#10b981", hint: `${streak}-day active streak` },
    { label: "Reflection", value: c.reflection, weight: 0.10, icon: CheckCircle2, color: "#ec4899", hint: "Journal entries, coaching reflections" },
    { label: "Practice", value: c.practice, weight: 0.15, icon: Award, color: "#f97316", hint: "Simulations, challenges, debates, interviews" },
    { label: "Improvement Trend", value: c.improvementTrend, weight: 0.10, icon: TrendingUp, color: "#8b5cf6", hint: "Week-over-week evidence growth" },
  ];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-1">
        <div>
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <Award size={16} className="text-indigo-400" />
            Evidence-Based Readiness Composition
          </h3>
          <p className="text-white/40 text-[11px] mt-0.5">Earned through demonstrated competency — not page visits</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white">{totalScore}</div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider">Readiness Score</div>
        </div>
      </div>

      {/* Equation visualization */}
      <div className="mt-4 space-y-2.5">
        {compositionRows.map((row) => {
          const contribution = Math.round((row.value * row.weight) * 10) / 10;
          const Icon = row.icon;
          return (
            <div key={row.label} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${row.color}15`, border: `1px solid ${row.color}30` }}>
                <Icon size={12} style={{ color: row.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[11px] text-white/70 font-medium">{row.label}</span>
                  <span className="text-[10px] text-white/40">{row.value}/100 · weight {Math.round(row.weight * 100)}% · +{contribution}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${row.value}%`, backgroundColor: row.color }} />
                </div>
              </div>
            </div>
          );
        })}
        {/* Sum line */}
        <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/5">
          <span className="text-[11px] text-white/50 font-medium flex items-center gap-1">
            <Crown size={12} className="text-amber-400" /> = Executive Readiness
          </span>
          <span className="text-lg font-bold text-amber-400">{totalScore}<span className="text-[10px] text-white/30 font-normal">/100</span></span>
        </div>
      </div>

      {/* Footer stats */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <FooterStat label="Evidence items" value={evidenceCount} color="#6366f1" />
        <FooterStat label="Confidence" value={`${confidence}%`} color="#10b981" />
        <FooterStat label="Active streak" value={`${streak}d`} color="#f59e0b" />
      </div>

      {/* Evidence level legend */}
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5 flex-wrap">
        {LEVEL_ORDER.map((id) => {
          const lv = EVIDENCE_LEVELS[id];
          return (
            <div key={id} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: lv.color }} />
              <span className="text-[9px] text-white/40">L{lv.level} {lv.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FooterStat({ label, value, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2 text-center">
      <div className="text-base font-bold" style={{ color }}>{value}</div>
      <div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div>
    </div>
  );
}