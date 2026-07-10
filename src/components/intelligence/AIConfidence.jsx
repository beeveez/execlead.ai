import React, { useState } from "react";
import { Info } from "lucide-react";

const SIGNAL_SOURCES = [
  { id: "leadership_dna", label: "Leadership DNA™", icon: "🧬" },
  { id: "resume", label: "Resume Intelligence", icon: "📄" },
  { id: "simulations", label: "Executive Simulations", icon: "🎯" },
  { id: "learning", label: "Learning Progress", icon: "📚" },
  { id: "reputation", label: "Executive Reputation", icon: "⭐" },
  { id: "career", label: "Career History", icon: "💼" },
  { id: "content", label: "Published Content", icon: "✍️" },
  { id: "community", label: "Community Activity", icon: "🤝" },
];

/**
 * AIConfidence — displays AI confidence percentage and the signal sources
 * that contribute to it, with a hover tooltip explaining the scoring.
 */
export default function AIConfidence({ readiness, journey }) {
  const [showTip, setShowTip] = useState(false);
  const confidence = readiness?.confidence || "Low";
  const confidencePct = confidence === "High" ? 91 : confidence === "Medium" ? 65 : 30;

  // Determine which signals are active from journey data
  const breakdown = journey?.breakdown || {};
  const activeSignals = SIGNAL_SOURCES.filter((s) => {
    if (s.id === "leadership_dna") return (breakdown.leadership_dna?.count || 0) > 0;
    if (s.id === "resume") return (breakdown.resume?.count || 0) > 0;
    if (s.id === "simulations") return (breakdown.simulations?.count || 0) > 0;
    if (s.id === "learning") return (breakdown.academy?.count || 0) > 0;
    if (s.id === "reputation") return (breakdown.reputation?.count || 0) > 0;
    if (s.id === "career") return true;
    if (s.id === "content") return (breakdown.letters?.count || 0) > 0;
    if (s.id === "community") return (breakdown.community_recognition?.count || 0) > 0;
    return false;
  });

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-white/40 text-xs uppercase tracking-widest">AI Confidence</h3>
          <button onMouseEnter={() => setShowTip(true)} onMouseLeave={() => setShowTip(false)} className="text-white/20 hover:text-white/40">
            <Info size={12} />
          </button>
          {showTip && (
            <div className="absolute z-50 mt-8 ml-4 w-64 bg-[#0d0d14] border border-white/10 rounded-lg p-3 text-xs text-white/50 shadow-xl">
              Higher confidence means more evidence has been collected across the platform's intelligence signals.
            </div>
          )}
        </div>
        <span className={`text-2xl font-bold ${confidencePct >= 70 ? "text-emerald-400" : confidencePct >= 40 ? "text-amber-400" : "text-red-400"}`}>
          {confidencePct}%
        </span>
      </div>

      {/* Confidence bar */}
      <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full ${confidencePct >= 70 ? "bg-emerald-500" : confidencePct >= 40 ? "bg-amber-500" : "bg-red-500/60"}`}
          style={{ width: `${confidencePct}%` }}
        />
      </div>

      {/* Signal sources */}
      <div className="flex flex-wrap gap-2">
        {SIGNAL_SOURCES.map((s) => {
          const active = activeSignals.includes(s);
          return (
            <span
              key={s.id}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all ${
                active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/[0.02] text-white/20 border-white/5"
              }`}
            >
              <span>{s.icon}</span>
              {s.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}