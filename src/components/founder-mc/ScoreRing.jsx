import React from "react";

export default function ScoreRing({ score, size = 80, label, color }) {
  const c = color || (score >= 90 ? "#10b981" : score >= 75 ? "#6366f1" : score >= 60 ? "#f59e0b" : "#ef4444");
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="7" className="text-white/5" />
        <circle cx="50" cy="50" r={radius} fill="none" stroke={c} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 0.5s ease" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-white">{score}</span>
        {label && <span className="text-[9px] text-white/40 uppercase tracking-wider">{label}</span>}
      </div>
    </div>
  );
}