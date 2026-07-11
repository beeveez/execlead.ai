import React from "react";
import { RefreshCw, CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";

const STATUS_CONFIG = {
  pass: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/10" },
  warn: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/10" },
  fail: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/5", border: "border-red-500/10" },
};

export default function GovernancePipelineStatus({ certificate, pipelineRunning }) {
  const stages = certificate?.stages || [];

  return (
    <div className="space-y-3">
      {/* Pipeline Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw size={14} className={`text-indigo-400 ${pipelineRunning ? "animate-spin" : ""}`} />
          <span className="text-xs font-medium text-white/60 uppercase tracking-wider">Pipeline Execution</span>
        </div>
        {certificate && (
          <div className="flex items-center gap-3 text-[10px] text-white/30">
            <span>{certificate.stages?.length || 0} stages</span>
            <span>·</span>
            <span>{certificate.duration}ms total</span>
            <span>·</span>
            <span>Trigger: {certificate.trigger}</span>
          </div>
        )}
      </div>

      {/* Stage List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {stages.length === 0 && Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5 animate-pulse">
            <div className="w-5 h-5 rounded-full bg-white/5" />
            <div className="flex-1">
              <div className="h-3 bg-white/5 rounded w-3/4" />
            </div>
          </div>
        ))}
        {stages.map((stage) => {
          const cfg = STATUS_CONFIG[stage.status] || STATUS_CONFIG.pass;
          const Icon = cfg.icon;
          return (
            <div key={stage.id} className={`flex items-center gap-3 p-2.5 rounded-lg border ${cfg.bg} ${cfg.border}`}>
              <div className="text-[10px] text-white/30 font-mono w-6 text-right">{stage.order}</div>
              <Icon size={14} className={cfg.color} />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white/70 font-medium truncate">{stage.name}</div>
                <div className="text-[10px] text-white/30 truncate">{stage.summary}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className={`text-xs font-bold ${cfg.color}`}>{stage.score}</div>
                <div className="text-[9px] text-white/20 flex items-center gap-0.5">
                  <Clock size={8} />{stage.duration}ms
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}