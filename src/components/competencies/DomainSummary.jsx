import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { computeDomainSummary } from "@/lib/competencyCatalog";

export default function DomainSummary({ competencies }) {
  const domains = computeDomainSummary(competencies);
  const active = domains.filter((d) => d.count > 0);
  if (active.length === 0) return null;

  return (
    <div className="mb-4 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-white font-semibold text-sm">Executive Capability Domains</h3>
        <span className="text-[10px] text-white/20">EECF™ v1.0</span>
      </div>
      <div className="space-y-2.5">
        {domains.map((d) => {
          const Icon = d.icon;
          const pct = d.avgScore;
          return (
            <div key={d.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${d.color}15` }}>
                <Icon size={14} style={{ color: d.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-white/70 truncate">{d.label}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {d.growing > 0 && <TrendingUp size={10} className="text-emerald-400" />}
                    <span className="text-[10px] text-white/30">{d.count}</span>
                    <span className="text-xs font-bold tabular-nums" style={{ color: pct > 0 ? d.color : "rgba(255,255,255,0.2)" }}>{pct}%</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: d.color, opacity: d.count > 0 ? 1 : 0.2 }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}