import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { READINESS_SCORES } from "@/lib/scalabilityAssessmentEngine";

/**
 * Readiness Scores — 7 dimensions rated 0–100.
 */
export default function ReadinessScores() {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <h3 className="text-sm font-bold text-white mb-4">Readiness Scores</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {READINESS_SCORES.map((item) => {
          const color = item.score >= 80 ? "#10b981" : item.score >= 70 ? "#f59e0b" : "#ef4444";
          return (
            <div key={item.dimension} className="rounded-lg bg-white/[0.02] border border-white/5 p-4">
              <div className="flex items-center gap-3 mb-2">
                {/* Score Ring */}
                <div className="relative flex-shrink-0">
                  <svg width="44" height="44" viewBox="0 0 44 44">
                    <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                    <circle
                      cx="22" cy="22" r="18" fill="none" stroke={color} strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 18 * (item.score / 100)} ${2 * Math.PI * 18}`}
                      strokeLinecap="round" transform="rotate(-90 22 22)"
                      style={{ transition: "stroke-dasharray 0.8s ease" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-white">{item.score}</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-white">{item.dimension}</span>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed">{item.rationale}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}