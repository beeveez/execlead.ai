import React from "react";
import { Link } from "react-router-dom";
import { Target, Clock, TrendingUp, ArrowRight, Sparkles } from "lucide-react";

const PRIORITY_STYLES = {
  critical: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  high: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  medium: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  low: "bg-white/5 text-white/40 border-white/10",
};

export default function TodaysMissionCard({ nba, loading }) {
  if (loading) {
    return <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 animate-pulse h-44" />;
  }
  if (!nba) return null;

  const pri = PRIORITY_STYLES[nba.priority] || PRIORITY_STYLES.medium;

  return (
    <div className="bg-gradient-to-br from-amber-500/[0.06] to-orange-500/[0.03] border border-amber-500/15 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <Target size={16} className="text-amber-400" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">Today's Mission</span>
        <span className={`text-[9px] font-medium uppercase px-1.5 py-0.5 rounded border ${pri}`}>{nba.priority}</span>
        {nba.source && <span className="text-[9px] text-white/30 ml-auto">from {nba.source}</span>}
      </div>
      <h2 className="text-xl font-bold text-white mb-2">{nba.title}</h2>
      <p className="text-sm text-white/50 leading-relaxed mb-4 max-w-3xl">{nba.description}</p>
      <div className="flex items-center gap-4 text-[11px] mb-4 flex-wrap">
        <span className="flex items-center gap-1 text-white/40"><Clock size={10} /> {nba.estimatedMinutes} min</span>
        <span className="flex items-center gap-1 text-emerald-400/60"><TrendingUp size={10} /> +{nba.readinessImpact}% readiness</span>
        {nba.careerImpact && <span className="text-white/30">{nba.careerImpact}</span>}
      </div>
      <Link
        to={nba.path || "/action-center"}
        className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white text-sm font-medium rounded-lg px-5 py-2.5 transition-colors"
      >
        Begin Mission <ArrowRight size={14} />
      </Link>
    </div>
  );
}