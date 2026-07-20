import React from "react";
import { ShieldCheck } from "lucide-react";
import { computeEvidenceConfidence } from "@/lib/verificationIntelligenceEngine";

const LEVEL_COLORS = { high: "text-emerald-400", medium: "text-amber-400", low: "text-red-400" };
const STATUS_COLORS = { verified: "bg-emerald-500", pending: "bg-amber-500", not_started: "bg-white/10" };

export default function EvidenceConfidenceBreakdown({ verification }) {
  const { score, level, breakdown } = computeEvidenceConfidence(verification);
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (score / 100) * circumference;
  const color = level === "high" ? "#10b981" : level === "medium" ? "#f59e0b" : "#ef4444";

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white/80">Evidence Confidence™</h3>
      </div>
      <div className="flex items-center gap-5 mb-4">
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
            <circle cx="32" cy="32" r="28" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-500" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-white">{score}%</span>
            <span className={`text-[9px] uppercase ${LEVEL_COLORS[level]}`}>{level}</span>
          </div>
        </div>
        <p className="text-xs text-white/40 leading-relaxed flex-1">
          Confidence is calculated from verified evidence across identity, employment, certifications,
          and organizational verification. Higher confidence means stronger trust signals.
        </p>
      </div>
      <div className="space-y-1.5">
        {breakdown.map((item) => (
          <div key={item.key} className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_COLORS[item.status] || "bg-white/10"}`} />
            <span className="text-white/50 flex-1 truncate">{item.label}</span>
            <span className="text-white/30">{Math.round(item.contribution)}/{item.weight}</span>
          </div>
        ))}
      </div>
    </div>
  );
}