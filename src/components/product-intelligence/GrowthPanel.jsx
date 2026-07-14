import React from "react";
import { TrendingUp, Award, Zap, Brain, Target, GraduationCap } from "lucide-react";
import { Panel, StatCard, Empty } from "./Shared";

export default function GrowthPanel({ data }) {
  if (!data) return null;
  const { growth, learning } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard icon={Award} label="Avg Reputation" value={growth.avgReputation} sub="across all members" color="purple" />
        <StatCard icon={Target} label="Avg Readiness" value={growth.avgReadiness} sub="community trust" color="indigo" />
        <StatCard icon={Brain} label="Avg Credibility" value={growth.avgExecutiveCredibility} sub="executive credibility" color="cyan" />
        <StatCard icon={Zap} label="Total XP" value={growth.totalXPEarned} sub="earned from learning" color="amber" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={GraduationCap} label="Lessons Completed" value={learning.completed} sub={`${learning.completionRate}% rate`} color="emerald" />
        <StatCard icon={Award} label="Certifications" value={learning.certified} sub="earned" color="purple" />
        <StatCard icon={TrendingUp} label="Avg Competency Gain" value={growth.avgCompetencyGain} sub="per lesson" color="indigo" />
        <StatCard icon={Brain} label="Avg Mentorship" value={growth.avgMentorship} sub="score" color="cyan" />
      </div>

      <Panel title="Leadership Progress Dimensions">
        <div className="space-y-3">
          <GrowthBar label="Executive Reputation" value={growth.avgReputation} max={1000} color="bg-purple-500/60" />
          <GrowthBar label="Community Trust / Readiness" value={growth.avgReadiness} max={100} color="bg-indigo-500/60" />
          <GrowthBar label="Executive Credibility" value={growth.avgExecutiveCredibility} max={100} color="bg-cyan-500/60" />
          <GrowthBar label="Contribution Score" value={growth.avgContribution} max={100} color="bg-emerald-500/60" />
          <GrowthBar label="Mentorship Score" value={growth.avgMentorship} max={100} color="bg-amber-500/60" />
        </div>
      </Panel>

      <Panel title="Recent Journey Events">
        {growth.recentJourney.length === 0 ? (
          <Empty text="No journey events recorded yet." />
        ) : (
          <div className="space-y-1">
            {growth.recentJourney.map((e, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-0">
                <span className="text-white/60">{e.event_type || e.action || "Event"}</span>
                <span className="text-white/30">{e.points || 0} pts</span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function GrowthBar({ label, value, max, color }) {
  const pctVal = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-white/50 text-xs w-48 truncate">{label}</span>
      <div className="flex-1 bg-white/5 rounded-full h-2.5 overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${pctVal}%` }} />
      </div>
      <span className="text-white/60 text-xs font-mono w-12 text-right">{value}</span>
    </div>
  );
}