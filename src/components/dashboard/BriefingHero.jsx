import React from "react";
import { Sparkles, TrendingUp, Clock } from "lucide-react";

function Metric({ label, value }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-lg px-3 py-2">
      <div className="text-white/30 text-[10px] uppercase tracking-wider">{label}</div>
      <div className="text-white font-bold text-sm mt-0.5">{value}</div>
    </div>
  );
}

export default function BriefingHero({ data, profile }) {
  if (!data) return null;
  return (
    <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/15 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-indigo-400 text-xs uppercase tracking-widest">
          <Sparkles size={12} /> EXEC™ Daily Briefing™
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-white/40"><TrendingUp size={10} /> Confidence: <span className="text-white font-bold">{data.confidence || 0}%</span></span>
          <span className="flex items-center gap-1 text-white/40"><Clock size={10} /> ~{Math.ceil((data.readingTimeSeconds || 30) / 60)} min</span>
        </div>
      </div>
      <h2 className="text-xl font-bold text-white mb-2">{data.greeting}</h2>
      <p className="text-white/60 text-sm leading-relaxed mb-4">{data.executiveSummary}</p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
        <Metric label="Level" value={data.leadershipLevel || "—"} />
        <Metric label="Journey" value={(data.journeyProgress || 0).toLocaleString()} />
        <Metric label="Readiness" value={`${data.executiveReadiness || 0}%`} />
        <Metric label="Promotion" value={`${data.promotionProbability || 0}%`} />
        <Metric label="Streak" value={data.currentStreak || 0} />
      </div>
      {data.leadershipDNAInsight && <p className="text-white/50 text-sm mb-2">📊 {data.leadershipDNAInsight}</p>}
      {data.promotionChange && <p className="text-emerald-400 text-sm mb-3">📈 {data.promotionChange}</p>}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Today's Recommendation</p>
        <p className="text-white font-medium text-sm mb-1">{data.todaysRecommendation}</p>
        <p className="text-white/40 text-xs mb-2">{data.recommendationReason}</p>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-indigo-400 font-medium">+{data.expectedJourneyGain || 0} Journey</span>
          <span className="text-emerald-400 font-medium">+{data.expectedReadinessGain || 0} Readiness</span>
        </div>
      </div>
    </div>
  );
}