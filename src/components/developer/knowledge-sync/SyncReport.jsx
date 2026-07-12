import React from "react";
import { FilePlus, FileMinus, RefreshCw, CheckCircle2 } from "lucide-react";

function DiffList({ title, items, icon: Icon, color }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={13} style={{ color }} />
        <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color }}>{title} ({items.length})</span>
      </div>
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {items.slice(0, 20).map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs bg-white/[0.02] border border-white/5 rounded px-2 py-1.5">
            <span className="text-[10px] text-white/30 uppercase w-20 flex-shrink-0">{item.category}</span>
            <span className="text-white/60 truncate">{item.signature}</span>
          </div>
        ))}
        {items.length > 20 && <div className="text-[10px] text-white/30 px-2">+ {items.length - 20} more…</div>}
      </div>
    </div>
  );
}

export default function SyncReport({ report }) {
  if (!report) return null;
  const statusColor = report.overallStatus === "synced" ? "#10b981" : report.overallStatus === "needs_attention" ? "#f59e0b" : "#ef4444";
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Synchronization Report</h3>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={14} style={{ color: statusColor }} />
          <span className="text-xs font-medium" style={{ color: statusColor }}>{report.overallStatus.replace(/_/g, " ").toUpperCase()}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
          <div className="text-[10px] text-white/30 uppercase">Platform Version</div>
          <div className="text-sm font-bold text-white">v{report.platformVersion}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
          <div className="text-[10px] text-white/30 uppercase">Knowledge Version</div>
          <div className="text-sm font-bold text-white">v{report.knowledgeVersion}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
          <div className="text-[10px] text-white/30 uppercase">Packs Updated</div>
          <div className="text-sm font-bold text-violet-400">{report.knowledgePacksUpdated}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
          <div className="text-[10px] text-white/30 uppercase">Caches Rebuilt</div>
          <div className="text-sm font-bold text-cyan-400">{[report.reasoningCacheRebuilt, report.capabilityGraphRebuilt, report.platformGraphRebuilt].filter(Boolean).length}/3</div>
        </div>
      </div>
      {report.isFirstSync ? (
        <div className="text-center py-4 text-white/40 text-sm">
          <RefreshCw size={20} className="mx-auto mb-2 text-violet-400/40" />
          First synchronization — baseline snapshot established. Future syncs will show diffs here.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DiffList title="New Assets" items={report.newAssets} icon={FilePlus} color="#10b981" />
          <DiffList title="Updated Assets" items={report.updatedAssets} icon={RefreshCw} color="#6366f1" />
          <DiffList title="Removed Assets" items={report.removedAssets} icon={FileMinus} color="#ef4444" />
        </div>
      )}
    </div>
  );
}