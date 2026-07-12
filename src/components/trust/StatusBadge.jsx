import React from "react";
import { STATUS_CONFIG } from "@/lib/trustCenterData";

export default function StatusBadge({ status, size = "sm" }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.not_started;
  const sizeClass = size === "sm" ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-1";
  return (
    <span className={`inline-flex items-center gap-1 rounded border whitespace-nowrap ${config.bg} ${config.border} ${config.text} ${sizeClass}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }} />
      {config.label}
    </span>
  );
}