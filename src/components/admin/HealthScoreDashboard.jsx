import React from "react";
import { ShieldCheck, AlertTriangle, Activity, Route as RouteIcon, KeyRound, Boxes, Cpu } from "lucide-react";

function ScoreRing({ value, label, icon: Icon, color }) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center gap-4">
      <div className="relative w-20 h-20 shrink-0">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 0.6s ease" }} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-white">{value}%</span>
        </div>
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-white/50 text-xs uppercase tracking-wider">
          <Icon size={12} style={{ color }} /> {label}
        </div>
        <div className="text-sm text-white/70 mt-0.5">
          {value === 100 ? "All checks passed" : value >= 90 ? "Minor issues" : "Needs attention"}
        </div>
      </div>
    </div>
  );
}

export default function HealthScoreDashboard({ health, counts }) {
  const overallColor = health.overall >= 95 ? "#10b981" : health.overall >= 80 ? "#f59e0b" : "#ef4444";
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-widest mb-1">
              <Activity size={12} /> Platform Health
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold" style={{ color: overallColor }}>{health.overall}%</span>
              <span className="text-sm text-white/40">overall integrity</span>
            </div>
            <div className="flex items-center gap-3 mt-3 text-xs">
              <span className="flex items-center gap-1 text-red-400"><AlertTriangle size={12} /> {counts.critical} critical</span>
              <span className="flex items-center gap-1 text-amber-400"><AlertTriangle size={12} /> {counts.warning} warnings</span>
              <span className="flex items-center gap-1 text-blue-400"><ShieldCheck size={12} /> {counts.information} info</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/40 uppercase tracking-wider">Status</div>
            <div className="text-lg font-semibold" style={{ color: overallColor }}>
              {health.overall >= 95 ? "Healthy" : health.overall >= 80 ? "Degraded" : "Critical"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <ScoreRing value={health.navigation} label="Navigation" icon={RouteIcon} color="#6366f1" />
        <ScoreRing value={health.routes} label="Routes" icon={RouteIcon} color="#06b6d4" />
        <ScoreRing value={health.permissions} label="Permissions" icon={KeyRound} color="#a855f7" />
        <ScoreRing value={health.features} label="Features" icon={Boxes} color="#f59e0b" />
        <ScoreRing value={health.api} label="API & Plans" icon={Cpu} color="#10b981" />
      </div>
    </div>
  );
}