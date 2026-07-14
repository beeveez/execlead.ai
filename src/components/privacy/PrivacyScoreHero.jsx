import React from "react";
import { ShieldCheck, TrendingUp } from "lucide-react";
import { PRIVACY_CONTROLS, calculatePrivacyReadinessScore } from "@/lib/privacyEngine";

export default function PrivacyScoreHero() {
  const score = calculatePrivacyReadinessScore();
  const passed = PRIVACY_CONTROLS.filter((c) => c.current >= c.target).length;
  const total = PRIVACY_CONTROLS.length;
  const scoreColor = score >= 95 ? "text-emerald-400" : score >= 80 ? "text-amber-400" : "text-red-400";

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-5">
        <ShieldCheck size={18} className="text-emerald-400" />
        <h3 className="text-white font-semibold text-sm">Privacy Readiness Score™</h3>
      </div>

      <div className="flex items-end gap-6 mb-6">
        <div>
          <div className={`text-5xl font-bold ${scoreColor}`}>{score}</div>
          <div className="text-white/30 text-xs mt-1">out of 100</div>
        </div>
        <div className="flex-1 pb-2">
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${score >= 95 ? "bg-emerald-500" : score >= 80 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${score}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-white/40 text-xs">{passed}/{total} controls at target</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
              <TrendingUp size={12} /> RA 10173 Aligned
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {PRIVACY_CONTROLS.map((c) => {
          const pct = Math.round((c.current / c.target) * 100);
          const isPass = pct >= 100;
          return (
            <div key={c.id} className="flex items-center justify-between px-3 py-2 bg-white/[0.02] rounded-lg">
              <span className="text-white/50 text-xs">{c.label}</span>
              <span className={`text-xs font-medium ${isPass ? "text-emerald-400" : "text-amber-400"}`}>
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}