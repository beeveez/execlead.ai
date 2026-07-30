import React, { useState, useMemo } from "react";
import { Shield, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, XCircle, RefreshCw, FileCode, Lock, User, Building2, Server } from "lucide-react";
import { runRLSValidation } from "@/lib/rlsValidationEngine";
import { SECURITY_CLASSIFICATIONS } from "@/lib/rlsRegistry";

const SEVERITY_STYLES = {
  critical: { color: "#ef4444", bg: "bg-red-500/10", border: "border-red-500/20", label: "Critical" },
  high: { color: "#f59e0b", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "High" },
  medium: { color: "#eab308", bg: "bg-yellow-500/10", border: "border-yellow-500/20", label: "Medium" },
  low: { color: "#6366f1", bg: "bg-indigo-500/10", border: "border-indigo-500/20", label: "Low" },
  none: { color: "#10b981", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Pass" },
};

const CRUD_STYLES = {
  explicit: { color: "#10b981", label: "Explicit" },
  restricted: { color: "#6366f1", label: "Restricted" },
  public: { color: "#06b6d4", label: "Public" },
  open: { color: "#ef4444", label: "Open" },
  missing: { color: "#f59e0b", label: "Missing" },
};

const POLICY_STATUS_STYLES = {
  compliant: { color: "#10b981", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Compliant" },
  warning: { color: "#f59e0b", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Warning" },
  non_compliant: { color: "#ef4444", bg: "bg-red-500/10", border: "border-red-500/20", label: "Non-Compliant" },
};

const RISK_STYLES = {
  critical: "#ef4444",
  high: "#f59e0b",
  medium: "#eab308",
  low: "#10b981",
};

const TYPE_ICONS = { A: User, B: Building2, C: Server };

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
    if (filter === "findings") return report.entities.filter((e) => e.findings.length > 0);
    if (filter === "critical") return report.entities.filter((e) => e.riskLevel === "critical");
    if (filter === "compliant") return report.entities.filter((e) => e.policyStatus === "compliant");
    return report.entities.filter((e) => e.classification === filter);
  }, [report, filter]);

  const certified = report.certified;
  const riskColor = RISK_STYLES[report.riskLevel];

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
              <div className="text-[10px] text-white/30 uppercase tracking-widest mb-1">RLS Validation Engine™ · Standard v{report.standardVersion}</div>
              <h3 className="text-lg font-bold text-white">Enterprise Row-Level Security Standard</h3>
              <p className="text-white/40 text-xs mt-0.5">Least Privilege · Zero Trust · Default Deny · Explicit Authorization</p>
            </div>
          </div>
          <button onClick={handleValidate}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors border border-white/10">
            <RefreshCw size={14} /> Re-validate
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-5">
          <MetricTile label="RLS Coverage" value={`${report.coverage}%`} color="#10b981" />
          <MetricTile label="Compliance Pass Rate" value={`${report.passRate}%`} color="#6366f1" />
          <MetricTile label="Total Findings" value={report.totalFindings} color={riskColor} />
          <MetricTile label="Critical" value={report.findingsBySeverity.critical} color="#ef4444" />
          <MetricTile label="Risk Level" value={report.riskLevel.toUpperCase()} color={riskColor} />
          <MetricTile label="Health Score™" value={`${report.passRate}/100`} color={report.passRate >= 95 ? "#10b981" : "#f59e0b"} />
        </div>

        {/* Entity Type Distribution */}
        <div className="grid grid-cols-3 gap-3 mt-3">
          <TypeTile type="A" label="User-Owned" count={report.typeDistribution.A} icon={User} color="#10b981" />
          <TypeTile type="B" label="Organization-Owned" count={report.typeDistribution.B} icon={Building2} color="#8b5cf6" />
          <TypeTile type="C" label="System-Owned" count={report.typeDistribution.C} icon={Server} color="#f59e0b" />
        </div>

        {/* Certification banner */}
        <div className={`mt-4 flex items-center gap-2 px-4 py-2.5 rounded-lg ${certified ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-amber-500/10 border border-amber-500/20"}`}>
          {certified ? <CheckCircle2 size={14} className="text-emerald-400" /> : <AlertTriangle size={14} className="text-amber-400" />}
          <span className={`text-xs ${certified ? "text-emerald-400" : "text-amber-400"}`}>
            {certified
              ? "RLS Certification passed — 100% coverage, zero critical/high findings. Platform complies with Zero Trust principles."
              : `RLS Certification blocked — ${report.findingsBySeverity.critical} critical, ${report.findingsBySeverity.high} high findings require remediation. Security Health Score™ reduced.`}
          </span>
        </div>

        {/* Platform-limitation distinction */}
        {report.totalPlatformLimitations > 0 && (
          <div className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.02] border border-white/10">
            <FileCode size={12} className="text-white/40" />
            <span className="text-[11px] text-white/50">
              <span className="text-white/70 font-medium">{report.totalPlatformLimitations}</span> platform-capability limitation{report.totalPlatformLimitations !== 1 ? "s" : ""} documented (service-role, environment policies) — <span className="text-white/40">not counted as EXECLEAD.AI defects</span>. Guardian™ does not penalize platform limitations.
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] text-white/30 uppercase tracking-wider mr-1">Filter:</span>
        {["all", "findings", "critical", "compliant", "user", "organization", "platform", "public"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors border ${
              filter === f ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30" : "bg-white/5 text-white/40 border-white/10 hover:text-white/70"
            }`}>
            {f === "all" ? "All Entities" : f === "findings" ? "With Findings" : f === "critical" ? "Critical Risk" : f === "compliant" ? "Compliant" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Entity Table — Enterprise RLS Standard columns */}
      <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-3 py-2.5 bg-white/[0.02] border-b border-white/5 text-[9px] text-white/30 uppercase tracking-wider font-medium">
          <div className="col-span-2">Entity</div>
          <div className="col-span-1">Type</div>
          <div className="col-span-1">Create</div>
          <div className="col-span-1">Read</div>
          <div className="col-span-1">Update</div>
          <div className="col-span-1">Delete</div>
          <div className="col-span-2">Policy Status</div>
          <div className="col-span-1">Risk</div>
          <div className="col-span-2">Warnings</div>
        </div>
        <div className="max-h-[480px] overflow-y-auto">
          {filteredEntities.length === 0 ? (
            <div className="px-4 py-8 text-center text-white/30 text-xs">No entities match this filter.</div>
          ) : filteredEntities.map((e) => {
            const ps = POLICY_STATUS_STYLES[e.policyStatus];
            const riskColor = RISK_STYLES[e.riskLevel];
            const TypeIcon = TYPE_ICONS[e.entityType] || Server;
            return (
              <button key={e.name} onClick={() => setSelectedEntity(e)}
                className="w-full grid grid-cols-12 gap-2 px-3 py-2.5 border-b border-white/5 hover:bg-white/[0.03] transition-colors text-left items-center">
                <div className="col-span-2 flex items-center gap-1.5">
                  {e.sensitive ? <Lock size={10} className="text-amber-400 flex-shrink-0" /> : <Shield size={10} className="text-white/20 flex-shrink-0" />}
                  <span className="text-[11px] text-white/80 truncate">{e.name}</span>
                </div>
                <div className="col-span-1 flex items-center gap-1">
                  <TypeIcon size={11} className="text-white/40" />
                  <span className="text-[10px] text-white/40">{e.entityType}</span>
                </div>
                <CrudCell status={e.crud.create} />
                <CrudCell status={e.crud.read} />
                <CrudCell status={e.crud.update} />
                <CrudCell status={e.crud.delete} />
                <div className="col-span-2">
                  <span className={`text-[9px] px-2 py-0.5 rounded ${ps.bg} ${ps.border} border font-medium`} style={{ color: ps.color }}>
                    {ps.label}
                  </span>
                </div>
                <div className="col-span-1">
                  <span className="text-[9px] font-bold uppercase" style={{ color: riskColor }}>{e.riskLevel}</span>
                </div>
                <div className="col-span-2 text-[10px] text-white/40 truncate">
                  {e.warnings.length > 0 ? e.warnings.join("; ") : "—"}
                </div>
              </button>
            );
          })}
        </div>
      </div>

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
              <DetailRow label="Entity Type" value={`${selectedEntity.entityType} — ${selectedEntity.entityTypeLabel}`} />
              <DetailRow label="Security Classification" value={selectedEntity.classificationLabel} />
              <DetailRow label="Data Sensitivity" value={selectedEntity.securityClassLabel} />
              <DetailRow label="Scope Field" value={selectedEntity.scope} />
              <DetailRow label="Sensitive" value={selectedEntity.sensitive ? "Yes" : "No"} />
              <DetailRow label="Policy Status" value={POLICY_STATUS_STYLES[selectedEntity.policyStatus].label} />
              <DetailRow label="Risk Level" value={selectedEntity.riskLevel.toUpperCase()} />
              <DetailRow label="Last Validated" value={new Date(selectedEntity.lastValidated).toLocaleString()} />

              {/* CRUD Policy Matrix */}
              <div>
                <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">CRUD Policy Matrix</div>
                <div className="grid grid-cols-4 gap-2">
                  {["create", "read", "update", "delete"].map((op) => {
                    const st = CRUD_STYLES[selectedEntity.crud[op]] || CRUD_STYLES.missing;
                    return (
                      <div key={op} className="bg-white/[0.02] border border-white/5 rounded-lg p-2 text-center">
                        <div className="text-[9px] text-white/30 uppercase">{op}</div>
                        <div className="text-[11px] font-medium mt-1" style={{ color: st.color }}>{st.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Audit Protection */}
              <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border ${selectedEntity.auditProtection.protected ? "bg-emerald-500/10 border-emerald-500/20" : "bg-amber-500/10 border-amber-500/20"}`}>
                {selectedEntity.auditProtection.protected ? <CheckCircle2 size={13} className="text-emerald-400" /> : <AlertTriangle size={13} className="text-amber-400" />}
                <span className={`text-[11px] ${selectedEntity.auditProtection.protected ? "text-emerald-400" : "text-amber-400"}`}>
                  {selectedEntity.auditProtection.note}
                </span>
              </div>

              {/* Active Rule */}
              <div>
                <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Active Rule</div>
                <div className="text-xs text-white/60 bg-white/[0.02] border border-white/5 rounded-lg p-3">{selectedEntity.rule}</div>
              </div>

              {/* Guardian Checks */}
              {selectedEntity.guardianChecks.length > 0 ? (
                <div>
                  <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Guardian™ Validation Checks ({selectedEntity.guardianChecks.length})</div>
                  <div className="space-y-2">
                    {selectedEntity.guardianChecks.map((c, i) => {
                      const sev = SEVERITY_STYLES[c.severity];
                      return (
                        <div key={i} className={`px-3 py-2 rounded-lg ${sev.bg} ${sev.border} border`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-bold" style={{ color: sev.color }}>{sev.label.toUpperCase()}</span>
                            <span className="text-[10px] text-white/40">· {c.id}</span>
                          </div>
                          <div className="text-[11px] text-white/70">{c.message}</div>
                          <div className="text-[10px] text-white/40 mt-1">Fix: {c.remediation}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  <span className="text-xs text-emerald-400">All 6 Guardian™ validation checks passed.</span>
                </div>
              )}

              {/* Missing Rules */}
              {selectedEntity.missingRules.length > 0 && (
                <div>
                  <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1.5">Missing / Open Rules</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedEntity.missingRules.map((r) => (
                      <span key={r} className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400">{r}</span>
                    ))}
                  </div>
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

function CrudCell({ status }) {
  const st = CRUD_STYLES[status] || CRUD_STYLES.missing;
  return (
    <div className="col-span-1">
      <span className="text-[9px] font-medium" style={{ color: st.color }}>{st.label}</span>
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

function TypeTile({ label, count, icon: Icon, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon size={14} style={{ color }} />
      </div>
      <div>
        <div className="text-[10px] text-white/30 uppercase tracking-wider">{label}</div>
        <div className="text-base font-bold" style={{ color }}>{count}</div>
      </div>
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