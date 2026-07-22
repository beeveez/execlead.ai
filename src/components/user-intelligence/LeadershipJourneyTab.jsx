import React from "react";
import { TrendingUp, Award, Target, Zap } from "lucide-react";
import { StatCard, SectionCard, BarChartCard, DonutChartCard, EmptyState } from "./shared";

export default function LeadershipJourneyTab({ leadership }) {
  if (!leadership) return <EmptyState />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Zap} label="Avg Journey Points" value={leadership.avgJourneyPoints} color="#6366f1" />
        <StatCard icon={Target} label="Avg Promotion Readiness" value={`${leadership.avgPromotionReadiness}%`} color="#f59e0b" />
        <StatCard icon={Award} label="Avg Executive Readiness" value={`${leadership.avgExecutiveReadiness}%`} color="#10b981" />
        <StatCard icon={TrendingUp} label="Journey Stages" value={leadership.journeyStageDist.length} color="#06b6d4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Leadership Journey Distribution" icon={TrendingUp}>
          <BarChartCard data={leadership.journeyStageDist} height={300} />
        </SectionCard>
        <SectionCard title="Stage Breakdown" icon={Award}>
          <DonutChartCard data={leadership.journeyStageDist} height={300} />
        </SectionCard>
      </div>

      <SectionCard title="Journey Stage Details" icon={TrendingUp}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {leadership.journeyStageDist.map((stage, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{stage.count}</div>
              <div className="text-xs text-white/40 mt-1">{stage.value}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}