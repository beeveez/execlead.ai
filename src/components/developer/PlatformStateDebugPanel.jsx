import React, { useState } from "react";
import { ChevronDown, ChevronRight, Bug, Database, Clock, GitCommit, RefreshCw, Cpu } from "lucide-react";
import { usePlatformState } from "@/lib/PlatformStateContext";

export default function PlatformStateDebugPanel() {
  const [expanded, setExpanded] = useState(false);
  const state = usePlatformState();

  if (!state) return null;

  const { cacheVersion, runtimeVersion, manifestVersion, knowledgeVersion, cacheTimestamp, lastRefresh, lastCommit, lastBroadcast, subscribersUpdated, status, stateVersion, totalFindings, health } = state;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/[0.02] transition-colors"
      >
        {expanded ? <ChevronDown size={14} className="text-white/40" /> : <ChevronRight size={14} className="text-white/40" />}
        <Bug size={14} className="text-amber-400" />
        <span className="text-sm font-medium text-white/80">Platform State Debug Panel</span>
        <span className="ml-auto text-[10px] text-white/30">Source: PlatformStateManager</span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <DebugItem icon={RefreshCw} label="State Version" value={`#${stateVersion}`} />
            <DebugItem icon={Cpu} label="Runtime Version" value={`v${runtimeVersion || "—"}`} />
            <DebugItem icon={Database} label="Manifest Version" value={`v${manifestVersion}`} />
            <DebugItem icon={Database} label="Knowledge Version" value={`v${knowledgeVersion || "—"}`} />
            <DebugItem icon={Clock} label="Cache Timestamp" value={cacheTimestamp ? new Date(cacheTimestamp).toLocaleTimeString() : "—"} />
            <DebugItem icon={Clock} label="Last Refresh" value={lastRefresh ? new Date(lastRefresh).toLocaleTimeString() : "—"} />
            <DebugItem icon={GitCommit} label="Last Commit" value={lastCommit ? new Date(lastCommit).toLocaleTimeString() : "—"} />
            <DebugItem icon={RefreshCw} label="Last Broadcast" value={lastBroadcast ? new Date(lastBroadcast.timestamp).toLocaleTimeString() : "—"} />
            <DebugItem icon={RefreshCw} label="Subscribers" value={subscribersUpdated ?? 0} />
          </div>
          <div className="flex items-center gap-4 pt-2 border-t border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/30">Status:</span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                status === "healthy" ? "bg-emerald-500/10 text-emerald-400" :
                status === "warning" ? "bg-amber-500/10 text-amber-400" :
                "bg-red-500/10 text-red-400"
              }`}>{status}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/30">Health:</span>
              <span className="text-[10px] font-medium text-white/80">{health?.overall ?? "—"}/100</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/30">Findings:</span>
              <span className="text-[10px] font-medium text-white/80">{totalFindings}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/30">Coverage:</span>
              <span className="text-[10px] font-medium text-white/80">{state.coverage?.routeCoverage ?? "—"}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DebugItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
      <Icon size={12} className="text-white/30 flex-shrink-0" />
      <div className="min-w-0">
        <div className="text-[9px] text-white/30 uppercase tracking-wider">{label}</div>
        <div className="text-xs text-white/80 font-medium truncate">{value}</div>
      </div>
    </div>
  );
}