import React from "react";
import {
  Gauge, Activity, ShieldCheck, Wrench, Brain, Rocket,
  Shield, Cpu, Building2, BarChart3, ChevronRight, Zap,
} from "lucide-react";

const ICON_MAP = {
  Gauge, Activity, ShieldCheck, Wrench, Brain, Rocket,
  Shield, Cpu, Building2, BarChart3,
};

const STATUS_CONFIG = {
  pass: { color: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/10", ring: "#10b981" },
  warn: { color: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/10", ring: "#f59e0b" },
  fail: { color: "text-red-400", bg: "bg-red-500/5", border: "border-red-500/10", ring: "#ef4444" },
};

const MATURITY_COLORS = {
  1: "#ef4444", 2: "#f97316", 3: "#f59e0b", 4: "#10b981", 5: "#06b6d4",
};

export default function GovernanceDomainCard({ domain, onClick }) {
  const cfg = STATUS_CONFIG[domain.status] || STATUS_CONFIG.pass;
  const Icon = ICON_MAP[domain.icon] || Gauge;
  const mColor = MATURITY_COLORS[domain.maturity.level] || "#f59e0b";

  return (
    <button
      onClick={onClick}
      className={`flex flex-col p-3 rounded-lg border ${cfg.bg} ${cfg.border} hover:bg-white/[0.04] transition-colors text-left group w-full`}
    >
      {/* Header */}
      <div className="flex items-start gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}>
          <Icon size={13} className={cfg.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white/80 text-xs font-medium truncate">{domain.name}</div>
          <div className="text-[9px] text-white/30 truncate">{domain.owner}</div>
        </div>
        <ChevronRight size={12} className="text-white/20 group-hover:text-white/40 transition-colors flex-shrink-0 mt-1" />
      </div>

      {/* Summary */}
      <p className="text-[10px] text-white/40 mb-2 line-clamp-2">{domain.summary.detail}</p>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-1 mb-2">
        {domain.summary.metrics.slice(0, 4).map((m) => (
          <div key={m.label} className="px-1.5 py-0.5 rounded bg-white/[0.02]">
            <div className="text-[8px] text-white/30 uppercase tracking-wider truncate">{m.label}</div>
            <div className="text-[10px] text-white/70 font-medium truncate">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Footer: Maturity + Health + Repair */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
        {/* Maturity Ring */}
        <div className="flex items-center gap-1.5">
          <div className="relative w-7 h-7 flex-shrink-0">
            <svg width="28" height="28" viewBox="0 0 28 28">
              <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
              <circle cx="14" cy="14" r="11" fill="none" stroke={mColor} strokeWidth="2.5"
                strokeDasharray={`${2 * Math.PI * 11 * (domain.maturity.level / 5)} ${2 * Math.PI * 11}`}
                strokeLinecap="round" transform="rotate(-90 14 14)" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[9px] font-bold text-white">{domain.maturity.level}</span>
            </div>
          </div>
          <div className="min-w-0">
            <div className="text-[8px] text-white/30 uppercase">Maturity</div>
            <div className="text-[9px] text-white/60 truncate">{domain.maturity.label}</div>
          </div>
        </div>

        {/* Health Score */}
        <div className="text-right">
          <div className="text-[8px] text-white/30 uppercase">Health</div>
          <div className={`text-[10px] font-bold ${cfg.color}`}>{domain.healthScore}%</div>
        </div>

        {/* Repair Badge */}
        {domain.canRepair && (
          <div className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
            <Zap size={8} className="text-emerald-400" />
            <span className="text-[8px] text-emerald-400">Repair</span>
          </div>
        )}
      </div>
    </button>
  );
}