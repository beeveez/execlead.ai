import React from "react";
import { TrendingUp, Users, Activity, Heart, Gift, Award, Zap, Target } from "lucide-react";
import { SectionCard, StatCard, EmptyState, STAGE_COLORS } from "./Shared";
import { LIFECYCLE_STAGES } from "@/lib/customerLifecycleEngine";

export default function JourneyAnalytics({ data }) {
  const { journeyAnalytics: ja } = data;
  if (!ja) return <EmptyState />;

  const metrics = [
    { label: "Acquisition", value: ja.acquisition, icon: Users, accent: "indigo", desc: "Applicants + Reviewed + Invited" },
    { label: "Activation", value: ja.activation, icon: Zap, accent: "purple", desc: "Activated accounts" },
    { label: "Engagement", value: ja.engagement, icon: Activity, accent: "emerald", desc: "Active + Power Users" },
    { label: "Retention", value: ja.retention, icon: Heart, accent: "amber", desc: "Champions + Enterprise Advocates" },
    { label: "Expansion", value: ja.expansion, icon: TrendingUp, accent: "cyan", desc: "Champions + Advocates + Renewals" },
    { label: "Referrals", value: ja.referralCount, icon: Gift, accent: "purple", desc: "Total referrals made" },
    { label: "Graduation", value: ja.graduation, icon: Award, accent: "amber", desc: "Alumni + Champions" },
    { label: "Total Customers", value: ja.totalCustomers, icon: Target, accent: "indigo", desc: "All tracked customers" },
  ];

  const maxFunnel = Math.max(...ja.funnel.map((f) => f.count), 1);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((m) => (
          <StatCard key={m.label} label={m.label} value={m.value} sublabel={m.desc} icon={m.icon} accent={m.accent} />
        ))}
      </div>

      <SectionCard title="Conversion Funnel™" icon={TrendingUp}>
        <div className="space-y-2">
          {ja.funnel.map((stage, i) => {
            const widthPct = (stage.count / maxFunnel) * 100;
            const stageInfo = LIFECYCLE_STAGES[i];
            return (
              <div key={stage.stage}>
                <div className="flex items-center gap-3">
                  <div className="w-32 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STAGE_COLORS[stage.stage] }} />
                      <span className="text-white/70 text-xs">{stage.label}</span>
                    </div>
                  </div>
                  <div className="flex-1 relative h-7 bg-white/5 rounded-lg overflow-hidden">
                    <div className="h-full rounded-lg transition-all duration-500 flex items-center justify-between px-2"
                      style={{ width: `${Math.max(widthPct, stage.count > 0 ? 12 : 0)}%`, backgroundColor: STAGE_COLORS[stage.stage] + "25", borderLeft: `3px solid ${STAGE_COLORS[stage.stage]}` }}>
                      <span className="text-white text-xs font-medium">{stage.count}</span>
                    </div>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-3">
                      <span className="text-emerald-400 text-xs">{stage.conversion}%</span>
                      <span className="text-rose-400 text-xs">↓{stage.dropoff}%</span>
                    </div>
                  </div>
                </div>
                {i < ja.funnel.length - 1 && (
                  <div className="ml-16 text-white/20 text-xs py-0.5">
                    ↓ {stage.conversion}% conversion · {stage.dropoff}% drop-off
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      <div className="grid md:grid-cols-2 gap-4">
        <SectionCard title="Conversion Rates" icon={Activity}>
          <div className="space-y-2">
            {ja.funnel.slice(1).map((stage, i) => (
              <div key={i} className="flex items-center justify-between bg-white/5 rounded px-3 py-2">
                <span className="text-white/60 text-xs">{LIFECYCLE_STAGES[i].label} → {stage.label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${stage.conversion}%`, backgroundColor: STAGE_COLORS[stage.stage] }} />
                  </div>
                  <span className="text-white/70 text-xs w-10 text-right">{stage.conversion}%</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Drop-off Analysis" icon={TrendingUp}>
          <div className="space-y-2">
            {ja.funnel.filter((s) => s.dropoff > 0).map((stage, i) => (
              <div key={i} className="flex items-center justify-between bg-white/5 rounded px-3 py-2">
                <span className="text-white/60 text-xs">{stage.label}</span>
                <span className="text-rose-400 text-xs font-medium">-{stage.dropoff}%</span>
              </div>
            ))}
            {ja.funnel.every((s) => s.dropoff === 0) && <EmptyState message="No drop-off detected" />}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}