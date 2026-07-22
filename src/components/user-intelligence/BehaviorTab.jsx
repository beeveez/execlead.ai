import React from "react";
import { Activity, Brain, Zap, Award, Cpu, BarChart3, TrendingUp } from "lucide-react";
import { StatCard, SectionCard, DistributionTable, BarChartCard, DonutChartCard, EmptyState } from "./shared";

export default function BehaviorTab({ behavior }) {
  if (!behavior) return <EmptyState />;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Brain} label="AI Conversations" value={behavior.totalAIConversations} color="#6366f1" />
        <StatCard icon={Activity} label="Total Sessions" value={behavior.totalSessions} color="#06b6d4" />
        <StatCard icon={Zap} label="Challenges Completed" value={behavior.totalChallenges} color="#f59e0b" />
        <StatCard icon={Cpu} label="AI Credits Used" value={behavior.aiCredits} color="#a855f7" />
        <StatCard icon={Award} label="Avg XP Points" value={behavior.avgXP} color="#10b981" />
        <StatCard icon={Brain} label="Avg Tokens/Call" value={behavior.avgTokensPerCall} color="#ec4899" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Feature Adoption — Module Usage" icon={BarChart3}>
          <BarChartCard data={behavior.moduleDist.slice(0, 10)} height={280} />
        </SectionCard>
        <SectionCard title="AI Provider Distribution" icon={Cpu}>
          <DonutChartCard data={behavior.providers} height={280} />
        </SectionCard>
        <SectionCard title="Most Used Features" icon={TrendingUp}>
          <DistributionTable data={behavior.mostUsed} max={5} />
        </SectionCard>
        <SectionCard title="Least Used Features" icon={Activity}>
          <DistributionTable data={behavior.leastUsed} max={5} />
        </SectionCard>
        <SectionCard title="AI Call Status" icon={Activity}>
          <DistributionTable data={behavior.statuses} max={6} />
        </SectionCard>
      </div>
    </div>
  );
}