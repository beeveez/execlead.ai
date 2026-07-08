import React from "react";
import Panel from "./Panel";
import { Radio } from "lucide-react";
import { MODULE_LABELS, modelLabel, STATUS_META, fmtNum, fmtCost, fmtMs } from "@/lib/aiOperations";

export default function ActivityFeed({ analytics }) {
  const recent = analytics.recent;
  if (recent.length === 0) return null;
  return (
    <Panel title="Recent AI Activity" icon={Radio} action={<span className="flex items-center gap-1 text-[10px] text-emerald-400"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live</span>}>
      <div className="space-y-1 max-h-80 overflow-y-auto">
        {recent.map((l, i) => {
          const status = STATUS_META[l.status || "success"] || STATUS_META.success;
          return (
            <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-white/[0.02] text-xs">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: status.color }} />
              <span className="text-white/30 w-16 shrink-0">{new Date(l.created_date).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}</span>
              <span className="text-white/60 w-28 shrink-0 truncate">{MODULE_LABELS[l.module] || l.module}</span>
              <span className="text-white/40 w-28 shrink-0 truncate">{modelLabel(l.model)}</span>
              <span className="text-white/50 w-16 shrink-0 text-right">{fmtNum(l.tokens_estimated || 0)} tok</span>
              <span className="text-emerald-400/70 w-16 shrink-0 text-right">{fmtCost(l.cost_estimated || 0)}</span>
              <span className="text-white/40 w-14 shrink-0 text-right">{l.response_time_ms ? fmtMs(l.response_time_ms) : "—"}</span>
              <span className="text-white/40 ml-auto truncate">{status.label}</span>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}