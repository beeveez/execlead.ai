import React, { useState } from "react";
import { ChevronDown, CheckCircle, AlertTriangle, XCircle, Clock } from "lucide-react";
import { STATUS_META } from "@/lib/productionReadinessCertificationEngine";

const ICONS = { pass: CheckCircle, warning: AlertTriangle, fail: XCircle, pending: Clock };

export default function DomainCard({ domain }) {
  const [expanded, setExpanded] = useState(false);
  const passed = domain.passedGate;

  return (
    <div className={`bg-[#0d0d14] border rounded-xl overflow-hidden transition-all ${passed ? "border-emerald-500/20" : domain.score >= 50 ? "border-amber-500/20" : "border-red-500/20"}`}>
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${passed ? "bg-emerald-500/10 text-emerald-400" : domain.score >= 50 ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"}`}>
          {domain.id}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white truncate">{domain.name}</h3>
          </div>
          <p className="text-xs text-white/40 mt-0.5 truncate">Target: {domain.target}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-lg font-bold ${passed ? "text-emerald-400" : domain.score >= 50 ? "text-amber-400" : "text-red-400"}`}>
            {domain.score}
          </span>
          <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* Checks */}
      {expanded && (
        <div className="border-t border-white/5 px-4 py-3 space-y-2">
          {domain.checks.map((check) => {
            const meta = STATUS_META[check.status];
            const CIcon = ICONS[check.status];
            return (
              <div key={check.id} className="flex items-start gap-2 py-1">
                <CIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${meta.text}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white/80">{check.label}</p>
                  <p className="text-xs text-white/30 mt-0.5">{check.evidence}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}