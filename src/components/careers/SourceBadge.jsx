import React from "react";
import { getSourceMeta, formatSyncTime } from "@/lib/careerMarketplace";

export default function SourceBadge({ sourceType, sourceName, lastSynced, showSyncTime = false }) {
  const meta = getSourceMeta(sourceType);
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
        style={{ backgroundColor: `${meta.color}15`, color: meta.color }}
      >
        <span>{meta.icon}</span>
        {sourceName || meta.label}
      </span>
      {showSyncTime && (
        <span className="text-[10px] text-white/25">
          synced {formatSyncTime(lastSynced)}
        </span>
      )}
    </div>
  );
}