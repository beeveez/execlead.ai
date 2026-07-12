import React from "react";
import SectionCard from "./SectionCard";
import { Building2 } from "lucide-react";
import { STATUS_CONFIG } from "@/lib/founderMissionControl";

export default function EnterpriseReadiness({ enterprise }) {
  return (
    <SectionCard
      title="Enterprise Readiness"
      subtitle={`${enterprise.enterpriseScore}% ready · ${enterprise.complianceReady}/${enterprise.complianceTotal} compliance frameworks`}
      icon={Building2}
      accent="cyan"
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
        {enterprise.items.map((item) => {
          const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.not_started;
          return (
            <div key={item.id} className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white/70 truncate">{item.label}</div>
                <div className="text-[10px]" style={{ color: cfg.color }}>{cfg.label}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="space-y-1.5">
        <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Compliance Roadmap</div>
        {enterprise.complianceFrameworks.slice(0, 5).map((fw) => {
          const cfg = STATUS_CONFIG[fw.status] || STATUS_CONFIG.not_started;
          return (
            <div key={fw.name} className="flex items-center justify-between text-xs">
              <span className="text-white/60">{fw.name}</span>
              <span style={{ color: cfg.color }}>{cfg.label}</span>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}