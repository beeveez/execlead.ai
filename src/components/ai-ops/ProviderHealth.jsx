import React from "react";
import Panel from "./Panel";
import { Radio } from "lucide-react";
import { PROVIDER_META, fmtMs, fmtPct, fmtCost, fmtNum } from "@/lib/aiOperations";

const STATUS_COLORS = { healthy: "bg-emerald-400", slow: "bg-amber-400", offline: "bg-red-400" };
const STATUS_LABELS = { healthy: "Healthy", slow: "Slow", offline: "Offline" };

export default function ProviderHealth({ analytics }) {
  const providers = analytics.byProvider;
  if (providers.length === 0) return null;
  return (
    <Panel title="AI Provider Status" icon={Radio}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {providers.map((p) => {
          const meta = PROVIDER_META[p.provider] || PROVIDER_META.unknown;
          return (
            <div key={p.provider} className="bg-white/[0.02] border border-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                  <span className="text-sm font-semibold text-white">{meta.label}</span>
                </div>
                <span className="flex items-center gap-1.5 text-[10px] font-medium text-white/50">
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[p.status]} ${p.status !== "healthy" ? "animate-pulse" : ""}`} />
                  {STATUS_LABELS[p.status]}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-y-2 text-xs">
                <div><div className="text-white/30">Requests</div><div className="text-white font-medium">{fmtNum(p.requests)}</div></div>
                <div><div className="text-white/30">Avg Latency</div><div className="text-white font-medium">{fmtMs(p.avgLatency)}</div></div>
                <div><div className="text-white/30">Error Rate</div><div className={`font-medium ${p.errorRate > 5 ? "text-red-400" : "text-white"}`}>{fmtPct(p.errorRate)}</div></div>
                <div><div className="text-white/30">Est. Cost</div><div className="text-white font-medium">{fmtCost(p.cost)}</div></div>
              </div>
              {p.lastActivity > 0 && (
                <div className="text-[10px] text-white/20 mt-2 pt-2 border-t border-white/5">
                  Last activity: {new Date(p.lastActivity).toLocaleString()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}