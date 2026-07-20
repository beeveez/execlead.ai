import React from "react";
import { Snowflake, ShieldCheck, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { ARCHITECTURE_FREEZE } from "@/lib/execVerifiedFreeze";

export default function FreezeOverview({ health }) {
  const statusColor = health?.status === "healthy" ? "text-emerald-400" : health?.status === "degraded" ? "text-amber-400" : "text-red-400";
  const StatusIcon = health?.status === "healthy" ? CheckCircle2 : health?.status === "degraded" ? AlertTriangle : XCircle;

  return (
    <div className="space-y-4">
      {/* Freeze Banner */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/5 border border-indigo-500/15 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
            <Snowflake size={22} className="text-indigo-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-white">Architecture Freeze</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">v{ARCHITECTURE_FREEZE.version}</span>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">{ARCHITECTURE_FREEZE.philosophy}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5">
          <FreezeField label="Architecture" value={ARCHITECTURE_FREEZE.architecture_status} />
          <FreezeField label="Development" value={ARCHITECTURE_FREEZE.development_status} />
          <FreezeField label="Feature" value={ARCHITECTURE_FREEZE.feature_status} />
          <FreezeField label="Maturity" value={ARCHITECTURE_FREEZE.maturity} />
          <FreezeField label="Production" value={ARCHITECTURE_FREEZE.production_readiness} />
        </div>
      </div>

      {/* Overall Health */}
      {health && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-indigo-400" />
              <h3 className="text-sm font-semibold text-white/80">Overall Health</h3>
            </div>
            <span className="text-[10px] text-white/30">Last validation: {new Date().toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                <circle cx="40" cy="40" r="34" fill="none" stroke={health.score === 100 ? "#10b981" : health.score >= 80 ? "#f59e0b" : "#ef4444"} strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 34}
                  strokeDashoffset={2 * Math.PI * 34 - (health.score / 100) * 2 * Math.PI * 34}
                  className="transition-all duration-500" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-white">{health.score}</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <StatusIcon size={14} className={statusColor} />
                <span className={`text-sm font-medium capitalize ${statusColor}`}>{health.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <HealthBar label="Dependencies" score={health.depScore} />
                <HealthBar label="Test Suite" score={health.testScore} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FreezeField({ label, value }) {
  return (
    <div>
      <div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div>
      <div className="text-xs text-white/70 font-medium mt-0.5">{value}</div>
    </div>
  );
}

function HealthBar({ label, score }) {
  const color = score === 100 ? "bg-emerald-500" : score >= 80 ? "bg-amber-500" : "bg-red-500";
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] text-white/40 mb-1">
        <span>{label}</span><span>{score}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}