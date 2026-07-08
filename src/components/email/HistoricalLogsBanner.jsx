import React from "react";
import { AlertTriangle, Archive, Info } from "lucide-react";

export default function HistoricalLogsBanner({ historicalCount }) {
  if (!historicalCount || historicalCount === 0) return null;

  return (
    <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
          <Archive size={16} className="text-blue-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-blue-400 font-medium text-sm">Historical Logs Available</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 uppercase tracking-wider">{historicalCount} records</span>
          </div>
          <p className="text-white/40 text-sm mt-1 leading-relaxed">
            {historicalCount} email event{historicalCount !== 1 ? "s" : ""} with delivery failures were recorded <span className="text-white/60 font-medium">before the email provider was configured</span>.
            These are preserved for audit purposes and are not indicative of current configuration issues.
            Current delivery status is shown separately in the Dashboard and Diagnostics tabs.
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-blue-300/60">
            <Info size={11} />
            Historical records are marked with a "Historical" badge in the Delivery Logs.
          </div>
        </div>
      </div>
    </div>
  );
}