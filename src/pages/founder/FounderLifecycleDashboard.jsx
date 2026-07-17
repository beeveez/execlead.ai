import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import {
  Loader2, Activity, Users, TrendingUp, Heart, Shield, Zap,
  CheckCircle2, XCircle, AlertTriangle, Clock, GitBranch,
  Gauge, BarChart3, Award, Rocket,
} from "lucide-react";
import { LIFECYCLE_STAGES, getStage } from "@/lib/founderLifecycleEngine";
import { HEALTH_STATUSES } from "@/lib/founderHealthEngine";
import { computeLifecycleReadiness } from "@/lib/founderLifecycleReadinessEngine";

export default function FounderLifecycleDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [workflowStats, setWorkflowStats] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const load = useCallback(async () => {
    try {
      const [analyticsRes, workflowRes, readinessRes] = await Promise.all([
        base44.functions.invoke("manageFoundingProgram", { action: "get_executive_analytics" }),
        base44.functions.invoke("manageFoundingProgram", { action: "get_workflow_stats" }),
        computeLifecycleReadiness(),
      ]);
      setAnalytics(analyticsRes.data);
      setWorkflowStats(workflowRes.data);
      setReadiness(readinessRes);
    } catch (e) {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
      </div>
    );
  }

  const s = analytics?.summary || {};
  const health = analytics?.health || {};
  const lifecycle = analytics?.lifecycle || [];
  const wf = workflowStats || {};

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <GitBranch size={12} className="text-amber-400" /> Founding Member Lifecycle Engine™
        </div>
        <h1 className="text-2xl font-bold text-white">Lifecycle Management Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Enterprise lifecycle, workflow orchestration, health scoring, and observability.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} icon={BarChart3} label="Overview" />
        <TabButton active={activeTab === "lifecycle"} onClick={() => setActiveTab("lifecycle")} icon={GitBranch} label="Lifecycle Stages" />
        <TabButton active={activeTab === "workflows"} onClick={() => setActiveTab("workflows")} icon={Zap} label="Workflow Observability" />
        <TabButton active={activeTab === "health"} onClick={() => setActiveTab("health")} icon={Heart} label="Health Scores" />
        <TabButton active={activeTab === "readiness"} onClick={() => setActiveTab("readiness")} icon={Shield} label="Readiness Report" />
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Executive KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <KPI icon={Users} label="Total Founders" value={s.totalFounders || 0} color="amber" />
            <KPI icon={CheckCircle2} label="Active" value={s.activeFounders || 0} color="emerald" />
            <KPI icon={TrendingUp} label="Activation Rate" value={`${s.activationRate || 0}%`} color="indigo" />
            <KPI icon={Activity} label="Weekly Active" value={s.weeklyActive || 0} color="purple" />
            <KPI icon={Clock} label="Retention" value={`${s.retentionRate || 0}%`} color="emerald" />
            <KPI icon={Award} label="Advisory Circle" value={s.advisoryParticipation || 0} color="amber" />
          </div>

          {/* Growth Chart */}
          {analytics?.growth?.length > 0 && (
            <Card title="Founder Growth" icon={TrendingUp}>
              <div className="flex items-end gap-1 h-32">
                {analytics.growth.slice(-12).map((g, i) => {
                  const max = Math.max(...analytics.growth.map((x) => x.count), 1);
                  const h = Math.max(4, (g.count / max) * 100);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="text-[10px] text-white/40">{g.count}</div>
                      <div className="w-full bg-amber-500/20 rounded-t" style={{ height: `${h}%` }} />
                      <div className="text-[8px] text-white/20">{g.month.slice(5)}</div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Feedback & Satisfaction */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KPI icon={Zap} label="Feedback Velocity" value={`${s.feedbackVelocity || 0}/mo`} color="indigo" />
            <KPI icon={CheckCircle2} label="Bug Resolution" value={`${s.bugResolutionRate || 0}%`} color="emerald" />
            <KPI icon={TrendingUp} label="Idea Acceptance" value={`${s.ideaAcceptanceRate || 0}%`} color="amber" />
            <KPI icon={Heart} label="Satisfaction (NPS)" value={s.avgSatisfaction || 0} color="purple" />
          </div>
        </div>
      )}

      {/* Lifecycle Stages Tab */}
      {activeTab === "lifecycle" && (
        <div className="space-y-4">
          <Card title="Lifecycle Stage Pipeline" icon={GitBranch}>
            <div className="space-y-2">
              {LIFECYCLE_STAGES.map((stage, i) => {
                const count = lifecycle.find((l) => l.stage === stage.id)?.count || 0;
                const total = s.totalFounders || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={stage.id} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0" style={{ backgroundColor: `${stage.color}20`, color: stage.color }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white/70 text-sm font-medium">{stage.label}</span>
                        <span className="text-white/40 text-xs">{count} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: stage.color }} />
                      </div>
                    </div>
                    <div className="text-[10px] text-white/30 w-12 text-right shrink-0">{stage.progress}%</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Workflow Observability Tab */}
      {activeTab === "workflows" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <KPI icon={CheckCircle2} label="Completed" value={wf.completed || 0} color="emerald" />
            <KPI icon={XCircle} label="Failed" value={wf.failed || 0} color="red" />
            <KPI icon={Loader2} label="Running" value={wf.running || 0} color="amber" />
            <KPI icon={AlertTriangle} label="Retrying" value={wf.retrying || 0} color="amber" />
            <KPI icon={Gauge} label="Health" value={`${wf.healthPercentage || 100}%`} color={wf.healthPercentage >= 90 ? "emerald" : wf.healthPercentage >= 70 ? "amber" : "red"} />
          </div>

          <Card title="Workflow Metrics" icon={Activity}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <Metric label="Total Workflows" value={wf.total || 0} />
              <Metric label="Failure Rate" value={`${wf.failureRate || 0}%`} />
              <Metric label="Avg Duration" value={`${wf.avgDurationMs || 0}ms`} />
              <Metric label="Dead Letter Queue" value={wf.deadLetter || 0} />
              <Metric label="Idempotency Protected" value="✓" />
              <Metric label="Retry Engine" value="3 attempts, exponential backoff" />
            </div>
          </Card>

          {wf.byType?.length > 0 && (
            <Card title="Workflows by Type" icon={Zap}>
              <div className="space-y-2">
                {wf.byType.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="text-white/70 flex-1 truncate">{t.type.replace(/_/g, " ")}</span>
                    <span className="text-white/30 text-xs">{t.completed}/{t.total}</span>
                    <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${t.successRate >= 90 ? "bg-emerald-500" : t.successRate >= 50 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${t.successRate}%` }} />
                    </div>
                    <span className="text-white/40 text-xs w-10 text-right">{t.successRate}%</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Health Tab */}
      {activeTab === "health" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {HEALTH_STATUSES.map((h) => {
              const count = health[h.id] || 0;
              return (
                <div key={h.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-5 text-center">
                  <div className="text-3xl mb-2">{h.icon}</div>
                  <div className="text-2xl font-bold" style={{ color: h.color }}>{count}</div>
                  <div className="text-white/40 text-xs mt-1">{h.label}</div>
                </div>
              );
            })}
          </div>

          <Card title="Health Score Methodology" icon={Heart}>
            <div className="space-y-2 text-xs text-white/50">
              <p><span className="text-white/70 font-medium">Healthy (70+):</span> Actively engaging with the platform, submitting feedback, using AI sessions.</p>
              <p><span className="text-white/70 font-medium">At Risk (30-69):</span> Reduced activity. Recommend feature spotlights and coach session invitations.</p>
              <p><span className="text-white/70 font-medium">Inactive (0-29):</span> No recent activity. Trigger re-engagement email and assign success contact.</p>
              <div className="mt-3 pt-3 border-t border-white/5">
                <p className="text-white/40">Weighted from: Activity (25%), AI Sessions (20%), Feedback (15%), Feature Adoption (15%), Community (15%), Votes (10%)</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Readiness Report Tab */}
      {activeTab === "readiness" && readiness && (
        <div className="space-y-4">
          {/* Overall Score */}
          <div className={`rounded-xl p-6 text-center border ${readiness.recommendation === "PASS" ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}>
            <div className="text-white/30 text-xs uppercase tracking-widest mb-2">Enterprise Readiness</div>
            <div className={`text-5xl font-bold mb-2 ${readiness.recommendation === "PASS" ? "text-emerald-400" : "text-red-400"}`}>
              {readiness.enterpriseScore}
            </div>
            <div className={`text-lg font-medium ${readiness.recommendation === "PASS" ? "text-emerald-400" : "text-red-400"}`}>
              {readiness.recommendation}
            </div>
            <div className="text-white/30 text-xs mt-2">{readiness.implementationPct}% implementation ({readiness.passed}/{readiness.total} requirements)</div>
          </div>

          {/* Category Scores */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <ScoreCard label="Architecture" score={readiness.architectureScore} icon={GitBranch} />
            <ScoreCard label="Automation" score={readiness.automationScore} icon={Zap} />
            <ScoreCard label="Security" score={readiness.securityScore} icon={Shield} />
            <ScoreCard label="Scalability" score={readiness.scalabilityScore} icon={TrendingUp} />
            <ScoreCard label="Observability" score={readiness.observabilityScore} icon={Activity} />
            <ScoreCard label="GA Readiness" score={readiness.gaReadiness} icon={Rocket} />
          </div>

          {/* Missing Components */}
          {readiness.missingComponents.length > 0 ? (
            <Card title={`Missing Components (${readiness.missingComponents.length})`} icon={AlertTriangle}>
              <div className="space-y-2">
                {readiness.missingComponents.map((m, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <XCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-white/70 font-medium">{m.label}</span>
                      <span className="text-white/30 ml-2">· {m.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 text-center">
              <CheckCircle2 size={24} className="text-emerald-400 mx-auto mb-2" />
              <p className="text-emerald-400 text-sm font-medium">All components implemented — zero technical debt</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
        active ? "bg-amber-500/15 text-amber-400" : "text-white/40 hover:text-white/70 hover:bg-white/5"
      }`}
    >
      <Icon size={14} /> {label}
    </button>
  );
}

function KPI({ icon: Icon, label, value, color }) {
  const colors = {
    amber: "text-amber-400 bg-amber-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10",
    indigo: "text-indigo-400 bg-indigo-500/10",
    purple: "text-purple-400 bg-purple-500/10",
    red: "text-red-400 bg-red-500/10",
  };
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${colors[color]}`}>
        <Icon size={16} />
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-white/30 text-xs mt-0.5">{label}</div>
    </div>
  );
}

function Card({ title, icon: Icon, children }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <h3 className="flex items-center gap-2 text-white font-semibold text-sm mb-4">
        <Icon size={14} className="text-amber-400" /> {title}
      </h3>
      {children}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <div className="text-white/30 text-xs uppercase tracking-wider mb-1">{label}</div>
      <div className="text-white/80">{value}</div>
    </div>
  );
}

function ScoreCard({ label, score, icon: Icon }) {
  const color = score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} style={{ color }} />
        <span className="text-white/50 text-xs">{label}</span>
      </div>
      <div className="text-2xl font-bold" style={{ color }}>{score}</div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}