import React, { useMemo } from "react";
import { ShieldAlert, Lock, CheckCircle2, AlertTriangle, ChevronRight } from "lucide-react";
import { computeGovernanceMetrics, GOVERNANCE_TIERS } from "@/lib/entityGovernancePolicy";

export default function GovernanceViolations({ onNavigate }) {
  const metrics = useMemo(() => computeGovernanceMetrics(), []);

  return (
    <div className="space-y-4">
      {/* Policy Header */}
      <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lock size={14} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Entity Governance Policy™</h3>
          <span
            className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded"
            style={{
              color: metrics.enforcementRate === 100 ? "#10b981" : "#ef4444",
              backgroundColor: metrics.enforcementRate === 100 ? "#10b9811a" : "#ef44441a",
            }}
          >
            {metrics.enforcementRate}% Enforced
          </span>
        </div>
        <p className="text-xs text-white/40">
          Permissions are auto-enforced by entity classification. Immutable records (Audit, Security,
          Compliance, Identity, Financial) prohibit Update and Delete.
        </p>

        {/* Tier breakdown */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          {Object.entries(GOVERNANCE_TIERS).map(([key, tier]) => (
            <div key={key} className="bg-white/[0.02] rounded-lg p-2.5 text-center">
              <div className="text-[9px] uppercase tracking-wider text-white/30 mb-0.5">{tier.label}</div>
              <div className="text-lg font-bold" style={{ color: tier.color }}>
                {metrics.byTier[key] || 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Violations */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert size={14} className={metrics.violationCount > 0 ? "text-red-400" : "text-emerald-400"} />
          <h3 className="text-sm font-semibold text-white">Immutability Violations</h3>
          <span className="ml-auto text-[10px] text-white/30 font-mono">
            {metrics.violationCount} violation(s)
          </span>
        </div>

        {metrics.violationCount === 0 ? (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6 text-center">
            <CheckCircle2 size={24} className="text-emerald-400/60 mx-auto mb-2" />
            <p className="text-sm text-emerald-400 font-medium">All immutable entities are properly enforced.</p>
            <p className="text-xs text-white/30 mt-1">No delete or unrestricted update permissions detected.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {metrics.violations.map((v, i) => (
              <div
                key={i}
                className="bg-white/[0.02] border rounded-lg p-3"
                style={{
                  borderColor: v.severity === "critical" ? "#ef444433" : "#f59e0b33",
                }}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    size={13}
                    className="mt-0.5 shrink-0"
                    style={{ color: v.severity === "critical" ? "#ef4444" : "#f59e0b" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-white">{v.entityName}</span>
                      <span
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                        style={{
                          color: v.severity === "critical" ? "#ef4444" : "#f59e0b",
                          backgroundColor: v.severity === "critical" ? "#ef44441a" : "#f59e0b1a",
                        }}
                      >
                        {v.severity}
                      </span>
                      <span className="text-[9px] text-white/30 font-mono">{v.type}</span>
                    </div>
                    <p className="text-xs text-white/60 mb-1">{v.title}</p>
                    <p className="text-[11px] text-white/40 mb-1.5">{v.description}</p>
                    <div className="flex items-center gap-1 text-[11px] text-indigo-400">
                      <ChevronRight size={10} />
                      <span>{v.remediation}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}