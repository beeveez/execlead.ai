import React from "react";
import { Link } from "react-router-dom";
import { Check, AlertTriangle, ShieldCheck } from "lucide-react";

export default function AccountHealthScore({ score, contributors }) {
  const scoreColor = score >= 90 ? "#10b981" : score >= 70 ? "#f59e0b" : "#ef4444";
  const circumference = 2 * Math.PI * 32;
  const offset = circumference - (Math.min(score, 100) / 100) * circumference;

  return (
    <Link to="/security" className="block">
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:bg-white/[0.04] hover:border-white/10 transition-all group cursor-pointer">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={13} className="text-indigo-400" />
          <div className="text-[11px] text-white/40 uppercase tracking-wider font-medium">Account Health</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="32" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              <circle
                cx="36" cy="36" r="32" fill="none" stroke={scoreColor} strokeWidth="6"
                strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold" style={{ color: scoreColor }}>{score}%</span>
            </div>
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            {contributors.map((c, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[11px]">
                {c.status === "ok"
                  ? <Check size={10} className="text-emerald-400 shrink-0" />
                  : <AlertTriangle size={10} className="text-amber-400 shrink-0" />}
                <span className={c.status === "ok" ? "text-white/50" : "text-amber-400/80"}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 text-[10px] text-white/20 group-hover:text-indigo-400/60 transition-colors text-center">
          Click to open Security Center
        </div>
      </div>
    </Link>
  );
}