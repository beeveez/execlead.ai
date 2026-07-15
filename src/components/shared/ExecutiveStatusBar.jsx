import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { getLatestForecast } from "@/lib/promotionForecastEngine";
import { getBriefingForPeriod, getWeeklyPeriod } from "@/lib/executiveBriefingEngine";
import { getJourneyStage } from "@/lib/brandExperience";
import { TrendingUp, Activity, Compass, Target, FileText } from "lucide-react";

const MOMENTUM_LABELS = {
  increasing: { label: "Increasing", color: "text-emerald-400" },
  stable: { label: "Stable", color: "text-white/60" },
  declining: { label: "Declining", color: "text-rose-400" },
};

export default function ExecutiveStatusBar() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const [forecast, briefing] = await Promise.all([
          getLatestForecast(user.id),
          getBriefingForPeriod(user.id, getWeeklyPeriod()),
        ]);
        const readiness = forecast?.readiness_score || 0;
        const xp = readiness * 10;
        const stageInfo = getJourneyStage(xp);
        if (!cancelled) {
          setData({
            readiness,
            momentum: forecast?.momentum || "stable",
            stage: stageInfo?.current?.title || "Seed",
            targetLevel: forecast?.target_level || "—",
            briefingAvailable: !!briefing,
          });
        }
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  if (loading) {
    return <div className="bg-white/[0.02] border border-white/5 rounded-xl px-5 py-3 animate-pulse h-16" />;
  }
  if (!data) return null;

  const mom = MOMENTUM_LABELS[data.momentum] || MOMENTUM_LABELS.stable;

  const metrics = [
    { icon: TrendingUp, label: "Readiness", value: `${data.readiness}%`, color: "text-indigo-400" },
    { icon: Activity, label: "Momentum", value: mom.label, color: mom.color },
    { icon: Compass, label: "Journey Stage", value: data.stage, color: "text-violet-400" },
    { icon: Target, label: "Objective", value: data.targetLevel, color: "text-amber-400" },
    { icon: FileText, label: "Briefing", value: data.briefingAvailable ? "Ready" : "—", color: data.briefingAvailable ? "text-emerald-400" : "text-white/40" },
  ];

  return (
    <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-5 py-3 flex-wrap">
      {metrics.map((m, i) => (
        <React.Fragment key={m.label}>
          {i > 0 && <div className="w-px h-8 bg-white/5 hidden sm:block" />}
          <div className="flex items-center gap-2">
            <m.icon size={14} className={m.color} />
            <div>
              <div className="text-[9px] text-white/30 uppercase tracking-wider leading-none mb-0.5">{m.label}</div>
              <div className="text-sm font-semibold text-white leading-none">{m.value}</div>
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}