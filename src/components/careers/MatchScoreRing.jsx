import React from "react";
import { getMatchColor, getMatchLabel } from "@/lib/careerMarketplace";

export default function MatchScoreRing({ score, size = 48, showLabel = false }) {
  if (score === null || score === undefined) {
    return (
      <div
        className="rounded-full border-2 border-white/10 flex items-center justify-center text-white/30 text-xs font-medium"
        style={{ width: size, height: size }}
      >
        —
      </div>
    );
  }

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const color = getMatchColor(score);
  const fontSize = size < 50 ? 13 : 16;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center font-bold text-white"
          style={{ fontSize, transform: `rotate(0deg)` }}
        >
          {score}
          <span className="text-[8px] ml-0.5 mt-1">%</span>
        </div>
      </div>
      {showLabel && (
        <span className="text-[10px] font-medium" style={{ color }}>
          {getMatchLabel(score)}
        </span>
      )}
    </div>
  );
}