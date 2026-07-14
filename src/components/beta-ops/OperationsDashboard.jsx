import React from "react";
import { Users, UserCheck, UserX, Mail, Activity, GraduationCap, Star, Bug, Lightbulb, Heart, TrendingUp, Gauge } from "lucide-react";
import { StatCard, Panel, FunnelRow, HealthRing, BarRow, Empty } from "./Shared";

export default function OperationsDashboard({ data }) {
  if (!data) return null;
  const { dashboard, recommendations } = data;
  const d = dashboard;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6 bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <HealthRing score={d.betaHealthScore} label="Beta Health Score™" />
        <div className="flex-1">
          <h2 className="text-lg font-bold text-white">Founding Private Beta Operations</h2>
          <p className="text-white/40 text-sm mt-1">
            {d.activated} activated users · {d.monthlyActive} monthly active · NPS {d.nps || "—"} · {d.retentionRate}% retention
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-white/30 uppercase tracking-wider">Executive Satisfaction</div>
          <div className="text-2xl font-bold" style={{ color: (d.executiveSatisfaction || 0) >= 70 ? "#10b981" : "#f59e0b" }}>{d.executiveSatisfaction || "—"}%</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Applications" value={d.applicationsReceived} color="indigo" />
        <StatCard icon={Activity} label="Pending Review" value={d.pendingReview} color="amber" />
        <StatCard icon={UserCheck} label="Approved" value={d.approved} color="emerald" />
        <StatCard icon={UserX} label="Rejected" value={d.rejected} color="red" />
        <StatCard icon={Mail} label="Invited" value={d.invited} color="blue" />
        <StatCard icon={UserCheck} label="Activated" value={d.activated} color="cyan" />
        <StatCard icon={Activity} label="Daily Active" value={d.dailyActive} color="purple" />
        <StatCard icon={TrendingUp} label="Weekly Active" value={d.weeklyActive} color="purple" />
        <StatCard icon={Users} label="Monthly Active" value={d.monthlyActive} color="indigo" />
        <StatCard icon={GraduationCap} label="Completion Rate" value={`${d.completionRate}%`} color="emerald" />
        <StatCard icon={Heart} label="Retention Rate" value={`${d.retentionRate}%`} color="emerald" />
        <StatCard icon={Star} label="NPS" value={d.nps || "—"} color="amber" />
        <StatCard icon={Lightbulb} label="Feedback" value={d.feedbackReceived} color="blue" />
        <StatCard icon={Bug} label="Bug Reports" value={d.bugReports} color="red" />
        <StatCard icon={Lightbulb} label="Feature Requests" value={d.featureRequests} color="cyan" />
        <StatCard icon={Gauge} label="Health Score" value={`${d.betaHealthScore}/100`} color={d.betaHealthScore >= 70 ? "emerald" : "amber"} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Panel title="Application Funnel" icon={Users}>
          <div className="space-y-3">
            <FunnelRow label="Applications Received" value={d.applicationsReceived} total={d.applicationsReceived} color="bg-indigo-500/60" />
            <FunnelRow label="Approved" value={d.approved} total={d.applicationsReceived} color="bg-emerald-500/60" />
            <FunnelRow label="Invited" value={d.invited} total={d.applicationsReceived} color="bg-blue-500/60" />
            <FunnelRow label="Activated" value={d.activated} total={d.applicationsReceived} color="bg-cyan-500/60" />
            <FunnelRow label="Active Beta Users" value={d.monthlyActive} total={d.applicationsReceived} color="bg-purple-500/60" />
          </div>
        </Panel>

        <Panel title="Health Score Breakdown" icon={Gauge}>
          <div className="space-y-2">
            <BarRow label="Engagement" value={d.engagementScore} max={100} color="bg-indigo-500/60" />
            <BarRow label="Learning" value={d.learningScore} max={100} color="bg-emerald-500/60" />
            <BarRow label="Activity" value={d.activityScore} max={100} color="bg-blue-500/60" />
            <BarRow label="Feedback" value={d.feedbackScore} max={100} color="bg-cyan-500/60" />
            <BarRow label="Retention" value={d.retentionScore} max={100} color="bg-purple-500/60" />
            <BarRow label="AI Usage" value={d.aiUsageScore} max={100} color="bg-amber-500/60" />
          </div>
        </Panel>
      </div>

      {recommendations.length > 0 && (
        <Panel title="EXEC™ Recommendations" icon={Lightbulb}>
          <div className="space-y-2">
            {recommendations.map((r, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/[0.02] rounded-lg p-3">
                <div className="flex-1">
                  <div className="text-xs text-white/80 font-medium">{r.title}</div>
                  <div className="text-[10px] text-white/40 mt-0.5">{r.detail}</div>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ color: r.priority === "P0" ? "#ef4444" : r.priority === "P1" ? "#f59e0b" : "#3b82f6", backgroundColor: r.priority === "P0" ? "#ef44441a" : r.priority === "P1" ? "#f59e0b1a" : "#3b82f61a" }}>{r.priority}</span>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}