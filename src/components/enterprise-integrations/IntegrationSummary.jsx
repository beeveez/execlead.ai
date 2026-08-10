import React from "react";
import { CheckCircle2, Clock, AlertTriangle, Power } from "lucide-react";

export default function IntegrationSummary({ items }) {
  const connected = items.filter((i) => i.connection_status === "connected" && i.enterprise_enabled).length;
  const available = items.filter((i) => i.connection_status === "available").length;
  const custom = items.filter((i) => i.connection_status === "custom_required").length;
  const disabled = items.filter((i) => !i.enterprise_enabled).length;
  const phase1 = items.filter((i) => i.phase === "phase_1").length;
  const phase2 = items.filter((i) => i.phase === "phase_2").length;
  const stats = [
    { icon: CheckCircle2, label: "Connected", value: connected, color: "text-emerald-400" },
    { icon: Clock, label: "Available", value: available, color: "text-indigo-400" },
    { icon: AlertTriangle, label: "Custom Required", value: custom, color: "text-amber-400" },
    { icon: Power, label: "Disabled", value: disabled, color: "text-rose-400" },
  ];
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <s.icon size={15} className={`${s.color} mb-2`} />
            <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-0.5">{s.label}</div>
            <div className="text-lg font-bold text-white">{s.value}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-[11px] text-white/45">
        <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">Phase 1 (P0): {phase1} curated</span>
        <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">Phase 2 (P1): {phase2} curated</span>
      </div>
    </div>
  );
}