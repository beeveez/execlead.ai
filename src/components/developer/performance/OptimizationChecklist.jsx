import React from "react";
import { OPTIMIZATION_STRATEGIES, PRIMARY_BOTTLENECKS, REQUIRED_INDEXES } from "@/lib/performanceMonitorEngine";
import { CheckCircle2, Clock, AlertCircle, XCircle, ListChecks, Database, GitBranch } from "lucide-react";

const STATUS_META = {
  implemented: { icon: <CheckCircle2 className="w-4 h-4" />, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  configured: { icon: <CheckCircle2 className="w-4 h-4" />, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  planned: { icon: <Clock className="w-4 h-4" />, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  audit_required: { icon: <AlertCircle className="w-4 h-4" />, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  tracking: { icon: <Clock className="w-4 h-4" />, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
  likely_present: { icon: <CheckCircle2 className="w-4 h-4" />, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
};

export default function OptimizationChecklist() {
  return (
    <div className="space-y-5">
      {/* 12 Strategies */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <ListChecks className="w-4 h-4 text-indigo-400" />
          12-Strategy Optimization Checklist
        </h3>
        <div className="space-y-1.5">
          {OPTIMIZATION_STRATEGIES.map((s) => {
            const meta = STATUS_META[s.status] || STATUS_META.planned;
            return (
              <div key={s.id} className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${meta.bg}`}>
                <span className={`mt-0.5 ${meta.color}`}>{meta.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white/80">{s.id}. {s.name}</span>
                    <span className={`text-xs ${meta.color}`}>{s.status.replace(/_/g, " ")}</span>
                  </div>
                  <p className="text-xs text-white/40">{s.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Bottlenecks */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-amber-400" />
          Primary Bottlenecks (priority order)
        </h3>
        <div className="space-y-1">
          {PRIMARY_BOTTLENECKS.map((b) => (
            <div key={b.rank} className="flex items-start gap-2 rounded border border-white/5 bg-white/5 px-2 py-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-400 shrink-0">{b.rank}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/70">{b.name}</p>
                <p className="text-xs text-white/40">{b.description}</p>
                <p className="text-xs text-emerald-300/70">→ {b.optimization}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Required Indexes */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-400" />
          Required Database Indexes
        </h3>
        <div className="space-y-1">
          {REQUIRED_INDEXES.map((idx) => {
            const meta = STATUS_META[idx.status] || STATUS_META.audit_required;
            return (
              <div key={idx.field} className="flex items-center justify-between rounded border border-white/5 bg-white/5 px-2 py-1.5">
                <div>
                  <span className="text-xs font-mono text-white/70">{idx.field}</span>
                  <p className="text-xs text-white/40">{idx.entities}</p>
                </div>
                <span className={`text-xs ${meta.color} flex items-center gap-1`}>{meta.icon} {idx.status.replace(/_/g, " ")}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}