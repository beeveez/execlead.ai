import React from "react";
import { CheckCircle2, Circle, ShieldCheck } from "lucide-react";
import { computeVerificationReadiness } from "@/lib/verificationIntelligenceEngine";

export default function VerificationReadiness({ verification }) {
  const { score, completed, pending } = computeVerificationReadiness(verification);
  const color = score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white/80">Verification Readiness™</h3>
      </div>
      <div className="flex items-center gap-5">
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
            <circle cx="32" cy="32" r="28" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset} className="transition-all duration-500" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-white">{score}%</span>
          </div>
        </div>
        <div className="flex-1 space-y-2 min-w-0">
          {completed.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] text-emerald-400 uppercase tracking-wider">Completed</div>
              {completed.map((c) => (
                <div key={c.key} className="flex items-center gap-1.5 text-xs text-white/60">
                  <CheckCircle2 size={11} className="text-emerald-400 shrink-0" /> {c.label}
                </div>
              ))}
            </div>
          )}
          {pending.length > 0 && (
            <div className="space-y-1">
              <div className="text-[10px] text-amber-400 uppercase tracking-wider">Pending</div>
              {pending.map((c) => (
                <div key={c.key} className="flex items-center gap-1.5 text-xs text-white/40">
                  <Circle size={11} className="text-white/20 shrink-0" /> {c.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}