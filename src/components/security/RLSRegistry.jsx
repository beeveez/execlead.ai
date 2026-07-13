import React, { useMemo, useState } from "react";
import {
  ShieldCheck, Database, CheckCircle2, AlertTriangle, XCircle, HelpCircle,
  Building2, User, Server, Globe, Lock, Search, Radar, Target, Clock,
} from "lucide-react";
import {
  RLS_STATUS, SECURITY_CLASSIFICATIONS,
  computeRLSScores,
} from "@/lib/rlsRegistry";
import { discoverAllEntities, computeDiscoveryMetrics, computeRiskBasedCoverage, computeSecurityDebt } from "@/lib/entityDiscovery";

const STATUS_ICON = {
  protected: CheckCircle2,
  partial: AlertTriangle,
  open: XCircle,
  unverified: HelpCircle,
};

const STATUS_COLOR = {
  protected: "#10b981",
  partial: "#f59e0b",
  open: "#ef4444",
  unverified: "#6366f1",
};

const CLASS_ICON = {
  public: Globe,
  user: User,
  organization: Building2,
  platform: Server,
};

const CLASS_COLOR = {
  public: "#3b82f6",
  user: "#10b981",
  organization: "#8b5cf6",
  platform: "#f59e0b",
};

function KpiCard({ icon: Icon, label, value, tone }) {
  const color = tone === "pass" ? "#10b981" : tone === "fail" ? "#ef4444" : "#3b82f6";
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2" style={{ color }}>
        <Icon size={14} />
        <span className="text-[10px] uppercase tracking-wider font-medium">{label}</span>
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  );
}

function IsolationBadge({ pass, label }) {
  const color = pass ? "#10b981" : "#ef4444";
  return (
    <div className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
      {pass ? <CheckCircle2 size={14} style={{ color }} /> : <XCircle size={14} style={{ color }} />}
      <span className="text-xs text-white/70">{label}</span>
      <span className="text-xs font-mono ml-auto" style={{ color }}>
        {pass ? "PASS" : "FAIL"}
      </span>
    </div>
  );
}

function CoverageRow({ label, data, warning }) {
  const color = warning ? "#6366f1" : data.coverage === 100 ? "#10b981" : "#f59e0b";
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-white/60 w-32 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${data.coverage}%`, background: color }} />
      </div>
      <span className="text-xs font-mono w-12 text-right" style={{ color }}>
        {data.protected}/{data.total}
      </span>
      <span className="text-xs font-bold w-10 text-right" style={{ color }}>{data.coverage}%</span>
    </div>
  );
}

function DebtCard({ label, value, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
      <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">{label}</div>
      <div className="text-xl font-bold" style={{ color }}>{value}</div>
    </div>
  );
}

export default function RLSRegistry() {
  const scores = useMemo(() => computeRLSScores(), []);
  const discovery = useMemo(() => computeDiscoveryMetrics(), []);
  const riskCoverage = useMemo(() => computeRiskBasedCoverage(), []);
  const securityDebt = useMemo(() => computeSecurityDebt(), []);
  const allEntities = useMemo(() => discoverAllEntities(), []);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return allEntities.filter((e) => {
      if (filter !== "all" && e.classification !== filter) return false;
      if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [allEntities, filter, search]);

  const launchReady = !riskCoverage.deploymentBlocked;

  return (
    <div className="space-y-4">
      {/* Header banner */}
      <div className="bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/10 rounded-xl p-5">
        <div className="flex items-center gap-2 text-violet-400 text-xs font-medium uppercase tracking-wider mb-2">
          <ShieldCheck size={14} /> RLS Policy Registry™
        </div>
        <div className="flex items-center gap-6 flex-wrap">
          <div>
            <div className="text-3xl font-bold text-white">{scores.total}</div>
            <div className="text-white/40 text-xs mt-0.5">Entities Audited</div>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div>
            <div className="text-3xl font-bold" style={{ color: scores.rlsCoverage >= 90 ? "#10b981" : scores.rlsCoverage >= 70 ? "#f59e0b" : "#ef4444" }}>
              {scores.rlsCoverage}%
            </div>
            <div className="text-white/40 text-xs mt-0.5">RLS Coverage</div>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div>
            <div className="text-3xl font-bold" style={{ color: scores.tenantIsolationScore >= 90 ? "#10b981" : scores.tenantIsolationScore >= 60 ? "#f59e0b" : "#ef4444" }}>
              {scores.tenantIsolationScore}
            </div>
            <div className="text-white/40 text-xs mt-0.5">Tenant Isolation Score</div>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div>
            <div className="text-3xl font-bold" style={{ color: scores.securityScore >= 90 ? "#10b981" : scores.securityScore >= 60 ? "#f59e0b" : "#ef4444" }}>
              {scores.securityScore}
            </div>
            <div className="text-white/40 text-xs mt-0.5">Security Score</div>
          </div>
          <div className="ml-auto">
            <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Production Blocker</div>
            <div className="text-lg font-bold" style={{ color: launchReady ? "#10b981" : "#ef4444" }}>
              {launchReady ? "✅ NONE" : `🔴 ${riskCoverage.criticalUnverified} critical unverified`}
            </div>
          </div>
        </div>
      </div>

      {/* Entity Discovery™ banner */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/10 rounded-xl p-5">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-medium uppercase tracking-wider mb-3">
          <Radar size={14} /> Entity Discovery™ — Automatic Entity Coverage
        </div>
        <div className="flex items-center gap-6 flex-wrap">
          <div>
            <div className="text-2xl font-bold text-white">{discovery.discovered}</div>
            <div className="text-white/40 text-[10px] mt-0.5 uppercase tracking-wider">Discovered</div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <div className="text-2xl font-bold text-white">{discovery.classified}</div>
            <div className="text-white/40 text-[10px] mt-0.5 uppercase tracking-wider">Classified</div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <div className="text-2xl font-bold text-white">{discovery.audited}</div>
            <div className="text-white/40 text-[10px] mt-0.5 uppercase tracking-wider">Audited</div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <div className="text-2xl font-bold" style={{ color: discovery.coverage === 100 ? "#10b981" : discovery.coverage >= 50 ? "#f59e0b" : "#ef4444" }}>
              {discovery.protected}
            </div>
            <div className="text-white/40 text-[10px] mt-0.5 uppercase tracking-wider">Protected</div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <div className="text-2xl font-bold" style={{ color: discovery.awaitingReview === 0 ? "#10b981" : "#6366f1" }}>
              {discovery.awaitingReview}
            </div>
            <div className="text-white/40 text-[10px] mt-0.5 uppercase tracking-wider">Awaiting Review</div>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <div className="text-2xl font-bold" style={{ color: riskCoverage.criticalCoverage === 100 ? "#10b981" : riskCoverage.criticalCoverage >= 50 ? "#f59e0b" : "#ef4444" }}>
              {riskCoverage.criticalCoverage}%
            </div>
            <div className="text-white/40 text-[10px] mt-0.5 uppercase tracking-wider">Critical Cov™</div>
          </div>
        </div>
      </div>

      {/* Risk-Based Coverage™ */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/10 rounded-xl p-5">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium uppercase tracking-wider mb-4">
          <Target size={14} /> Risk-Based Coverage™
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Critical Coverage */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/40 mb-3">Critical Coverage™ (Deployment Gate)</div>
            <div className="space-y-2.5">
              <CoverageRow label="Platform Entities" data={riskCoverage.platform} />
              <CoverageRow label="Organization Entities" data={riskCoverage.organization} />
              <CoverageRow label="User Entities" data={riskCoverage.user} />
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-white/60">Critical Coverage</span>
              <span className="text-lg font-bold" style={{ color: riskCoverage.criticalCoverage === 100 ? "#10b981" : "#f59e0b" }}>
                {riskCoverage.criticalCoverage}%
              </span>
            </div>
          </div>
          {/* Public + Overall */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/40 mb-3">Public & Overall</div>
            <div className="space-y-2.5">
              <CoverageRow label="Public Entities" data={riskCoverage.public} warning />
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Overall Coverage</span>
                <span className="text-lg font-bold text-white/80">{riskCoverage.overallCoverage}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">Deploy Gate</span>
                <span className="text-sm font-bold" style={{ color: riskCoverage.deploymentBlocked ? "#ef4444" : "#10b981" }}>
                  {riskCoverage.deploymentBlocked ? `🔴 BLOCKED (${riskCoverage.criticalUnverified} critical)` : "✅ PASS"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Technical Debt™ */}
      <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/10 rounded-xl p-5">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-medium uppercase tracking-wider mb-4">
          <AlertTriangle size={14} /> Security Technical Debt™
        </div>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <DebtCard label="Critical" value={securityDebt.critical} color="#ef4444" />
          <DebtCard label="High" value={securityDebt.high} color="#f59e0b" />
          <DebtCard label="Medium" value={securityDebt.medium} color="#eab308" />
          <DebtCard label="Low" value={securityDebt.low} color="#6366f1" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-white/40" />
            <span className="text-xs text-white/60">Estimated Effort to Clear Debt</span>
          </div>
          <span className="text-lg font-bold text-white">{securityDebt.effortHours} hours</span>
        </div>
      </div>

      {/* Isolation badges */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <IsolationBadge pass={scores.orgIsolation} label="Organization Isolation" />
        <IsolationBadge pass={scores.userIsolation} label="User Isolation" />
        <IsolationBadge pass={scores.platformIsolation} label="Platform Isolation" />
        <IsolationBadge pass={scores.crossTenantTests} label="Cross-Tenant Tests" />
      </div>

      {/* Classification breakdown */}
      <div className="grid sm:grid-cols-4 gap-3">
        {Object.values(SECURITY_CLASSIFICATIONS).map((cls) => {
          const entities = allEntities.filter((e) => e.classification === cls.id);
          const protectedCount = entities.filter((e) => e.status === "protected").length;
          const Icon = CLASS_ICON[cls.id];
          return (
            <div key={cls.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1" style={{ color: CLASS_COLOR[cls.id] }}>
                <Icon size={14} />
                <span className="text-xs font-medium uppercase tracking-wider">{cls.label}</span>
              </div>
              <div className="text-2xl font-bold text-white">{protectedCount}/{entities.length}</div>
              <div className="text-[10px] text-white/40 mt-1">{cls.description}</div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 bg-white/[0.02] border border-white/5 rounded-lg p-1">
          <button onClick={() => setFilter("all")} className={`px-3 py-1 rounded text-xs font-medium ${filter === "all" ? "bg-violet-500/15 text-violet-300" : "text-white/40 hover:text-white/70"}`}>
            All ({allEntities.length})
          </button>
          {Object.values(SECURITY_CLASSIFICATIONS).map((cls) => {
            const count = allEntities.filter((e) => e.classification === cls.id).length;
            return (
              <button key={cls.id} onClick={() => setFilter(cls.id)} className={`px-3 py-1 rounded text-xs font-medium ${filter === cls.id ? "bg-violet-500/15 text-violet-300" : "text-white/40 hover:text-white/70"}`}>
                {cls.label} ({count})
              </button>
            );
          })}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entities..."
            className="w-full bg-white/[0.02] border border-white/5 rounded-lg pl-9 pr-3 py-2 text-xs text-white/80 placeholder-white/30 focus:outline-none focus:border-violet-500/30"
          />
        </div>
      </div>

      {/* Registry table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-white/40 font-medium">Entity</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-white/40 font-medium">Classification</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-white/40 font-medium">Scope Field</th>
                <th className="text-left px-4 py-3 text-[10px] uppercase tracking-wider text-white/40 font-medium">Read Rule</th>
                <th className="text-center px-4 py-3 text-[10px] uppercase tracking-wider text-white/40 font-medium">R</th>
                <th className="text-center px-4 py-3 text-[10px] uppercase tracking-wider text-white/40 font-medium">U</th>
                <th className="text-center px-4 py-3 text-[10px] uppercase tracking-wider text-white/40 font-medium">D</th>
                <th className="text-center px-4 py-3 text-[10px] uppercase tracking-wider text-white/40 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entity) => {
                const StatusIcon = STATUS_ICON[entity.status];
                const statusColor = STATUS_COLOR[entity.status];
                const classColor = CLASS_COLOR[entity.classification];
                const opStatus = entity.status === "protected" ? "✓" : entity.status === "partial" ? "◐" : entity.status === "unverified" ? "?" : "✗";
                return (
                  <tr key={entity.name} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white/80 font-medium">{entity.name}</span>
                        {entity.sensitive && (
                          <Lock size={11} className="text-amber-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded border" style={{ color: classColor, borderColor: `${classColor}30`, background: `${classColor}10` }}>
                        {SECURITY_CLASSIFICATIONS[entity.classification].label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-[11px] text-white/50 font-mono">{entity.scope}</code>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-white/50">{entity.rule}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-mono" style={{ color: statusColor }}>{opStatus}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-mono" style={{ color: statusColor }}>{opStatus}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-mono" style={{ color: statusColor }}>{opStatus}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <StatusIcon size={12} style={{ color: statusColor }} />
                        <span className="text-[10px] font-medium" style={{ color: statusColor }}>
                          {RLS_STATUS[entity.status].label}
                        </span>
                      </div>
                      {entity.reviewStatus === "awaiting_review" && (
                        <div className="text-[9px] text-indigo-400/70 mt-0.5">{entity.confidence}% conf.</div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap text-[11px] text-white/40">
        <span className="flex items-center gap-1"><CheckCircle2 size={12} style={{ color: "#10b981" }} /> Protected — least-privilege CRUD</span>
        <span className="flex items-center gap-1"><AlertTriangle size={12} style={{ color: "#f59e0b" }} /> Partial — read restricted, mutations open</span>
        <span className="flex items-center gap-1"><XCircle size={12} style={{ color: "#ef4444" }} /> No RLS — empty {} block</span>
        <span className="flex items-center gap-1"><HelpCircle size={12} style={{ color: "#6366f1" }} /> Unverified — discovered, RLS not yet confirmed</span>
        <span className="flex items-center gap-1"><Clock size={11} className="text-indigo-400" /> Awaiting Review — heuristic classification, needs human confirmation</span>
        <span className="flex items-center gap-1"><Lock size={11} className="text-amber-400" /> Sensitive data</span>
      </div>
    </div>
  );
}