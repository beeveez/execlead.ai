import React from "react";
import { History } from "lucide-react";
import { getSyncHistory } from "@/lib/execKnowledgeSyncEngine";

export default function SyncHistory() {
  const history = getSyncHistory();
  if (history.length === 0) return null;
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <History size={14} className="text-white/40" />
        <h3 className="text-sm font-semibold text-white">Synchronization History</h3>
      </div>
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {history.map((h, i) => {
          const color = h.health >= 90 ? "#10b981" : h.health >= 70 ? "#f59e0b" : "#ef4444";
          return (
            <div key={i} className="flex items-center gap-3 text-xs bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-white/50">{new Date(h.timestamp).toLocaleString()}</span>
              <span className="text-white/20">·</span>
              <span style={{ color }}>{h.health}%</span>
              <span className="text-white/20">·</span>
              <span className="text-white/40">v{h.knowledgeVersion}</span>
              {h.newAssets > 0 && <><span className="text-white/20">·</span><span className="text-emerald-400">+{h.newAssets}</span></>}
              {h.removedAssets > 0 && <><span className="text-white/20">·</span><span className="text-red-400">-{h.removedAssets}</span></>}
              {h.errors > 0 && <><span className="text-white/20">·</span><span className="text-red-400">{h.errors} err</span></>}
              <span className="text-white/30 ml-auto">{h.duration}ms</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}