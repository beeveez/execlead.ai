import React, { useState, useMemo } from "react";
import { Shield, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, XCircle, RefreshCw, FileCode, Lock } from "lucide-react";
import { runRLSValidation } from "@/lib/rlsValidationEngine";
import { SECURITY_CLASSIFICATIONS, RLS_STATUS } from "@/lib/rlsRegistry";

const SEVERITY_STYLES = {
  critical: { color: "#ef4444", bg: "bg-red-500/10", border: "border-red-500/20", label: "Critical" },
  high: { color: "#f59e0b", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "High" },
  medium: { color: "#eab308", bg: "bg-yellow-500/10", border: "border-yellow-500/20", label: "Medium" },
  low: { color: "#6366f1", bg: "bg-indigo-500/10", border: "border-indigo-500/20", label: "Low" },
  none: { color: "#10b981", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Pass" },
};

const STATUS_STYLES = {
  protected: { color: "#10b981", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  partial: { color: "#f59e0b", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  open: { color: "#ef4444", bg: "bg-red-500/10", border: "border-red-500/20" },
};

export default function RLSValidationReport() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [filter, setFilter] = useState("all");
  const [selectedEntity, setSelectedEntity] = useState(null);

  const report = useMemo(() => runRLSValidation(), [refreshKey]);

  function handleValidate() {
    setRefreshKey((k) => k + 1);
  }

  const filteredEntities = useMemo(() => {
    if (filter === "all") return report.entities;
    if (filter === "findings") return report.entities.filter((e) => e.findingCount > 0);
    if (filter === "critical") return report.entities.filter((e) => e.topSeverity === "critical");
    return report.entities.filter((e) => e.classification === filter);
  }, [report, filter]);

  const certified = report.certified;
  const riskColor = report.riskLevel === "critical" ? "#ef4444"
    : report.riskLevel === "high" ? "#f59e0b"
    : report.riskLevel === "medium" ? "#eab308" : "#10b981";

  return (
    <div className="space-y-4">
      {/* Hero */}
      <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${certified ? "bg-emerald-500/15" : "bg-amber-500/15"}`}>
              {certified ? <ShieldCheck size={24} className="text-emerald-400" /> : <ShieldAlert size={24} className="text-amber-400" />}
            </div>
            <div>
              <div className="text-[10px] text-white/30 uppercase tracking-widest mb-1">RLS Validation Engine™ · v1.0</div>
              <h3 className="text-lg font-bold text-white">Row-Level Security Hardening Framework</h3>
              <p className="text-white/40 text-xs mt-0.5">Least-privilege enforcement across all {report.totalEntities} registered entities</p>
            </div>
          </div>
          <button onClick={handleValidate}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors border border-white/10">
            <RefreshCw size={14} /> Re-validate
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5">
          <MetricTile label="RLS Coverage" value={`${report.coverage}%`} color="#10b981" />
          <MetricTile label="Pass Rate" value={`${report.passRate}%`} color="#6366f1" />
          <MetricTile label="Total Findings" value={report.totalFindings} color={riskColor} />
          <MetricTile label="Critical" value={report.findingsBySeverity.critical} color="#ef4444" />
          <MetricTile label="Risk Level" value={report.riskLevel.toUpperCase()} color={riskColor} />
        </div>

        {/* Certification banner */}
        <div className={`mt-4 flex items-center gap-2 px-4 py-2.5 rounded-lg ${certified ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-amber-500/10 border border-amber-500/20"}`}>
          {certified ? <CheckCircle2 size={14} className="text-emerald-400" /> : <AlertTriangle size={14} className="text-amber-400" />}
          <span className={`text-xs ${certified ? "text-emerald-400" : "text-amber-400"}`}>
            {certified
              ? "RLS Certification passed — 100% coverage, zero critical findings."
              : `RLS Certification blocked — ${report.findingsBySeverity.critical} critical, ${report.findingsBySeverity.high} high findings require remediation.`}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] text-white/30 uppercase tracking-wider mr-1">Filter:</span>
        {["all", "findings", "critical", "user", "organization", "platform", "public"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors border ${
              filter === f ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" : "bg-white/5 text-white/40 border-white/10 hover:text-white/70"
            }`}>
            {f === "all" ? "All Entities" : f === "findings" ? "With Findings" : f === "critical" ? "Critical" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Entity Table */}
      <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-white/[0.02] border-b border-white/5 text-[10px] text-white/30 uppercase tracking-wider font-medium">
          <div className="col-span-3">Entity</div>
          <div className="col-span-2">Classification</div>
          <div className="col-span-2">Security Class</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Scope</div>
          <div className="col-span-2 text-right">Findings</div>
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {filteredEntities.length === 0 ? (
            <div className="px-4 py-8 text-center text-white/30 text-xs">No entities match this filter.</div>
          ) : filteredEntities.map((e) => {
            const sev = SEVERITY_STYLES[e.topSeverity] || SEVERITY_STYLES.none;
            const status = STATUS_STYLES[e.status] || STATUS_STYLES.open;
            return (
              <button key={e.name} onClick={() => setSelectedEntity(e)}
                className="w-full grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-white/5 hover:bg-white/[0.03] transition-colors text-left items-center">
                <div className="col-span-3 flex items-center gap-2">
                  {e.sensitive ? <Lock size={11} className="text-amber-400 flex-shrink-0" /> : <Shield size={11} className="text-white/20 flex-shrink-0" />}
                  <span className="text-xs text-white/80 truncate">{e.name}</span>
                </div>
                <div className="col-span-2 text-[11px] text-white/50">{e.classificationLabel}</div>
                <div className="col-span-2 text-[11px] text-white/50">{e.securityClassLabel}</div>
                <div className="col-span-2">
                  <span className={`text-[9px] px-2 py-0.5 rounded ${status.bg} ${status.border} border font-medium`} style={{ color: status.color }}>
                    {e.status}
                  </span>
                </div>
                <div className="col-span-1 text-[10px] text-white/40 truncate">{e.scope}</div>
                <div className="col-span-2 flex items-center justify-end gap-1">
                  {e.findingCount > 0 ? (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${sev.bg} ${sev.border} border font-medium`} style={{ color: sev.color }}>
                      {e.findingCount} {sev.label}
                    </span>
                  ) : (
                    <CheckCircle2 size={13} className="text-emerald-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Findings summary */}
      {report.findings.length > 0 && (
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={13} className="text-amber-400" />
            <span className="text-[11px] text-white/60 font-medium">Validation Findings ({report.findings.length})</span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {report.findings.slice(0, 20).map((f, i) => {
              const sev = SEVERITY_STYLES[f.severity];
              return (
                <div key={i} className={`flex items-start gap-3 px-3 py-2 rounded-lg ${sev.bg} ${sev.border} border`}>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0" style={{ color: sev.color, backgroundColor: `${sev.color}15` }}>
                    {sev.label.toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-white/80">{f.message}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">→ {f.remediation}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Entity Detail Drawer */}
      {selectedEntity && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedEntity(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative w-full max-w-lg bg-[#0d0d14] border-l border-white/10 h-full overflow-y-auto animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-[#0d0d14] border-b border-white/5 px-5 py-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-white/30 uppercase tracking-widest">RLS Policy Detail</div>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedEntity.name}</h3>
              </div>
              <button onClick={() => setSelectedEntity(null)} className="text-white/40 hover:text-white/80 p-1">
                <XCircle size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Classification */}
              <DetailRow label="Security Classification" value={selectedEntity.classificationLabel} />
              <DetailRow label="Data Sensitivity" value={selectedEntity.securityClassLabel} />
              <DetailRow label="Scope Field" value={selectedEntity.scope} />
              <DetailRow label="Sensitive" value={selectedEntity.sensitive ? "Yes" : "No"} />
              <DetailRow label="Status" value={selectedEntity.status} />
              <DetailRow label="Last Validated" value={new Date(selectedEntity.lastValidated).toLocaleString()} />

              {/* Rule */}
              <div>
                <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Active Rule</div>
                <div className="text-xs text-white/60 bg-white/[0.02] border border-white/5 rounded-lg p-3">{selectedEntity.rule}</div>
              </div>

              {/* Findings */}
              {selectedEntity.findings.length > 0 ? (
                <div>
                  <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Findings ({selectedEntity.findingCount})</div>
                  <div className="space-y-2">
                    {selectedEntity.findings.map((f, i) => {
                      const sev = SEVERITY_STYLES[f.severity];
                      return (
                        <div key={i} className={`px-3 py-2 rounded-lg ${sev.bg} ${sev.border} border`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-bold" style={{ color: sev.color }}>{sev.label.toUpperCase()}</span>
                            <span className="text-[10px] text-white/40">· {f.rule}</span>
                          </div>
                          <div className="text-[11px] text-white/70">{f.message}</div>
                          <div className="text-[10px] text-white/40 mt-1">Fix: {f.remediation}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  <span className="text-xs text-emerald-400">No findings — this entity passes all RLS validation checks.</span>
                </div>
              )}

              {/* Recommended Policy */}
              <div>
                <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <FileCode size={11} /> Recommended Policy ({selectedEntity.classificationLabel})
                </div>
                <pre className="text-[10px] text-white/60 bg-black/40 border border-white/5 rounded-lg p-3 overflow-x-auto font-mono leading-relaxed">
{JSON.stringify(selectedEntity.recommendedPolicy, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricTile({ label, value, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
      <div className="text-[10px] text-white/30 uppercase tracking-wider">{label}</div>
      <div className="text-xl font-bold mt-1" style={{ color }}>{value}</div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-white/40">{label}</span>
      <span className="text-xs text-white/80 font-medium">{value}</span>
    </div>
  );
}