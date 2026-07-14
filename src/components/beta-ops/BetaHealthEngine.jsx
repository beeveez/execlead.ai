import React from "react";
import { Activity, GraduationCap, Bug, Heart, Brain, TrendingUp, AlertCircle, UserX, Trophy } from "lucide-react";
import { Panel, StatCard, BarRow, HealthRing, Empty } from "./Shared";

export default function BetaHealthEngine({ data }) {
  if (!data) return null;
  const { dashboard, atRiskUsers, recommendations } = data;
  const d = dashboard;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 flex items-center gap-4">
          <HealthRing score={d.betaHealthScore} label="Overall Beta Health™" />
          <div className="space-y-1">
            <div className="text-xs text-white/40">Composite of 6 pillars:</div>
            <div className="text-[10px] text-white/30">Engagement · Learning · Activity · Feedback · Retention · AI Usage</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Activity} label="Engagement" value={`${d.engagementScore}%`} color="indigo" />
          <StatCard icon={GraduationCap} label="Learning" value={`${d.learningScore}%`} color="emerald" />
          <StatCard icon={TrendingUp} label="Activity" value={`${d.activityScore}%`} color="blue" />
          <StatCard icon={Heart} label="Retention" value={`${d.retentionScore}%`} color="purple" />
          <StatCard icon={Bug} label="Feedback" value={`${d.feedbackScore}%`} color="cyan" />
          <StatCard icon={Brain} label="AI Usage" value={`${d.aiUsageScore}%`} color="amber" />
        </div>
      </div>

      <Panel title="Pillar Breakdown" icon={Activity}>
        <div className="space-y-2">
          <BarRow label="Engagement (MAU / Activated)" value={d.engagementScore} max={100} color="bg-indigo-500/60" />
          <BarRow label="Learning (Lesson Completion)" value={d.learningScore} max={100} color="bg-emerald-500/60" />
          <BarRow label="Activity (Events per User)" value={d.activityScore} max={100} color="bg-blue-500/60" />
          <BarRow label="Feedback (Volume)" value={d.feedbackScore} max={100} color="bg-cyan-500/60" />
          <BarRow label="Retention (Active / Activated)" value={d.retentionScore} max={100} color="bg-purple-500/60" />
          <BarRow label="AI Usage (Sessions per User)" value={d.aiUsageScore} max={100} color="bg-amber-500/60" />
        </div>
      </Panel>

      <Panel title="At-Risk Beta Users" icon={UserX}>
        {atRiskUsers.length === 0 ? (
          <Empty text="No at-risk users detected — all beta users are engaged." />
        ) : (
          <div className="space-y-2">
            {atRiskUsers.slice(0, 20).map((u) => (
              <div key={u.id} className="flex items-center gap-3 bg-white/[0.02] rounded-lg px-3 py-2">
                <UserX size={14} className="text-amber-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/80">{u.full_name}</div>
                  <div className="text-[10px] text-white/30">{u.email} · {u.eventCount} events</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-white/30">Health</div>
                  <div className="text-xs font-bold" style={{ color: u.healthScore >= 40 ? "#f59e0b" : "#ef4444" }}>{u.healthScore}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Health Recommendations" icon={AlertCircle}>
        {recommendations.length === 0 ? (
          <Empty text="No recommendations — beta health is stable." />
        ) : (
          <div className="space-y-2">
            {recommendations.map((r, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/[0.02] rounded-lg p-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                  {r.type === "re_engage" ? <UserX size={13} className="text-amber-400" /> : r.type === "graduate" ? <Trophy size={13} className="text-emerald-400" /> : <AlertCircle size={13} className="text-indigo-400" />}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-white/80 font-medium">{r.title}</div>
                  <div className="text-[10px] text-white/40 mt-0.5">{r.detail}</div>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ color: r.priority === "P0" ? "#ef4444" : r.priority === "P1" ? "#f59e0b" : "#3b82f6", backgroundColor: r.priority === "P0" ? "#ef44441a" : r.priority === "P1" ? "#f59e0b1a" : "#3b82f61a" }}>{r.priority}</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}