import React from "react";
import { ShieldCheck } from "lucide-react";

const DIMENSIONS = [
  { key: "evidenceCompleteness", label: "Evidence Completeness", color: "#6366f1" },
  { key: "reliability", label: "Reliability", color: "#f59e0b" },
  { key: "predictionAccuracy", label: "Prediction Accuracy", color: "#8b5cf6" },
  { key: "outcomeValidation", label: "Outcome Validation", color: "#10b981" },
  { key: "calibration", label: "Calibration", color: "#0ea5e9" },
];

const GRADE_COLORS = {
  Excellent: "#10b981",
  Good: "#84cc16",
  Average: "#f59e0b",
  Weak: "#ef4444",
};

/**
 * AITrustScorePanel — renders the AI Trust Score™: overall score, grade, and
 * the five trust dimensions (evidence completeness, reliability, prediction
 * accuracy, outcome validation, calibration).
 */
export default function AITrustScorePanel({ trustScore }) {
  if (!trustScore) return null;
  const gradeColor = GRADE_COLORS[trustScore.grade] || "#f59e0b";

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div>
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400" />
            AI Trust Score™
          </h3>
          <p className="text-white/40 text-[11px] mt-0.5">Trust earned through evidence, accuracy, and validated outcomes</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white">{trustScore.overall}<span className="text-base text-white/30">/100</span></div>
          <div className="text-xs font-medium" style={{ color: gradeColor }}>{trustScore.grade}</div>
        </div>
      </div>

      <div className="space-y-2.5">
        {DIMENSIONS.map((d) => {
          const val = trustScore[d.key] || 0;
          return (
            <div key={d.key} className="flex items-center gap-3">
              <span className="text-[11px] text-white/60 w-36 flex-shrink-0">{d.label}</span>
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${val}%`, background: d.color }} />
              </div>
              <span className="text-[11px] text-white/50 w-8 text-right">{val}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}