import React from "react";
import { computeAnalytics } from "@/lib/featureFlagEngine";
import { SectionCard, StatCard, ProgressBar, EmptyState } from "./Shared";
import { BarChart3, TrendingUp, AlertCircle, Activity } from "lucide-react";

export default function FlagAnalytics({ flags }) {
  const analytics = computeAnalytics(flags);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Adoption" value={analytics.totalAdoption.toLocaleString()} sublabel="Users across all flags" color="emerald" />
        <StatCard label="Total Usage" value={analytics.totalUsage.toLocaleString()} sublabel="Usage events" color="indigo" />
        <StatCard label="Total Errors" value={analytics.totalErrors} sublabel="Across all flags" color="red" />
        <StatCard label="Avg Success Rate" value={`${analytics.avgSuccess}%`} sublabel="Rollout success" color="amber" />
      </div>

      <SectionCard title="Top Features by Adoption" icon={TrendingUp}>
        {analytics.topAdoption.length === 0 ? (
          <EmptyState label="No adoption data yet." />
        ) : (
          <div className="space-y-2">
            {analytics.topAdoption.map((flag, idx) => {
              const maxAdoption = analytics.topAdoption[0]?.adoption_count || 1;
              const pct = Math.round((flag.adoption_count / maxAdoption) * 100);
              return (
                <div key={flag.id} className="flex items-center gap-3">
                  <span className="text-xs text-white/30 w-4">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm text-white/70 truncate">{flag.name}</span>
                      <span className="text-xs font-bold text-white/60 ml-2">{(flag.adoption_count || 0).toLocaleString()}</span>
                    </div>
                    <ProgressBar value={pct} color="emerald" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Features with Errors" icon={AlertCircle}>
        {analytics.errorFlags.length === 0 ? (
          <EmptyState label="No errors detected. All features healthy." />
        ) : (
          <div className="space-y-2">
            {analytics.errorFlags.map((flag) => (
              <div key={flag.id} className="flex items-center gap-3 py-2 px-3 rounded-lg border border-red-500/10 bg-red-500/[0.02]">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-white/70">{flag.name}</span>
                  <span className="text-[10px] text-white/30 ml-2">{flag.flag_key}</span>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-red-400">{flag.error_count}</div>
                  <div className="text-[10px] text-white/30">errors</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}