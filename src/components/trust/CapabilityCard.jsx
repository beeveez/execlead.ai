import React from "react";
import StatusBadge from "./StatusBadge";

export default function CapabilityCard({ item }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-sm font-medium text-white/80">{item.name}</span>
        <StatusBadge status={item.status} />
      </div>
      {item.detail && <p className="text-[11px] text-white/40 leading-relaxed">{item.detail}</p>}
    </div>
  );
}