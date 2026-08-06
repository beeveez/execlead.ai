import React from "react";
import { COMMERCIAL_KPIS } from "@/lib/enterpriseCommercialArchitecture";

export default function CommercialKpiGrid({ data = {} }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {COMMERCIAL_KPIS.map((k) => {
        const val = data[k.key];
        const has = val !== undefined && val !== null;
        return (
          <div key={k.key} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mb-1.5">{k.label}</div>
            <div className="text-xl font-bold text-white">
              {has ? val : <span className="text-white/30 text-sm font-medium">Collecting</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}