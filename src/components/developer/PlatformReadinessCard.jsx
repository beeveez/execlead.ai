import React from "react";
import { ShieldCheck } from "lucide-react";
import { usePlatformState } from "@/lib/PlatformStateContext";

export default function PlatformReadinessCard() {
  const { readiness } = usePlatformState();
  if (!readiness) return null;

  const { overall, label, signals } = readiness;
  const color =
    overall >= 95 ? "#10b981" : overall >= 85 ? "#3b82f6" : overall >= 70 ? "#f59e0b" : "#ef4444";

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck size={16} className="text-emerald-400" />
        <h3 className="text-sm font-bold text-white">Platform Readiness Index™</h3>
      </div>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-shrink-0">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
            <circle
              cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 42 * (overall / 100)} ${2 * Math.PI * 42}`}
              strokeLinecap="round" transform="rotate(-90 50 50)"
              style={{ transition: "stroke-dasharray 1s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{overall}%</span>
          </div>
        </div>
        <div>
          <div className="text-white font-semibold text-sm">{label}</div>
          <div className="text-white/30 text-xs mt-1">{signals.length} signals weighted</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {signals.map((s) => (
          <div key={s.name} className="flex items-center justify-between text-xs">
            <span className="text-white/40 truncate">{s.name}</span>
            <span className={`ml-2 font-medium ${s.score >= 90 ? "text-emerald-400" : s.score >= 70 ? "text-amber-400" : "text-red-400"}`}>
              {s.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}