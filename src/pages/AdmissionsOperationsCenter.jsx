import React, { useState, useEffect, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import {
  computeOperationsSummary,
  computeQueueIntelligence,
  computeWorkload,
  generateAlerts,
  analyzeBottlenecks,
  computeHealthScore,
  validateCompliance,
} from "@/lib/admissionsOperationsEngine";
import SlaHealthPanel from "@/components/admissions-ops/SlaHealthPanel";
import QueueIntelligencePanel from "@/components/admissions-ops/QueueIntelligencePanel";
import WorkloadBalancerPanel from "@/components/admissions-ops/WorkloadBalancerPanel";
import AlertEnginePanel from "@/components/admissions-ops/AlertEnginePanel";
import BottleneckAnalysisPanel from "@/components/admissions-ops/BottleneckAnalysisPanel";
import HealthScorePanel from "@/components/admissions-ops/HealthScorePanel";
import CompliancePanel from "@/components/admissions-ops/CompliancePanel";
import ExecutiveReportPanel from "@/components/admissions-ops/ExecutiveReportPanel";
import {
  LayoutDashboard, Clock, Flame, Users, Bell, Activity, ShieldCheck, FileBarChart, Gauge,
} from "lucide-react";

const ADMIN_ROLES = ["super_admin", "platform_admin", "admin", "developer"];

const TABS = [
  { id: "command", label: "Command Center", icon: LayoutDashboard },
  { id: "sla", label: "SLA Health", icon: Clock },
  { id: "queue", label: "Queue Intelligence", icon: Flame },
  { id: "workload", label: "Workload Balancer", icon: Users },
  { id: "alerts", label: "Alert Engine", icon: Bell },
  { id: "bottlenecks", label: "Bottleneck Analysis", icon: Activity },
  { id: "health", label: "Health Score", icon: ShieldCheck },
  { id: "compliance", label: "Audit & Compliance", icon: Gauge },
  { id: "reporting", label: "Executive Reporting", icon: FileBarChart },
];

export default function AdmissionsOperationsCenter() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("command");

  useEffect(() => {
    base44.entities.BetaApplication.list("-created_date", 200)
      .then((recs) => setApplications(recs || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const metrics = useMemo(() => {
    if (!applications.length) return null;
    return {
      summary: computeOperationsSummary(applications),
      queue: computeQueueIntelligence(applications),
      workload: computeWorkload(applications),
      alerts: generateAlerts(applications),
      bottlenecks: analyzeBottlenecks(applications),
      healthScore: computeHealthScore(applications),
      compliance: validateCompliance(applications),
    };
  }, [applications]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!ADMIN_ROLES.includes(user?.role)) return <Navigate to="/home" replace />;

  if (!applications.length) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <LayoutDashboard size={32} className="text-white/20 mx-auto mb-3" />
        <p className="text-white/50 text-sm">No applications found. The Operations Center will populate once applications exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <LayoutDashboard size={12} className="text-amber-400" /> Admissions Operations
        </div>
        <h1 className="text-2xl font-bold text-white">Operations Command Center™</h1>
        <p className="text-white/40 text-sm mt-1">Enterprise admissions service management — SLA, queue intelligence, workload, health & compliance.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? "bg-amber-500/15 text-amber-400" : "text-white/40 hover:text-white/70"}`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "command" && metrics && <CommandCenter summary={metrics.summary} alerts={metrics.alerts} />}
      {activeTab === "sla" && metrics && <SlaHealthPanel slaHealth={metrics.summary.sla_health} />}
      {activeTab === "queue" && metrics && <QueueIntelligencePanel queue={metrics.queue} />}
      {activeTab === "workload" && metrics && <WorkloadBalancerPanel workload={metrics.workload} />}
      {activeTab === "alerts" && metrics && <AlertEnginePanel alerts={metrics.alerts} />}
      {activeTab === "bottlenecks" && metrics && <BottleneckAnalysisPanel bottlenecks={metrics.bottlenecks} />}
      {activeTab === "health" && metrics && <HealthScorePanel healthScore={metrics.healthScore} />}
      {activeTab === "compliance" && metrics && <CompliancePanel compliance={metrics.compliance} />}
      {activeTab === "reporting" && <ExecutiveReportPanel applications={applications} />}
    </div>
  );
}

function CommandCenter({ summary, alerts }) {
  const s = summary;
  const stats = [
    { label: "Received", value: s.received, color: "text-cyan-400" },
    { label: "Pending Review", value: s.pending_review, color: "text-amber-400" },
    { label: "Awaiting Applicant", value: s.awaiting_applicant, color: "text-orange-400" },
    { label: "Interview Scheduled", value: s.interview_scheduled, color: "text-purple-400" },
    { label: "Approved", value: s.approved, color: "text-emerald-400" },
    { label: "Invited", value: s.invited, color: "text-teal-400" },
    { label: "Activated", value: s.activated, color: "text-emerald-400" },
    { label: "Declined", value: s.declined, color: "text-red-400" },
    { label: "Waitlisted", value: s.waitlisted, color: "text-amber-400" },
  ];

  const healthScore = s.health_score;
  const scoreColor = healthScore.overall >= 80 ? "#10b981" : healthScore.overall >= 60 ? "#f59e0b" : "#ef4444";
  const criticalAlerts = alerts.filter((a) => a.severity === "critical").length;
  const highAlerts = alerts.filter((a) => a.severity === "high").length;

  return (
    <div className="space-y-5">
      {/* Top Row: Health Score + Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Health Score */}
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-4">
          <div className="relative w-20 h-20 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
              <circle cx="40" cy="40" r="34" fill="none" stroke={scoreColor} strokeWidth="5" strokeLinecap="round" strokeDasharray={2 * Math.PI * 34} strokeDashoffset={2 * Math.PI * 34 - (healthScore.overall / 100) * 2 * Math.PI * 34} className="transition-all duration-700" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold" style={{ color: scoreColor }}>{healthScore.overall}</span>
              <span className="text-[8px] text-white/30">Health</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-white/70 font-medium">Admissions Health</div>
            <div className="text-[10px] text-white/30 mt-0.5">{healthScore.factors.filter((f) => f.score >= 80).length}/7 factors on track</div>
          </div>
        </div>

        {/* SLA Compliance */}
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
          <Clock size={16} className="text-amber-400 mb-2" />
          <div className="text-lg font-bold text-white">SLA Compliance</div>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {Object.entries(s.sla_health).slice(0, 4).map(([key, sla]) => (
              <div key={key} className="text-[10px]">
                <span className="text-white/40">{sla.label.split(" ")[0]}: </span>
                <span className={sla.breached > 0 ? "text-red-400" : sla.approaching_max > 0 ? "text-amber-400" : "text-emerald-400"}>{sla.compliance_pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alert Summary */}
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
          <Bell size={16} className="text-orange-400 mb-2" />
          <div className="text-lg font-bold text-white">Active Alerts</div>
          <div className="flex items-center gap-3 mt-2">
            <div className="text-center">
              <div className="text-xl font-bold text-red-400">{criticalAlerts}</div>
              <div className="text-[9px] text-white/30">Critical</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-400">{highAlerts}</div>
              <div className="text-[9px] text-white/30">High</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white/60">{alerts.length}</div>
              <div className="text-[9px] text-white/30">Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Pipeline */}
      <div>
        <h3 className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-3">Application Pipeline</h3>
        <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
          {stats.map((stat, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
              <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-[9px] text-white/30 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Access to Health Factors */}
      <div>
        <h3 className="text-[10px] font-medium text-white/40 uppercase tracking-wider mb-3">Health Factor Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {healthScore.factors.map((factor, i) => {
            const fColor = factor.score >= 80 ? "#10b981" : factor.score >= 60 ? "#f59e0b" : "#ef4444";
            return (
              <div key={i} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-white/30">{factor.weight}</span>
                </div>
                <div className="text-base font-bold mt-0.5" style={{ color: fColor }}>{factor.score}</div>
                <div className="text-[9px] text-white/30">{factor.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}