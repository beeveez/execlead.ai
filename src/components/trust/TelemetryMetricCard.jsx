import React from "react";
import {
  Activity, Gauge, Heart, ShieldCheck, Cpu, Rocket, Clock,
  AlertTriangle, TrendingUp, Server, Award, ChevronRight,
} from "lucide-react";
import { TELEMETRY_STATE_CONFIG } from "@/lib/platformTelemetryService";

const ICON_MAP = {
  Activity, Gauge, Heart, ShieldCheck, Cpu, Rocket, Clock,
  AlertTriangle, TrendingUp, Server, Award,
};

export default function TelemetryMetricCard({ metric, onClick }) {
  const config = TELEMETRY_STATE_CONFIG[metric.state] || TELEMETRY_STATE_CONFIG.waiting;
  const Icon = ICON_MAP[metric.icon] || Activity;

  return (
    <button
      onClick={() => onClick(metric)}
      className="text-left bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:border-white/15 hover:bg-white/[0.04] transition-all group cursor-pointer w-full"
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} style={{ color: config.color }} />
        <span className="text-[10px] text-white/40 uppercase tracking-wider flex-1 truncate">{metric.label}</span>
        <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${config.bg} ${config.border} border ${config.text} flex items-center gap-1 shrink-0`}>
          <span className={`w-1 h-1 rounded-full ${config.dotClass} ${metric.state === "live" ? "animate-pulse" : ""}`} />
          {config.label}
        </span>
      </div>
      <div className="text-sm font-bold text-white truncate">{metric.value}</div>
      {metric.sublabel && <div className="text-[10px] text-white/30 mt-0.5 truncate">{metric.sublabel}</div>}
      <div className="flex items-center gap-1 mt-2 text-[9px] text-white/20 group-hover:text-white/40 transition-colors">
        <ChevronRight size={9} /> View diagnostics
      </div>
    </button>
  );
}