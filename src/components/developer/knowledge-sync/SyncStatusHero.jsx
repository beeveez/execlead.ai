import React from "react";
import ScoreRing from "@/components/founder-mc/ScoreRing";
import { RefreshCw, CheckCircle2, AlertTriangle, XCircle, Database, Clock, GitBranch } from "lucide-react";
import { openMetricDrawer } from "@/lib/metricDrawerStore";
import { logMetricOpened } from "@/lib/metricActivityLogger";
import { getMetricById } from "@/lib/metricIntelligenceEngine";

const STATUS_META = {
  synced: { label: "Synced", color: "#10b981", icon: CheckCircle2 },
  needs_attention: { label: "Needs Attention", color: "#f59e0b", icon: AlertTriangle },
  critical: { label: "Critical", color: "#ef4444", icon: XCircle },
  idle: { label: "Not Synchronized", color: "#64748b", icon: Clock },
};

export default function SyncStatusHero({ result, running }) {
  const status = running ? "syncing" : (result?.status || "idle");
  const meta = STATUS_META[status === "syncing" ? "needs_attention" : status] || STATUS_META.idle;
  const color = running ? "#6366f1" : meta.color;

  const handleHealthClick = () => {
    const metricId = "platform_health";
    const def = getMetricById(metricId);
    const score = result?.health ?? 0;
    if (def) logMetricOpened(def, score);
    openMetricDrawer(metricId, score, null, "Knowledge Sync Health");
  };

  return (
    <div className="bg-gradient-to-br from-violet-500/10 via-white/[0.02] to-transparent border border-violet-500/10 rounded-2xl p-6 flex items-center gap-6 flex-wrap">
      <button onClick={handleHealthClick} className="cursor-pointer hover:opacity-80 transition-opacity" title="Click for metric details">
        <ScoreRing score={result?.health ?? 0} size={90} label="Health" color={color} />
      </button>
      <div className="flex-1 min-w-[200px]">
        <div className="flex items-center gap-2 mb-1">
          {running ? <RefreshCw size={18} className="text-violet-400 animate-spin" /> : <Database size={18} className="text-violet-400" />}
          <h1 className="text-xl font-bold text-white">EXEC™ Knowledge Synchronization™</h1>
        </div>
        <p className="text-white/50 text-sm">The platform's automatic learning pipeline — EXEC™ always reasons from current, evidence-backed platform knowledge.</p>
        <div className="flex items-center gap-4 mt-2 text-xs flex-wrap">
          <span className="text-white/40">Knowledge v{result?.knowledgeVersion || "—"}</span>
          <span className="text-white/20">·</span>
          <span className="text-white/40">Platform v{result?.platformVersion || "—"}</span>
          <span className="text-white/20">·</span>
          <span className="text-white/40">Prompt v{result?.promptVersion || "—"}</span>
          <span className="text-white/20">·</span>
          <span className="text-white/40">Build {result?.buildNumber || "—"}</span>
          {result?.lastSync && (
            <>
              <span className="text-white/20">·</span>
              <span className="text-white/40">Last sync: {new Date(result.lastSync).toLocaleString()}</span>
            </>
          )}
          {result?.duration != null && (
            <>
              <span className="text-white/20">·</span>
              <span className="text-white/40">{result.duration}ms</span>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <div className="text-[10px] text-white/30 uppercase tracking-wider">Sync Status</div>
        <div className="flex items-center gap-1.5">
          {React.createElement(meta.icon, { size: 16, style: { color } })}
          <span className="text-lg font-bold" style={{ color }}>{running ? "Synchronizing…" : meta.label}</span>
        </div>
        {result && !running && (
          <div className="text-[10px] text-white/30 flex items-center gap-1">
            <GitBranch size={9} /> {result.report?.newAssets?.length || 0} new · {result.report?.removedAssets?.length || 0} removed
          </div>
        )}
      </div>
    </div>
  );
}