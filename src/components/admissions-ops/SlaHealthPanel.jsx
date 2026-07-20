import React from "react";
import { Clock, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { SLA_CONFIG, SLA_HEALTH } from "@/lib/admissionsOperationsEngine";

export default function SlaHealthPanel({ slaHealth }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock size={14} className="text-amber-400" />
        <h3 className="text-sm font-semibold text-white/70">Admissions SLA™ — Service Level Compliance</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(slaHealth).map(([key, sla]) => {
          const health = sla.breached > 0 ? SLA_HEALTH.breached : sla.approaching_max > 0 ? SLA_HEALTH.approaching_max : SLA_HEALTH.within_target;
          return (
            <div key={key} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-white/70">{sla.label}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full ${health.badge}`}>{health.label}</span>
              </div>
              <p className="text-[10px] text-white/30 mb-3">{sla.description}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-sm font-bold text-emerald-400">{sla.within_target}</div>
                  <div className="text-[9px] text-white/30">On Track</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-amber-400">{sla.approaching_max}</div>
                  <div className="text-[9px] text-white/30">At Risk</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-red-400">{sla.breached}</div>
                  <div className="text-[9px] text-white/30">Breached</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-white/30">Target: {sla.target_hours}h · Max: {sla.max_hours}h</span>
                <span className="text-xs font-bold text-white/60">{sla.compliance_pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}