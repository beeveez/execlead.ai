import React from "react";
import { Database, TrendingUp, Award, AlertCircle, Gauge, Zap, Calendar, ShieldCheck } from "lucide-react";

/**
 * EvidenceDashboardSummary — the Phase 2 dashboard metrics:
 * Evidence Collected This Week, Competencies Improved, Strongest Growth
 * Area, Needs More Evidence, Readiness Confidence, Growth Momentum,
 * Learning Consistency.
 */
export default function EvidenceDashboardSummary({ summary }) {
  if (!summary) return null;

  const cards = [
    { icon: Database, label: "Evidence this week", value: summary.evidenceThisWeek, hint: "items recorded", color: "#6366f1" },
    { icon: ShieldCheck, label: "Avg reliability", value: summary.averageReliability != null ? summary.averageReliability : "—", hint: "ERI trust score", color: "#f59e0b" },
    { icon: TrendingUp, label: "Competencies improved", value: summary.competenciesImprovedCount, hint: summary.competenciesImproved?.slice(0, 2).join(", ") || "—", color: "#10b981" },
    { icon: Award, label: "Strongest growth", value: summary.strongestGrowthArea || "—", hint: summary.strongestGrowthArea ? "this week" : "complete an activity", color: "#f59e0b", isText: true },
    { icon: AlertCircle, label: "Needs more evidence", value: summary.needsMoreEvidence || "—", hint: summary.needsMoreEvidence ? "demonstrate this" : "all covered", color: "#ef4444", isText: true },
    { icon: Gauge, label: "Readiness confidence", value: `${summary.readinessConfidence}%`, hint: "evidence-backed", color: "#0ea5e9", isText: true },
    { icon: Zap, label: "Growth momentum", value: summary.growthMomentum > 0 ? `+${summary.growthMomentum}` : summary.growthMomentum, hint: "weekly score delta", color: summary.growthMomentum >= 0 ? "#10b981" : "#ef4444", isText: true },
    { icon: Calendar, label: "Learning consistency", value: `${summary.learningConsistency}d`, hint: "active streak", color: "#8b5cf6", isText: true },
    { icon: Award, label: "Evidence-based readiness", value: summary.readinessScore, hint: "/100 demonstrated", color: "#6366f1" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${card.color}15`, border: `1px solid ${card.color}30` }}>
                <Icon size={13} style={{ color: card.color }} />
              </div>
              <span className="text-[10px] text-white/40 uppercase tracking-wider leading-tight">{card.label}</span>
            </div>
            <div className={`font-bold ${card.isText ? "text-sm" : "text-2xl"}`} style={{ color: card.color }}>{card.value}</div>
            <div className="text-[10px] text-white/30 mt-0.5 truncate">{card.hint}</div>
          </div>
        );
      })}
    </div>
  );
}