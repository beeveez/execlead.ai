import React from "react";
import {
  Activity, Gauge, TrendingUp, Brain, ShieldCheck, Shield,
  Rocket, Boxes, Cpu,
} from "lucide-react";

const ICON_MAP = {
  Activity, Gauge, TrendingUp, Brain, ShieldCheck, Shield,
  Rocket, Boxes, Cpu,
};

const STATUS_CONFIG = {
  pass: { color: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/10", dot: "bg-emerald-500" },
  warn: { color: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/10", dot: "bg-amber-500" },
  fail: { color: "text-red-400", bg: "bg-red-500/5", border: "border-red-500/10", dot: "bg-red-500" },
};

export default function ExecutiveOperationsRibbon({ ribbon }) {
  return (
    <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
      {ribbon.map((metric) => {
        const Icon = ICON_MAP[metric.icon] || Activity;
        const cfg = STATUS_CONFIG[metric.status] || STATUS_CONFIG.pass;
        const display = metric.displayValue || `${metric.value}${metric.unit || ""}`;
        return (
          <div
            key={metric.id}
            className={`flex flex-col items-center justify-center p-2.5 rounded-lg border ${cfg.bg} ${cfg.border} text-center min-w-0`}
          >
            <div className="flex items-center gap-1 mb-1">
              <Icon size={11} className={cfg.color} />
              <span className="text-[8px] text-white/40 uppercase tracking-wider truncate">{metric.label}</span>
            </div>
            <div className={`text-sm font-bold ${cfg.color} truncate w-full`}>{display}</div>
            <div className={`w-1 h-1 rounded-full ${cfg.dot} mt-1`} />
          </div>
        );
      })}
    </div>
  );
}