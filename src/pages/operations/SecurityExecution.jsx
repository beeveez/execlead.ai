import React, { useState } from "react";
import {
  Shield, CheckCircle, XCircle, AlertTriangle, Lock, Server, Package, Bug,
  Activity, Database, Cloud, GitBranch, FileText, Gauge, TrendingUp,
  TrendingDown, ShieldCheck, Clock, Bell, Cloud as CloudIcon, Code2, FileWarning,
} from "lucide-react";
import {
  POSTURE_DOMAINS, SECURE_CODING_STANDARDS, CI_SECURITY_CHECKS, SECURE_CODING_CONTROLS,
  INFRA_CONTROLS, ENVIRONMENTS, DEPENDENCY_HEALTH, DEPENDENCY_SCAN_SCHEDULE, PENETRATION_TESTS,
  MONITORING_CATEGORIES, INCIDENT_WORKFLOW, INCIDENT_HISTORY, BACKUP_STATUS, BACKUP_CHECKS,
  COMPLIANCE_FRAMEWORKS, SECURITY_AUTOMATION_CHECKS, SECURITY_METRICS,
  computePostureScore, RELEASE_GATE_MIN_SCORE, getGateStatus,
} from "@/lib/securityExecutionEngine";
import SecurityPostureManager from "@/components/security-execution/SecurityPostureManager";
import ReleaseGate from "@/components/security-execution/ReleaseGate";

const SEV_COLORS = { none: "#10b981", low: "#06b6d4", medium: "#f59e0b", high: "#ef4444", critical: "#ef4444" };
const STATUS_COLORS = { pass: "#10b981", warn: "#f59e0b", fail: "#ef4444", active: "#10b981", partial: "#f59e0b", planned: "#6366f1", completed: "#10b981", "in_progress": "#06b6d4", scheduled: "#a855f7", resolved: "#10b981", open: "#f59e0b" };

export default function SecurityExecution() {
  const [tab, setTab] = useState("posture");
  const postureScore = computePostureScore();
  const gate = getGateStatus();

  const TABS = [
    { id: "posture", label: "Posture Manager™", icon: ShieldCheck },
    { id: "sdlc", label: "Secure SDLC", icon: Code2 },
    { id: "infrastructure", label: "Infrastructure", icon: Server },
    { id: "dependencies", label: "Dependencies", icon: Package },
    { id: "pentest", label: "Penetration Testing", icon: Bug },
    { id: "monitoring", label: "Monitoring", icon: Activity },
    { id: "incident", label: "Incident Response", icon: AlertTriangle },
    { id: "backup", label: "Backup & DR", icon: Database },
    { id: "compliance", label: "Compliance", icon: FileText },
    { id: "automation", label: "Automation", icon: GitBranch },
    { id: "metrics", label: "Security Metrics", icon: Gauge },
    { id: "gate", label: "Release Gate", icon: Lock },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-0">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Shield size={12} className="text-emerald-400" /> Enterprise Security Operations Standard · Version 1.0 · Priority P0
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Platform Security Execution Framework™</h1>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${gate.pass ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
            {gate.pass ? <CheckCircle size={14} /> : <AlertTriangle size={14} />} Release Gate: {gate.pass ? "PASS" : "BLOCKED"}
          </div>
        </div>
        <p className="text-white/40 text-sm mt-1">Security is not a feature — it is an operational discipline. Every deployment strengthens trust. Every scan validates integrity. Every incident improves resilience.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <PostureBanner icon={ShieldCheck} color="#6366f1" value={`${postureScore}%`} label="Posture Score™" />
        <PostureBanner icon={Gauge} color="#06b6d4" value={SECURITY_METRICS.mttd} label="MTTD (Mean Detect)" />
        <PostureBanner icon={Clock} color="#f59e0b" value={SECURITY_METRICS.mttr} label="MTTR (Mean Respond)" />
        <PostureBanner icon={Bug} color="#ef4444" value={`${SECURITY_METRICS.criticalVulnerabilities}`} label="Critical Vulns" />
        <PostureBanner icon={Package} color="#10b981" value={`${SECURITY_METRICS.patchCompliance}%`} label="Patch Compliance" />
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${tab === t.id ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}>
            <t.icon size={12} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "posture" && <SecurityPostureManager />}
      {tab === "sdlc" && <SecureSDLCTab />}
      {tab === "infrastructure" && <InfrastructureTab />}
      {tab === "dependencies" && <DependenciesTab />}
      {tab === "pentest" && <PenetrationTestTab />}
      {tab === "monitoring" && <MonitoringTab />}
      {tab === "incident" && <IncidentResponseTab />}
      {tab === "backup" && <BackupDRTab />}
      {tab === "compliance" && <ComplianceTab />}
      {tab === "automation" && <AutomationTab />}
      {tab === "metrics" && <MetricsTab />}
      {tab === "gate" && <ReleaseGate />}
    </div>
  );
}

function PostureBanner({ icon: Icon, color, value, label }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center gap-3">
      <Icon size={20} style={{ color }} className="shrink-0" />
      <div>
        <div className="text-xl font-bold text-white">{value}</div>
        <div className="text-[10px] text-white/40">{label}</div>
      </div>
    </div>
  );
}

function SecureSDLCTab() {
  return (
    <div className="space-y-4">
      <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4 flex items-start gap-3">
        <Code2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-emerald-400">Security by Design — 9 Principles</h3>
          <p className="text-xs text-white/40 mt-1">Every feature must satisfy all 9 controls. No feature may bypass these controls.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {SECURE_CODING_STANDARDS.map((s) => (
          <div key={s.name} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs text-white/80">{s.name}</div>
              <div className="text-[9px] text-white/30">{s.category}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Secure Coding Controls Enforced</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {SECURE_CODING_CONTROLS.map((c) => (
            <div key={c.name} className="flex items-center gap-2 bg-white/[0.01] border border-white/[0.03] rounded-lg p-2.5">
              <CheckCircle size={14} className="text-emerald-400 shrink-0" />
              <div>
                <div className="text-[11px] text-white/70">{c.name}</div>
                <div className="text-[9px] text-white/30">{c.category}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><GitBranch size={14} className="text-indigo-400" /> CI/CD Security Checks — Every Pull Request</h3>
        <p className="text-xs text-white/30 mb-3">Critical findings automatically block merge. Every PR must execute: Unit Tests, Security Tests, Static Code Analysis, Dependency Scan, Secret Scan, Linting.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {CI_SECURITY_CHECKS.map((c) => (
            <div key={c.name} className="flex items-center justify-between bg-white/[0.01] border border-white/[0.03] rounded-lg p-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-400" />
                <div>
                  <div className="text-[11px] text-white/70">{c.name}</div>
                  <div className="text-[9px] text-white/30">
                    {c.category}
                    {c.blocking && <span className="text-red-400/60 ml-1">• Blocking</span>}
                  </div>
                </div>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">Enabled</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfrastructureTab() {
  return (
    <div className="space-y-4">
      <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-4 flex items-start gap-3">
        <Server size={16} className="text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-indigo-400">Hardened Cloud Infrastructure</h3>
          <p className="text-xs text-white/40 mt-1">13 infrastructure controls with {INFRA_CONTROLS.filter((c) => c.implemented).length}/{INFRA_CONTROLS.length} implemented.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {INFRA_CONTROLS.map((c) => (
          <div key={c.name} className={`flex items-center justify-between bg-white/[0.02] border rounded-lg p-3 ${c.implemented ? "border-emerald-500/10" : "border-red-500/10"}`}>
            <div className="flex items-center gap-2">
              {c.implemented ? <CheckCircle size={14} className="text-emerald-400" /> : <XCircle size={14} className="text-red-400" />}
              <span className="text-xs text-white/80">{c.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {c.critical && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400">Critical</span>}
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${c.implemented ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                {c.implemented ? "Implemented" : "Not Implemented"}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Cloud size={14} className="text-cyan-400" /> Multi-Environment Separation</h3>
        <p className="text-xs text-white/30 mb-3">Development, Testing, and Production must remain isolated.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ENVIRONMENTS.map((e) => (
            <div key={e.name} className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-white">{e.name}</span>
                <CheckCircle size={14} className="text-emerald-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px]"><span className="text-white/40">Isolated</span><span className={e.isolated ? "text-emerald-400" : "text-red-400"}>{e.isolated ? "Yes" : "No"}</span></div>
                <div className="flex items-center justify-between text-[10px]"><span className="text-white/40">Encryption</span><span className={e.encryption === "enabled" ? "text-emerald-400" : e.encryption === "partial" ? "text-amber-400" : "text-red-400"}>{e.encryption}</span></div>
                <div className="flex items-center justify-between text-[10px]"><span className="text-white/40">Access</span><span className="text-white/60">{e.access}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DependenciesTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        <DepStat count={DEPENDENCY_HEALTH.filter((d) => d.severity === "none").length} color="#10b981" label="No Issues" />
        <DepStat count={DEPENDENCY_HEALTH.filter((d) => d.severity === "low").length} color="#06b6d4" label="Low" />
        <DepStat count={DEPENDENCY_HEALTH.filter((d) => d.severity === "medium").length} color="#f59e0b" label="Medium" />
        <DepStat count={DEPENDENCY_HEALTH.filter((d) => d.severity === "high" || d.severity === "critical").length} color="#ef4444" label="High/Critical" />
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">Dependency Health™</h3>
          <div className="flex items-center gap-3 text-[10px] text-white/30">
            <span>Last scan: {DEPENDENCY_SCAN_SCHEDULE.lastScan}</span>
            <span>Next: {DEPENDENCY_SCAN_SCHEDULE.nextScan}</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/40 border-b border-white/5">
                <th className="text-left py-2 px-2">Package</th>
                <th className="text-left py-2 px-2">Current</th>
                <th className="text-center py-2 px-2">Severity</th>
                <th className="text-center py-2 px-2">Vulns</th>
                <th className="text-center py-2 px-2">Up to Date</th>
                <th className="text-left py-2 px-2">Recommended</th>
              </tr>
            </thead>
            <tbody>
              {DEPENDENCY_HEALTH.map((d, i) => (
                <tr key={i} className="border-b border-white/[0.03]">
                  <td className="py-2 px-2 text-white/80">{d.package}</td>
                  <td className="py-2 px-2 text-white/50">{d.version}</td>
                  <td className="py-2 px-2 text-center"><span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${SEV_COLORS[d.severity]}20`, color: SEV_COLORS[d.severity] }}>{d.severity}</span></td>
                  <td className="py-2 px-2 text-center text-white/60">{d.vulnerabilities}</td>
                  <td className="py-2 px-2 text-center">{d.upToDate ? <CheckCircle size={12} className="text-emerald-400 mx-auto" /> : <XCircle size={12} className="text-red-400 mx-auto" />}</td>
                  <td className="py-2 px-2 text-white/40">{d.recommendedVersion || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-white mb-2">Monitored Sources</h3>
        <div className="flex flex-wrap gap-2">
          {DEPENDENCY_SCAN_SCHEDULE.advisoriesMonitored.map((a) => <span key={a} className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/50">{a}</span>)}
        </div>
      </div>
    </div>
  );
}

function DepStat({ count, color, label }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
      <div className="text-2xl font-bold" style={{ color }}>{count}</div>
      <div className="text-[10px] text-white/40">{label}</div>
    </div>
  );
}

function PenetrationTestTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-cyan-500/5 border border-cyan-500/15 rounded-xl p-4">
          <Bug size={16} className="text-cyan-400 mb-2" />
          <h3 className="text-sm font-medium text-cyan-400">Internal Penetration Testing</h3>
          <p className="text-[11px] text-white/40 mt-1">Weekly · Automated · OWASP ZAP + Dependency Scans + API Security + Authentication + Authorization</p>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4">
          <AlertTriangle size={16} className="text-amber-400 mb-2" />
          <h3 className="text-sm font-medium text-amber-400">External Penetration Testing</h3>
          <p className="text-[11px] text-white/40 mt-1">Before Public Launch · Independent Security Assessment · Auth, RBAC, Tenant Isolation, Prompt Injection, File Uploads, Billing, Identity, API</p>
        </div>
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Penetration Test Report™</h3>
        <div className="space-y-2">
          {PENETRATION_TESTS.map((p) => (
            <div key={p.id} className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${p.type === "Internal" ? "bg-cyan-500/15 text-cyan-400" : "bg-amber-500/15 text-amber-400"}`}>{p.type}</span>
                  <span className="text-xs text-white/80">{p.id}</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${STATUS_COLORS[p.status]}20`, color: STATUS_COLORS[p.status] }}>{p.status}</span>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-white/30 mb-1">
                <span className="text-white/50">{p.date}</span>
                <span>Status: {p.executor}</span>
                {p.score && <span>Score: <span className="text-white/60 font-medium">{p.score}/100</span></span>}
              </div>
              <p className="text-[10px] text-white/40">{p.scope}</p>
              <div className="flex items-center gap-3 mt-1 text-[9px]">
                {p.findings.critical > 0 && <span className="text-red-400">Critical: {p.findings.critical}</span>}
                {p.findings.high > 0 && <span className="text-orange-400">High: {p.findings.high}</span>}
                {p.findings.medium > 0 && <span className="text-amber-400">Medium: {p.findings.medium}</span>}
                {p.findings.low > 0 && <span className="text-cyan-400">Low: {p.findings.low}</span>}
                {p.findings.critical + p.findings.high + p.findings.medium + p.findings.low === 0 && <span className="text-emerald-400">No findings</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-4 flex items-start gap-3">
        <FileText size={16} className="text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-indigo-400">Penetration Test Report™ Generation</h3>
          <p className="text-xs text-white/40 mt-1">Each test generates a comprehensive report including scope, methodology, findings by severity, evidence, and remediation recommendations. Reports are stored as immutable audit records.</p>
        </div>
      </div>
    </div>
  );
}

function MonitoringTab() {
  return (
    <div className="space-y-4">
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-start gap-3">
        <Bell size={16} className="text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-indigo-400">Security Operations Center™ — Continuous Monitoring</h3>
          <p className="text-xs text-white/40 mt-1">Every alert contains: Severity, Owner, Status, Evidence, Resolution, Timestamp.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {MONITORING_CATEGORIES.map((m) => (
          <div key={m.category} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white">{m.category}</h3>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> active
                </span>
                {m.alerts24h > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400">{m.alerts24h} alerts (24h)</span>}
              </div>
            </div>
            <div className="space-y-1">
              {m.checks.map((c) => <div key={c} className="flex items-center gap-2 text-[11px] text-white/50"><CheckCircle size={12} className="text-emerald-400" /> {c}</div>)}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-white mb-2">Alert Structure — Every Alert Contains</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {["Severity", "Owner", "Status", "Evidence", "Resolution", "Timestamp"].map((f) => (
            <div key={f} className="flex items-center gap-1.5 bg-white/[0.01] border border-white/[0.03] rounded-lg px-2 py-1">
              <CheckCircle size={12} className="text-emerald-400" /><span className="text-[10px] text-white/60">{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IncidentResponseTab() {
  return (
    <div className="space-y-4">
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-amber-400">Incident Response Engine™</h3>
          <p className="text-xs text-white/40 mt-1">Workflow: Detect → Classify → Contain → Investigate → Recover → Lessons Learned. Track: Response Time, Resolution Time, Root Cause, Business Impact, Evidence, Owner.</p>
        </div>
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Incident Response Workflow</h3>
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {INCIDENT_WORKFLOW.map((stage, i) => (
            <div key={stage.stage} className="flex items-center">
              <div className="flex flex-col items-center min-w-[100px]">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${stage.automated ? "bg-emerald-500/10 border-emerald-500/30" : "bg-indigo-500/10 border-indigo-500/30"}`}>
                  <span className="text-xs font-bold text-white">{i + 1}</span>
                </div>
                <div className="text-[10px] text-white/70 mt-1 font-medium text-center">{stage.stage}</div>
                <div className="text-[9px] text-white/30">SLA: {stage.sla}</div>
                {stage.automated && <div className="text-[8px] text-emerald-400/60">Auto</div>}
              </div>
              {i < INCIDENT_WORKFLOW.length - 1 && <div className="h-px w-8 bg-white/10" />}
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Recent Incidents</h3>
        <div className="space-y-2">
          {INCIDENT_HISTORY.map((inc) => (
            <div key={inc.id} className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${inc.severity === "critical" ? "bg-red-500/15 text-red-400" : inc.severity === "high" ? "bg-orange-500/15 text-orange-400" : inc.severity === "medium" ? "bg-amber-500/15 text-amber-400" : "bg-cyan-500/15 text-cyan-400"}`}>{inc.severity}</span>
                  <span className="text-xs text-white/80">{inc.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-white/30">{inc.id}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">{inc.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-white/30">
                <span>Detected: {inc.detected}</span>
                <span>MTTD: {inc.mttd}</span>
                <span>MTTR: {inc.mttr}</span>
                <span>Owner: {inc.owner}</span>
              </div>
              <p className="text-[10px] text-white/40 mt-1"><span className="text-white/60">Root cause:</span> {inc.rootCause}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BackupDRTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <BackupStat value={`${BACKUP_STATUS.backupSuccessRate}%`} label="Backup Success Rate" color="#10b981" />
        <BackupStat value={BACKUP_STATUS.recoveryTime} label="Recovery Time (RTO)" color="#06b6d4" />
        <BackupStat value={BACKUP_STATUS.recoveryPoint} label="Recovery Point (RPO)" color="#6366f1" />
        <BackupStat value={`${BACKUP_STATUS.retentionDays} days`} label="Retention Period" color="#a855f7" />
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><Database size={14} className="text-indigo-400" /> Backup Health Dashboard™</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="space-y-2 text-xs">
            <Row label="Last Backup" value={BACKUP_STATUS.lastBackup} />
            <Row label="Next Backup" value={BACKUP_STATUS.nextBackup} />
            <Row label="Frequency" value={BACKUP_STATUS.frequency} />
            <Row label="Encryption" value={BACKUP_STATUS.encryption} valueClass="text-emerald-400" />
            <Row label="Retention" value={`${BACKUP_STATUS.retentionDays} days`} />
          </div>
          <div className="space-y-2 text-xs">
            <Row label="Last Restore Test" value={BACKUP_STATUS.lastRestoreTest} />
            <Row label="Restore Test Result" value={BACKUP_STATUS.restoreTestResult} valueClass="text-emerald-400 font-medium" />
            <Row label="Recovery Time (RTO)" value={BACKUP_STATUS.recoveryTime} />
            <Row label="Recovery Point (RPO)" value={BACKUP_STATUS.recoveryPoint} />
            <Row label="Verification" value={BACKUP_STATUS.verificationEnabled ? "Enabled" : "Disabled"} valueClass="text-emerald-400" />
          </div>
        </div>
        <div className="flex items-center justify-center gap-1 flex-wrap">
          {BACKUP_CHECKS.map((b, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle size={14} className="text-emerald-400" />
                </div>
                <div className="text-[9px] text-white/50 mt-1 text-center max-w-[80px]">{b.name}</div>
              </div>
              {i < BACKUP_CHECKS.length - 1 && <div className="h-px w-4 bg-white/10" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BackupStat({ value, label, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="text-xl font-bold" style={{ color }}>{value}</div>
      <div className="text-[10px] text-white/40">{label}</div>
    </div>
  );
}

function Row({ label, value, valueClass = "" }) {
  return (
    <div className="flex justify-between">
      <span className="text-white/40">{label}</span>
      <span className={valueClass || "text-white/70"}>{value}</span>
    </div>
  );
}

function ComplianceTab() {
  return (
    <div className="space-y-4">
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-start gap-3">
        <FileText size={16} className="text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-indigo-400">Security Compliance Mapping</h3>
          <p className="text-xs text-white/40 mt-1">Implemented controls mapped against OWASP ASVS, OWASP Top 10, CIS Controls, NIST CSF, ISO/IEC 27001, and SOC 2 Readiness.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {COMPLIANCE_FRAMEWORKS.map((f) => (
          <div key={f.name} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white">{f.name}</h3>
              <span className={`text-lg font-bold ${f.overall >= 90 ? "text-emerald-400" : f.overall >= 75 ? "text-amber-400" : "text-red-400"}`}>{f.overall}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-3">
              <div className={`h-full rounded-full ${f.overall >= 90 ? "bg-emerald-500" : f.overall >= 75 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${f.overall}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2">
                <div className="text-sm font-bold text-emerald-400">{f.implemented}</div>
                <div className="text-[9px] text-white/40">Implemented</div>
              </div>
              <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-2">
                <div className="text-sm font-bold text-amber-400">{f.partial}</div>
                <div className="text-[9px] text-white/40">Partial</div>
              </div>
              <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-2">
                <div className="text-sm font-bold text-red-400">{Math.max(0, f.total - f.implemented - f.partial)}</div>
                <div className="text-[9px] text-white/40">Gap</div>
              </div>
            </div>
            <div className="text-[10px] text-white/30 mt-2 text-center">{f.implemented} of {f.total} controls · {f.partial} partial</div>
          </div>
        ))}
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <h3 className="text-xs font-semibold text-white mb-2">Gap Analysis Status</h3>
        <div className="flex flex-wrap gap-2">
          {["Implemented", "Partial", "Planned", "Gap Analysis"].map((s) => <span key={s} className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/50">{s} — Tracked per framework</span>)}
        </div>
      </div>
    </div>
  );
}

function AutomationTab() {
  return (
    <div className="space-y-4">
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-start gap-3">
        <GitBranch size={16} className="text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-indigo-400">Security Automation — Pre-Deployment Checks</h3>
          <p className="text-xs text-white/40 mt-1">Before every deployment, automatically execute 10 security checks. Critical findings block deployment.</p>
        </div>
      </div>
      <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3 mb-3 flex items-center gap-2">
        <CheckCircle size={16} className="text-emerald-400" />
        <span className="text-sm text-emerald-400 font-medium">All {SECURITY_AUTOMATION_CHECKS.length} checks passed</span>
        <span className="text-xs text-white/40 ml-auto">Last run: 2026-07-25T13:00Z</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {SECURITY_AUTOMATION_CHECKS.map((c) => (
          <div key={c.name} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-400" />
              <div>
                <div className="text-xs text-white/80">{c.name}</div>
                <div className="text-[9px] text-white/30">{c.category} · {c.duration}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {c.blocking && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400">Blocking</span>}
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">Pass</span>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-red-400">Critical Findings → Block Deployment</h3>
          <p className="text-xs text-white/40 mt-1">Any critical finding in the security automation checks automatically blocks the deployment pipeline. No manual override permitted.</p>
        </div>
      </div>
    </div>
  );
}

function MetricsTab() {
  const metrics = [
    { label: "Mean Time To Detect (MTTD)", value: SECURITY_METRICS.mttd, trend: SECURITY_METRICS.mttdTrend, icon: Clock, color: "#06b6d4", desc: "Time from incident occurrence to detection" },
    { label: "Mean Time To Respond (MTTR)", value: SECURITY_METRICS.mttr, trend: SECURITY_METRICS.mttrTrend, icon: AlertTriangle, color: "#f59e0b", desc: "Time from detection to resolution" },
    { label: "Critical Vulnerabilities", value: `${SECURITY_METRICS.criticalVulnerabilities}`, trend: 0, icon: Bug, color: "#ef4444", desc: "Open critical vulnerability count" },
    { label: "Open Security Findings", value: `${SECURITY_METRICS.openFindings}`, trend: SECURITY_METRICS.openFindingsTrend, icon: FileWarning, color: "#f59e0b", desc: "Total open security findings" },
    { label: "Patch Compliance", value: `${SECURITY_METRICS.patchCompliance}%`, trend: 0, icon: CheckCircle, color: "#10b981", desc: "Percentage of systems patched" },
    { label: "Dependency Health (Critical)", value: `${SECURITY_METRICS.dependencyCritical}`, trend: 0, icon: Package, color: "#ef4444", desc: "Critical dependency vulnerabilities" },
    { label: "Dependency Health (High)", value: `${SECURITY_METRICS.dependencyHigh}`, trend: 0, icon: Package, color: "#f59e0b", desc: "High dependency vulnerabilities" },
    { label: "Security Regression Pass Rate", value: `${SECURITY_METRICS.securityRegressionPassRate}%`, trend: 0, icon: CheckCircle, color: "#10b981", desc: "CI/CD security test pass rate" },
    { label: "Backup Success Rate", value: `${SECURITY_METRICS.backupSuccessRate}%`, trend: 0, icon: Database, color: "#10b981", desc: "Daily backup success rate" },
    { label: "Penetration Test Status", value: "Internal: Passed", trend: 0, icon: Bug, color: "#06b6d4", desc: SECURITY_METRICS.penTestStatus },
    { label: "Security Posture Score™", value: `${SECURITY_METRICS.postureScore}%`, trend: 0, icon: ShieldCheck, color: "#6366f1", desc: "Overall security posture" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <m.icon size={16} style={{ color: m.color }} />
            <div className="flex items-center gap-1 mt-2">
              <div className="text-xl font-bold text-white">{m.value}</div>
              {m.trend !== 0 && (
                <span className={`text-[10px] flex items-center ${m.trend < 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {m.trend < 0 ? <TrendingDown size={10} /> : <TrendingUp size={10} />} {Math.abs(m.trend)}%
                </span>
              )}
            </div>
            <div className="text-xs text-white/40">{m.label}</div>
            <div className="text-[10px] text-white/30 mt-0.5">{m.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}