import React from "react";
import { TRUST_LEVELS, calculateTrustScore, calculateTrustLevel } from "@/lib/trustEngine";

export default function TrustScoreCard({ verification }) {
  const score = calculateTrustScore(verification);
  const level = calculateTrustLevel(verification);
  const levelMeta = TRUST_LEVELS.find(l => l.level === level);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const strokeColor = levelMeta?.color || "#64748b";

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 flex items-center gap-6">
      <div className="relative w-32 h-32 flex-shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle
            cx="60" cy="60" r={radius} fill="none"
            stroke={strokeColor} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.3s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{score}</span>
          <span className="text-white/30 text-xs">/ 100</span>
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-white/30 text-xs uppercase tracking-widest mb-1">Executive Trust</div>
        <div className="text-white font-bold text-lg truncate">
          {levelMeta ? levelMeta.display : "Unverified"}
        </div>
        <div className="text-white/40 text-sm mt-1">
          Trust Level {level} of 5
        </div>
        {level < 5 && (
          <div className="text-white/30 text-xs mt-2">
            {100 - score} points to maximum trust
          </div>
        )}
      </div>
    </div>
  );
}