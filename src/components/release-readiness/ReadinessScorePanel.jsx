import React from "react";
import { READINESS_DOMAINS, computeOverallScore } from "@/lib/releaseReadinessEngine";
import { ScoreRing, StatusBadge, SectionCard, StatCard, ProgressBar } from "./Shared";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function ReadinessScorePanel() {
  const overallScore = computeOverallScore();
  const totalWeight = READINESS_DOMAINS.reduce((s, d) => s + d.weight, 0);
  const onTrack = READINESS_DOMAINS.filter((d) => d.status === "on_track").length;
  const atRisk = READINESS_DOMAINS.filter((d) => d.status === "at_risk").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 flex flex-col items-center justify-center">
          <ScoreRing score={overallScore} size={140} label="Readiness" />
          <p className="text-xs text-white/50 mt-3 text-center">
            Weighted aggregate of {READINESS_DOMAINS.length} readiness domains
          </p>
        </div>
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Domains" value={READINESS_DOMAINS.length} sublabel={`Total weight: ${totalWeight}`} color="indigo" />
          <StatCard label="On Track" value={onTrack} sublabel="Meeting targets" color="emerald" />
          <StatCard label="At Risk" value={atRisk} sublabel="Needs attention" color="amber" />
          <StatCard
            label="Avg Score"
            value={Math.round(READINESS_DOMAINS.reduce((s, d) => s + d.score, 0) / READINESS_DOMAINS.length)}
            sublabel="Unweighted average"
            color="white"
          />
        </div>
      </div>

      <SectionCard title="Readiness Domains" icon={TrendingUp}>
        <div className="space-y-2">
          {READINESS_DOMAINS.map((domain) => (
            <DomainRow key={domain.id} domain={domain} />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function DomainRow({ domain }) {
  const scoreColor = domain.score >= 85 ? "emerald" : domain.score >= 70 ? "amber" : "red";
  const TrendIcon = domain.trend === "up" ? TrendingUp : domain.trend === "down" ? TrendingDown : Minus;
  const trendColor = domain.trend === "up" ? "text-emerald-400" : domain.trend === "down" ? "text-red-400" : "text-white/30";

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/[0.02] transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white truncate">{domain.name}</span>
          <StatusBadge status={domain.status} />
        </div>
        <p className="text-xs text-white/40 mt-0.5 truncate">{domain.summary}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-20 hidden sm:block">
          <ProgressBar value={domain.score} color={scoreColor} />
        </div>
        <span className="text-sm font-bold text-white w-8 text-right">{domain.score}</span>
        <span className="text-[10px] text-white/30 w-8">/{domain.weight}w</span>
        <TrendIcon className={`w-3.5 h-3.5 ${trendColor} shrink-0`} />
      </div>
    </div>
  );
}