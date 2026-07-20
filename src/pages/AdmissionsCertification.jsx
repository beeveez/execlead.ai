import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { runCertification } from "@/lib/admissionsCertificationEngine";
import {
  ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Loader2, Award,
  FileCheck, Lock, Mail, Gauge, RefreshCw, Eye, ClipboardCheck, Play,
  BarChart3,
} from "lucide-react";

const ADMIN_ROLES = ["super_admin", "platform_admin", "admin", "developer"];

const STATUS_ICON = {
  pass: { icon: CheckCircle2, color: "text-emerald-400" },
  fail: { icon: XCircle, color: "text-red-400" },
  warn: { icon: AlertTriangle, color: "text-amber-400" },
};

const TABS = [
  { id: "report", label: "Certification Report", icon: Award },
  { id: "systems", label: "System Validation", icon: ShieldCheck },
  { id: "e2e", label: "End-to-End Tests", icon: Play },
  { id: "security", label: "Security", icon: Lock },
  { id: "email", label: "Email", icon: Mail },
  { id: "performance", label: "Performance", icon: Gauge },
  { id: "recovery", label: "Recovery", icon: RefreshCw },
  { id: "ops", label: "Operational Readiness", icon: FileCheck },
  { id: "observability", label: "Observability", icon: Eye },
  { id: "metrics", label: "Metrics Integrity", icon: BarChart3 },
  { id: "gongo", label: "GO / NO-GO", icon: ClipboardCheck },
];

export default function AdmissionsCertification() {
  const { user } = useAuth();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("report");

  const runCert = async () => {
    setRunning(true);
    try {
      const apps = await base44.entities.BetaApplication.list("-created_date", 200).catch(() => []);
      const result = await runCertification(apps || []);
      setCert(result);
    } catch (e) {
      const result = await runCertification([]);
      setCert(result);
    }
    setRunning(false);
    setLoading(false);
  };

  useEffect(() => { runCert(); }, []);

  if (loading || running) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
        <p className="text-xs text-white/40">Running production readiness certification...</p>
      </div>
    );
  }

  if (!ADMIN_ROLES.includes(user?.role)) return <Navigate to="/home" replace />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <Award size={12} className="text-amber-400" /> v4.0 Certification
          </div>
          <h1 className="text-2xl font-bold text-white">Production Readiness Certification™</h1>
          <p className="text-white/40 text-sm mt-1">Final certification of the Founding Member Admissions Platform™</p>
        </div>
        <button onClick={runCert} disabled={running} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-medium disabled:opacity-50">
          <RefreshCw size={14} className={running ? "animate-spin" : ""} /> Re-run
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? "bg-amber-500/15 text-amber-400" : "text-white/40 hover:text-white/70"}`}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {cert && activeTab === "report" && <ReportTab report={cert.report} />}
      {cert && activeTab === "systems" && <CheckList title="System Validation" checks={cert.systemValidation} />}
      {cert && activeTab === "e2e" && <E2ETab tests={cert.e2eTests} />}
      {cert && activeTab === "security" && <CheckList title="Security Certification" checks={cert.security} />}
      {cert && activeTab === "email" && <CheckList title="Email Certification" checks={cert.email} />}
      {cert && activeTab === "performance" && <PerformanceTab metrics={cert.performance} />}
      {cert && activeTab === "recovery" && <CheckList title="Recovery Testing" checks={cert.recovery} />}
      {cert && activeTab === "ops" && <CheckList title="Operational Readiness" checks={cert.operational} />}
      {cert && activeTab === "observability" && <CheckList title="Observability" checks={cert.observability} />}
      {cert && activeTab === "metrics" && <CheckList title="Dashboard Metrics Integrity" checks={cert.metricsIntegrity || []} />}
      {cert && activeTab === "gongo" && <GoNoGoTab goNoGo={cert.goNoGo} report={cert.report} />}
    </div>
  );
}

// ============================================================
// REPORT TAB
// ============================================================
function ReportTab({ report }) {
  const scoreColor = report.score >= 90 ? "#10b981" : report.score >= 80 ? "#f59e0b" : "#ef4444";
  const isGo = report.recommendation === "GO";

  return (
    <div className="space-y-5">
      {/* Hero Card */}
      <div className={`p-6 rounded-2xl border ${isGo ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}>
        <div className="flex items-center gap-6">
          {/* Score Ring */}
          <div className="relative w-28 h-28 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 112 112">
              <circle cx="56" cy="56" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              <circle cx="56" cy="56" r="50" fill="none" stroke={scoreColor} strokeWidth="6" strokeLinecap="round" strokeDasharray={2 * Math.PI * 50} strokeDashoffset={2 * Math.PI * 50 - (report.score / 100) * 2 * Math.PI * 50} className="transition-all duration-1000" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold" style={{ color: scoreColor }}>{report.score}</span>
              <span className="text-[8px] text-white/30 uppercase tracking-wider">Score</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-2xl font-bold ${isGo ? "text-emerald-400" : "text-red-400"}`}>{report.recommendation}</span>
              <span className="px-2 py-0.5 rounded-full bg-white/5 text-xs font-bold text-white/60">Grade: {report.grade}</span>
            </div>
            <p className="text-xs text-white/40">{report.passed_checks}/{report.total_checks} checks passed · {report.e2e_passed}/{report.e2e_total} E2E scenarios passed</p>
            <p className="text-[10px] text-white/30 mt-2">Certification Date: {new Date(report.date).toLocaleString()} · Version {report.version}</p>
            <p className="text-[10px] text-white/30">Reviewer: {report.reviewer}</p>
          </div>
        </div>
      </div>

      {/* Factor Scores */}
      <div>
        <h3 className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-3">Certification Factor Scores</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(report.factor_scores).map(([factor, score]) => {
            const color = score >= 90 ? "#10b981" : score >= 80 ? "#f59e0b" : "#ef4444";
            return (
              <div key={factor} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="text-2xl font-bold" style={{ color }}>{score}</div>
                <div className="text-[10px] text-white/30 mt-1">{factor}</div>
                <div className="w-full h-1 rounded-full bg-white/5 mt-2 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CHECK LIST (reusable)
// ============================================================
function CheckList({ title, checks }) {
  const passed = checks.filter((c) => c.status === "pass").length;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/70">{title}</h3>
        <span className={`text-xs font-bold ${passed === checks.length ? "text-emerald-400" : "text-amber-400"}`}>{passed}/{checks.length} Passed</span>
      </div>
      <div className="space-y-1.5">
        {checks.map((check, i) => {
          const status = STATUS_ICON[check.status] || STATUS_ICON.warn;
          const Icon = status.icon;
          return (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <Icon size={14} className={`mt-0.5 shrink-0 ${status.color}`} />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white/70 font-medium">{check.name}</div>
                {check.details && <div className="text-[10px] text-white/30 mt-0.5">{check.details}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// E2E TAB
// ============================================================
function E2ETab({ tests }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white/70">End-to-End Test Scenarios</h3>
      <div className="space-y-4">
        {tests.map((test, i) => (
          <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              {test.passed ? <CheckCircle2 size={14} className="text-emerald-400" /> : <XCircle size={14} className="text-red-400" />}
              <span className="text-xs font-medium text-white/70">{test.scenario}</span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full ${test.passed ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>{test.passed ? "PASSED" : "FAILED"}</span>
            </div>
            <div className="space-y-1">
              {test.steps.map((step, j) => {
                const status = STATUS_ICON[step.status] || STATUS_ICON.warn;
                const Icon = status.icon;
                return (
                  <div key={j} className="flex items-center gap-2 text-[10px]">
                    <Icon size={11} className={status.color} />
                    <span className="text-white/50">{step.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// PERFORMANCE TAB
// ============================================================
function PerformanceTab({ metrics }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white/70">Performance Certification</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {metrics.map((m, i) => {
          const color = m.status === "pass" ? "#10b981" : m.status === "warn" ? "#f59e0b" : "#ef4444";
          return (
            <div key={i} className="p-3 rounded-lg bg-white/[0.02] border border-white/5 text-center">
              <div className="text-lg font-bold" style={{ color }}>{m.value}</div>
              <div className="text-[9px] text-white/30 mt-1">{m.name}</div>
              <div className="text-[8px]" style={{ color }}>{m.details}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// GO / NO-GO TAB
// ============================================================
function GoNoGoTab({ goNoGo, report }) {
  const isGo = goNoGo.recommendation === "GO";
  return (
    <div className="space-y-4">
      <div className={`p-6 rounded-2xl border text-center ${isGo ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}>
        <Award size={32} className={isGo ? "text-emerald-400 mx-auto mb-2" : "text-red-400 mx-auto mb-2"} />
        <div className={`text-3xl font-bold ${isGo ? "text-emerald-400" : "text-red-400"}`}>{goNoGo.recommendation}</div>
        <p className="text-xs text-white/40 mt-2">Overall Recommendation · Grade {report.grade} · Score {report.score}/100</p>
      </div>

      <div className="space-y-2">
        <h3 className="text-[10px] font-medium text-white/40 uppercase tracking-wider">Checklist</h3>
        {goNoGo.categories.map((cat, i) => {
          const Icon = cat.status === "pass" ? CheckCircle2 : XCircle;
          const color = cat.status === "pass" ? "text-emerald-400" : "text-red-400";
          return (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <Icon size={14} className={color} />
              <div className="flex-1">
                <span className="text-xs text-white/70 font-medium">{cat.category}</span>
                <span className="text-[10px] text-white/30 ml-2">{cat.details}</span>
              </div>
              <span className={`text-[9px] px-2 py-0.5 rounded-full ${cat.status === "pass" ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>{cat.status === "pass" ? "PASS" : "FAIL"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}