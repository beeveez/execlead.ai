import React from "react";
import { ENTERPRISE_ROI_METRICS } from "@/lib/enterpriseCommercialArchitecture";

export default function EnterpriseROIMetrics({ data = {} }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {ENTERPRISE_ROI_METRICS.map((m) => {
        const val = data[m.key];
        const hasVal = val !== undefined && val !== null;
        return (
          <div key={m.key} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mb-1">{m.label}</div>
            <div className="text-2xl font-bold text-white mb-1.5">
              {hasVal ? val : <span className="text-white/30 text-base font-medium">Collecting</span>}
            </div>
            <p className="text-white/45 text-[11px] leading-relaxed">{m.description}</p>
          </div>
        );
      })}
    </div>
  );
}