import React, { useState } from "react";
import { ShieldCheck, AlertTriangle, Bug, Package, Globe, Wrench, FileText, Clock, CheckCircle, XCircle, Download, FileJson, Brain, Server, Lock, Scan, Activity, Zap } from "lucide-react";
import { useSecurityOperationsData } from "@/hooks/useSecurityOperationsData";
import { computeSecurityScore, buildMonitoringFeed, getMonitoringSummary, getSecurityAlerts, getThreatLevel, SCAN_SCHEDULES, DEPENDENCY_ISSUES, THREAT_INTELLIGENCE, PATCH_MANAGEMENT, PEN_TEST_HISTORY, AI_SECURITY_CHECKS, COMPLIANCE_FRAMEWORKS } from "@/lib/securityOperationsEngine";
import SecurityScoreGauge from "@/components/security-ops/SecurityScoreGauge";
import MonitoringPanel from "@/components/security-ops/MonitoringPanel";

const SEV_COLORS = { critical: "#ef4444", high: "#f59e0b", medium: "#eab308", low: "#6366f1", warning: "#eab308", info: "#6366f1" };
const STATUS_COLORS = { passing: "#10b981", review: "#f59e0b", failing: "#ef4444" };

export default function SecurityOperations() {
  const { data, loading, error } = useSecurityOperationsData();
  const [tab, setTab] = useState("dashboard");

  const score = data ? computeSecurityScore(data) : null;
  const feed = data ? buildMonitoringFeed(data) : [];
  const monitorSummary = getMonitoringSummary(feed);
  const alerts = data ? getSecurityAlerts(data) : [];
  const threatLevel = data ? getThreatLevel(data) : { level: "—", color: "#6366f1", label: "Analyzing…" };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin" /></div>;
  if (error) return <div className="py-20 text-center text-white/40 text-sm">Unable to load security data.</div>;

  const TABS = [
    { id: "dashboard", label: "Dashboard", icon: ShieldCheck },
    { id: "monitoring", label: "Monitoring", icon: Activity },
    { id: "scans", label: "Vulnerability Scans", icon: Scan },
    { id: "dependencies", label: "Dependencies", icon: Package },
    { id: "threats", label: "Threat Intel", icon: Globe },
    { id: "patches", label: "Patches", icon: Wrench },
    { id: "pentest", label: "Pen Testing", icon: Bug },
    { id: "audit", label: "Audit Logs", icon: FileText },
    { id: "compliance", label: "Compliance", icon: CheckCircle },
    { id: "ai", label: "AI Security", icon: Brain },
  ];

  const lastScan = SCAN_SCHEDULES[0].items[0].lastRun;

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-0">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <ShieldCheck size={12} className="text-emerald-400" /> Operations Workspace · Continuous Security Intelligence™ v1.0
          </div>
          <h1 className="text-2xl font-bold text-white">Security Operations Center™</h1>
          <p className="text-white/40 text-sm mt-1">Always-on platform protection — monitoring, detecting, testing, and improving security posture 24/7.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: `${threatLevel.color}15`, color: threatLevel.color }}>
            <AlertTriangle size={12} /> Threat Level: {threatLevel.level}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${tab === t.id ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}>
            <t.icon size={12} /> {t.label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {tab === "dashboard" && (
        <div className="space-y-4">
          {/* Score + KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center">
              <SecurityScoreGauge score={score?.overall || 0} target={score?.target || 95} />
              <div className={`text-xs mt-2 font-medium ${score?.overall >= 90 ? "text-emerald-400" : score?.overall >= 75 ? "text-cyan-400" : "text-amber-400"}`}>
                Target: {score?.target}%+ · {score?.overall >= score?.target ? "On Target" : `${score?.target - score?.overall} points to target`}
              </div>
            </div>
            <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3">
              <KpiCard icon={AlertTriangle} label="Critical Issues" value={alerts.filter((a) => a.severity === "critical").length} color="#ef4444" />
              <KpiCard icon={Bug} label="Open Vulnerabilities" value={DEPENDENCY_ISSUES.filter((d) => d.severity === "high" || d.severity === "critical").length} color="#f59e0b" />
              <KpiCard icon={Clock} label="Last Scan" value={new Date(lastScan).toLocaleDateString()} color="#06b6d4" />
              <KpiCard icon={CheckCircle} label="Compliance Status" value={`${Math.round(COMPLIANCE_FRAMEWORKS.reduce((s, f) => s + f.maturity, 0) / COMPLIANCE_FRAMEWORKS.length)}%`} color="#10b981" />
              <KpiCard icon={Wrench} label="Patch Progress" value={`${PATCH_MANAGEMENT.filter((p) => p.status === "applied").length}/${PATCH_MANAGEMENT.length}`} color="#6366f1" />
              <KpiCard icon={Activity} label="Threat Level" value={threatLevel.level} color={threatLevel.color} />
              <KpiCard icon={ShieldCheck} label="Security Events (24h)" value={feed.length} color="#a855f7" />
              <KpiCard icon={Server} label="Active Sessions" value={data?.sessions?.length || 0} color="#14b8a6" />
            </div>
          </div>

          {/* Score breakdown */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-400" /> Security Score Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
              {score?.scores.map((s, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/60">{s.name}</span>
                    <span className="text-xs font-medium" style={{ color: s.score >= 90 ? "#10b981" : s.score >= 75 ? "#06b6d4" : "#f59e0b" }}>{s.score} <span className="text-white/30 text-[10px]">/ {s.target}</span></span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${s.score}%`, backgroundColor: s.score >= 90 ? "#10b981" : s.score >= 75 ? "#06b6d4" : "#f59e0b" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent alerts */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2"><AlertTriangle size={14} className="text-amber-400" /> Recent Security Alerts</h3>
            {alerts.length > 0 ? (
              <div className="space-y-2">
                {alerts.slice(0, 8).map((a, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white/[0.01] border border-white/[0.03] rounded-md p-3">
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: SEV_COLORS[a.severity] || "#6366f1" }} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-white/80">{a.title}</span>
                        <span className="text-[9px] text-white/30">{a.timestamp ? new Date(a.timestamp).toLocaleString() : ""}</span>
                      </div>
                      {a.details && <p className="text-[10px] text-white/40 mt-0.5">{a.details}</p>}
                    </div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${SEV_COLORS[a.severity] || "#6366f1"}20`, color: SEV_COLORS[a.severity] || "#6366f1" }}>{a.severity}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-white/30 text-xs">No active security alerts. All systems secure.</p>}
          </div>
        </div>
      )}

      {/* Monitoring Tab */}
      {tab === "monitoring" && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Activity size={14} className="text-emerald-400" /> Continuous Security Monitoring — 24/7</h3>
            <span className="text-[10px] text-white/30">{feed.length} events detected</span>
          </div>
          <MonitoringPanel summary={monitorSummary} feed={feed} />
        </div>
      )}

      {/* Vulnerability Scans Tab */}
      {tab === "scans" && (
        <div className="space-y-4">
          {SCAN_SCHEDULES.map((sched) => (
            <div key={sched.frequency} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Scan size={14} className="text-indigo-400" /> {sched.frequency} Scans</h3>
                <span className="text-[10px] text-white/30">{sched.schedule}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {sched.items.map((item, i) => (
                  <div key={i} className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/80">{item.name}</span>
                      {item.findings > 0 ? <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-medium">{item.findings} findings</span> : <CheckCircle size={14} className="text-emerald-400" />}
                    </div>
                    <div className="text-[9px] text-white/30">Last run: {new Date(item.lastRun).toLocaleString()}</div>
                    <div className="text-[9px] text-emerald-400/60 mt-1 flex items-center gap-1"><CheckCircle size={8} /> {item.status}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dependencies Tab */}
      {tab === "dependencies" && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Package size={14} className="text-indigo-400" /> Dependency Management</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-white/40 border-b border-white/5">
                <th className="text-left py-2 px-2">Package</th><th className="text-left py-2 px-2">Version</th><th className="text-center py-2 px-2">Severity</th><th className="text-left py-2 px-2">Issue</th><th className="text-left py-2 px-2">Recommendation</th>
              </tr></thead>
              <tbody>
                {DEPENDENCY_ISSUES.map((d, i) => (
                  <tr key={i} className="border-b border-white/[0.03]">
                    <td className="py-2 px-2 text-white/80 font-mono">{d.package}</td>
                    <td className="py-2 px-2 text-white/40 font-mono">{d.version}</td>
                    <td className="py-2 px-2 text-center"><span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${SEV_COLORS[d.severity]}20`, color: SEV_COLORS[d.severity] }}>{d.severity}</span></td>
                    <td className="py-2 px-2 text-white/50">{d.issue}</td>
                    <td className="py-2 px-2 text-white/40">{d.recommendation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Threat Intelligence Tab */}
      {tab === "threats" && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Globe size={14} className="text-indigo-400" /> Threat Intelligence Feed™</h3>
          <div className="space-y-2">
            {THREAT_INTELLIGENCE.map((t, i) => (
              <div key={i} className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-3 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: SEV_COLORS[t.severity] || "#6366f1" }} />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-white/80">{t.title}</span>
                    <span className="text-[9px] text-white/30">{t.date}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[9px] text-white/40">{t.category}</span>
                    <span className="text-[9px] text-white/30">Source: {t.source}</span>
                  </div>
                  <p className="text-[10px] text-white/40 mt-1">{t.impact}</p>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${SEV_COLORS[t.severity]}20`, color: SEV_COLORS[t.severity] }}>{t.severity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patch Management Tab */}
      {tab === "patches" && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Wrench size={14} className="text-indigo-400" /> Security Patch Management</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-white/40 border-b border-white/5">
                <th className="text-left py-2 px-2">Patch</th><th className="text-left py-2 px-2">Type</th><th className="text-center py-2 px-2">Severity</th><th className="text-center py-2 px-2">Status</th><th className="text-center py-2 px-2">Risk</th><th className="text-left py-2 px-2">Description</th>
              </tr></thead>
              <tbody>
                {PATCH_MANAGEMENT.map((p, i) => (
                  <tr key={i} className="border-b border-white/[0.03]">
                    <td className="py-2 px-2 text-white/80">{p.name}</td>
                    <td className="py-2 px-2 text-white/50">{p.type}</td>
                    <td className="py-2 px-2 text-center"><span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${SEV_COLORS[p.severity]}20`, color: SEV_COLORS[p.severity] }}>{p.severity}</span></td>
                    <td className="py-2 px-2 text-center">{p.status === "applied" ? <CheckCircle size={14} className="text-emerald-400 mx-auto" /> : <Clock size={14} className="text-amber-400 mx-auto" />}</td>
                    <td className="py-2 px-2 text-center text-white/40">{p.risk}</td>
                    <td className="py-2 px-2 text-white/40">{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pen Testing Tab */}
      {tab === "pentest" && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Bug size={14} className="text-indigo-400" /> Penetration Testing History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-white/40 border-b border-white/5">
                <th className="text-left py-2 px-2">Date</th><th className="text-left py-2 px-2">Type</th><th className="text-center py-2 px-2">Findings</th><th className="text-center py-2 px-2">Resolved</th><th className="text-center py-2 px-2">Open</th><th className="text-center py-2 px-2">Risk</th><th className="text-left py-2 px-2">Tester</th>
              </tr></thead>
              <tbody>
                {PEN_TEST_HISTORY.map((t, i) => (
                  <tr key={i} className="border-b border-white/[0.03]">
                    <td className="py-2 px-2 text-white/80">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="py-2 px-2 text-white/50">{t.type}</td>
                    <td className="py-2 px-2 text-center text-white/60">{t.findings}</td>
                    <td className="py-2 px-2 text-center text-emerald-400">{t.resolved}</td>
                    <td className="py-2 px-2 text-center"><span className={t.open > 0 ? "text-amber-400" : "text-white/30"}>{t.open}</span></td>
                    <td className="py-2 px-2 text-center"><span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${SEV_COLORS[t.risk.toLowerCase()]}20`, color: SEV_COLORS[t.risk.toLowerCase()] }}>{t.risk}</span></td>
                    <td className="py-2 px-2 text-white/40">{t.tester}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <KpiCard icon={Bug} label="Total Findings" value={PEN_TEST_HISTORY.reduce((s, t) => s + t.findings, 0)} color="#f59e0b" />
            <KpiCard icon={CheckCircle} label="Resolved" value={PEN_TEST_HISTORY.reduce((s, t) => s + t.resolved, 0)} color="#10b981" />
            <KpiCard icon={AlertTriangle} label="Open" value={PEN_TEST_HISTORY.reduce((s, t) => s + t.open, 0)} color="#ef4444" />
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {tab === "audit" && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><FileText size={14} className="text-indigo-400" /> Audit Logging</h3>
          {data?.auditLogs?.length > 0 ? (
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {data.auditLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/[0.01] border border-white/[0.03] rounded-md p-2.5">
                  <FileText size={12} className="text-white/30 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-white/80">{log.action || log.event || "Audit Event"}</span>
                      <span className="text-[9px] text-white/30">{log.timestamp ? new Date(log.timestamp).toLocaleString() : ""}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {log.requester_name && <span className="text-[10px] text-white/40">{log.requester_name}</span>}
                      {log.decision && <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: log.decision === "approved" ? "#10b98120" : "#ef444420", color: log.decision === "approved" ? "#10b981" : "#ef4444" }}>{log.decision}</span>}
                      {log.risk_level && <span className="text-[9px] text-white/30">Risk: {log.risk_level}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-white/30 text-xs">No audit logs found.</p>}
        </div>
      )}

      {/* Compliance Tab */}
      {tab === "compliance" && (
        <div className="space-y-4">
          {COMPLIANCE_FRAMEWORKS.map((f) => (
            <div key={f.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className={f.maturity >= 80 ? "text-emerald-400" : f.maturity >= 70 ? "text-cyan-400" : "text-amber-400"} />
                  <span className="text-sm font-medium text-white">{f.name}</span>
                </div>
                <span className="text-sm font-bold" style={{ color: f.maturity >= 80 ? "#10b981" : f.maturity >= 70 ? "#06b6d4" : "#f59e0b" }}>{f.maturity}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full" style={{ width: `${f.maturity}%`, backgroundColor: f.maturity >= 80 ? "#10b981" : f.maturity >= 70 ? "#06b6d4" : "#f59e0b" }} />
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-white/30">Target: {f.target}%</span>
                <span className="text-white/30">{f.maturity >= f.target ? "On Target" : `${f.target - f.maturity}% to target`}</span>
              </div>
              {f.gaps.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/[0.03]">
                  <span className="text-[10px] text-white/40">Gaps:</span>
                  <ul className="mt-1 space-y-0.5">{f.gaps.map((g, i) => <li key={i} className="text-[10px] text-white/30 flex gap-1"><span className="text-amber-400/50">•</span> {g}</li>)}</ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* AI Security Tab */}
      {tab === "ai" && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Brain size={14} className="text-indigo-400" /> AI Security Review</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AI_SECURITY_CHECKS.map((c) => (
              <div key={c.id} className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {c.status === "passing" ? <CheckCircle size={14} className="text-emerald-400" /> : <AlertTriangle size={14} className="text-amber-400" />}
                    <span className="text-xs text-white/80">{c.label}</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: STATUS_COLORS[c.status] }}>{c.score}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                  <div className="h-full rounded-full" style={{ width: `${c.score}%`, backgroundColor: STATUS_COLORS[c.status] }} />
                </div>
                <p className="text-[10px] text-white/40">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <Icon size={16} style={{ color }} />
      <div className="text-xl font-bold text-white mt-2">{value}</div>
      <div className="text-xs text-white/40">{label}</div>
    </div>
  );
}