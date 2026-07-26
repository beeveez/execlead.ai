import React from "react";
import { ShieldCheck, AlertTriangle, XCircle, Rocket } from "lucide-react";

export default function ReadinessHero({ result }) {
  const { overallScore, status, recommendation, summary } = result;
  const isCertified = status === "certified";
  const isBlocked = status === "release_blocked";

  const statusConfig = {
    certified: { label: "🟢 Certified", icon: ShieldCheck, color: "emerald" },
    requires_attention: { label: "🟡 Requires Attention", icon: AlertTriangle, color: "amber" },
    release_blocked: { label: "🔴 Release Blocked", icon: XCircle, color: "red" },
  };
  const sc = statusConfig[status];
  const StatusIcon = sc.icon;

  const recConfig = {
    GO: { label: "GO", color: "text-emerald-400", bg: "bg-emerald-500/10", ring: "ring-emerald-500/30" },
    GO_WITH_CONDITIONS: { label: "GO WITH CONDITIONS", color: "text-amber-400", bg: "bg-amber-500/10", ring: "ring-amber-500/30" },
    NO_GO: { label: "NO GO", color: "text-red-400", bg: "bg-red-500/10", ring: "ring-red-500/30" },
  };
  const rc = recConfig[recommendation];

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (overallScore / 100) * circumference;
  const strokeColor = isCertified ? "#10b981" : isBlocked ? "#ef4444" : "#f59e0b";

  return (
    <div className="bg-[#0d0d14] border border-white/10 rounded-2xl p-8">
      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Score Ring */}
        <div className="relative flex-shrink-0">
          <svg width="180" height="180" viewBox="0 0 180 180" className="transform -rotate-90">
            <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
            <circle
              cx="90" cy="90" r={radius} fill="none" stroke={strokeColor} strokeWidth="12"
              strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold text-white">{overallScore}</span>
            <span className="text-xs text-white/50 mt-1">/ 100</span>
          </div>
        </div>

        {/* Status & Recommendation */}
        <div className="flex-1 text-center lg:text-left">
          <p className="text-xs uppercase tracking-widest text-white/40 mb-2">Overall Readiness Score</p>
          <div className="flex flex-wrap items-center gap-3 mb-4 justify-center lg:justify-start">
            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium ${sc.color === "emerald" ? "bg-emerald-500/10 text-emerald-400" : sc.color === "amber" ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"}`}>
              <StatusIcon className="w-4 h-4" />
              {sc.label}
            </span>
            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold ring-1 ${rc.bg} ${rc.color} ${rc.ring}`}>
              <Rocket className="w-4 h-4" />
              {rc.label}
            </span>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Passed", value: summary.totalPassed, color: "text-emerald-400" },
              { label: "Failed", value: summary.totalFailed, color: "text-red-400" },
              { label: "Pending", value: summary.totalPending, color: "text-slate-400" },
              { label: "Blocked", value: summary.blockedItems, color: "text-red-400" },
            ].map((s) => (
              <div key={s.label} className="bg-white/[0.03] border border-white/5 rounded-lg p-3 text-center">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}