import React from "react";
import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export default function ConsistencyReport({ report }) {
  const { passed, errors, warnings, featureCount, routeCount, navItemCount } = report;

  return (
    <div className={`rounded-xl border p-5 ${passed ? "border-emerald-500/20 bg-emerald-500/[0.03]" : "border-red-500/20 bg-red-500/[0.03]"}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className={passed ? "text-emerald-400" : "text-red-400"} />
          <h3 className="text-sm font-medium text-white">Feature Consistency Check</h3>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${passed ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
          {passed ? "All Checks Passed" : `${errors.length} Error(s)`}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white/[0.02] rounded-lg p-3 text-center">
          <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Features</div>
          <div className="text-white font-semibold">{featureCount}</div>
        </div>
        <div className="bg-white/[0.02] rounded-lg p-3 text-center">
          <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Routes</div>
          <div className="text-white font-semibold">{routeCount}</div>
        </div>
        <div className="bg-white/[0.02] rounded-lg p-3 text-center">
          <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Nav Items</div>
          <div className="text-white font-semibold">{navItemCount}</div>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="space-y-2 mb-3">
          {errors.map((err, i) => (
            <div key={`err-${i}`} className="flex items-start gap-2 text-xs text-red-300/80">
              <XCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
              <span>{err.message}</span>
            </div>
          ))}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((warn, i) => (
            <div key={`warn-${i}`} className="flex items-start gap-2 text-xs text-amber-300/80">
              <AlertTriangle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <span>{warn.message}</span>
            </div>
          ))}
        </div>
      )}

      {passed && warnings.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-emerald-300/80">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <span>Every advertised feature exists, every nav item has a destination, and every route has permissions.</span>
        </div>
      )}
    </div>
  );
}