import React from "react";
import { PERFORMANCE_BUDGETS, SUCCESS_CRITERIA } from "@/lib/performanceMonitorEngine";
import { Gauge, CheckCircle2, AlertTriangle, XCircle, Clock, Loader2 } from "lucide-react";

const STATUS_ICON = {
  pass: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-400" />,
  critical: <XCircle className="w-4 h-4 text-red-400" />,
  pending: <Clock className="w-4 h-4 text-slate-400" />,
};

const CATEGORY_COLOR = {
  critical: "text-red-400 border-red-500/20",
  high: "text-amber-400 border-amber-500/20",
  medium: "text-blue-400 border-blue-500/20",
  background: "text-purple-400 border-purple-500/20",
};

export default function PerformanceBudgets() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Gauge className="w-4 h-4 text-indigo-400" />
          Performance Budgets™
        </h3>
        <div className="grid gap-2">
          {PERFORMANCE_BUDGETS.map((b) => (
            <div key={b.route} className={`flex items-center justify-between rounded-lg border bg-white/5 px-3 py-2 ${CATEGORY_COLOR[b.category]}`}>
              <span className="text-xs text-white/80">{b.route}</span>
              <span className="text-xs font-mono">
                {b.target ? `≤ ${b.target} ${b.unit}` : "background only"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Success Criteria
        </h3>
        <div className="grid gap-2">
          {SUCCESS_CRITERIA.map((s) => (
            <div key={s.metric} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <div className="flex items-center gap-2">
                {STATUS_ICON[s.status] || <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
                <span className="text-xs text-white/80">{s.metric}</span>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-white/60">Target: {s.target}</div>
                <div className="text-xs text-white/40">Current: {s.current}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}