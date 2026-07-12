import React, { useMemo } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Heart, TrendingUp, TrendingDown, Minus } from "lucide-react";

function getHealthTrend(userId, currentScore) {
  const key = `exec_health_${userId}`;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const lastWeek = new Date(Date.now() - 604800000).toDateString();
  let history = {};
  try { history = JSON.parse(localStorage.getItem(key)) || {}; } catch {}
  history[today] = currentScore;
  try { localStorage.setItem(key, JSON.stringify(history)); } catch {}
  const y = history[yesterday];
  const w = history[lastWeek];
  return {
    yesterday: y != null ? currentScore - y : null,
    lastWeek: w != null ? currentScore - w : null,
    direction: y != null ? (currentScore > y ? "up" : currentScore < y ? "down" : "stable") : "stable",
  };
}

export default function ExecutiveHealth({ profile }) {
  const { user } = useAuth();
  const { dimensions, score, trend } = useMemo(() => {
    const dims = [
      { name: "Leadership", value: profile?.leadership_maturity || 0, weight: 15, color: "text-violet-400", bar: "bg-violet-500" },
      { name: "Learning", value: Math.min(100, (profile?.sessions_completed || 0) * 10), weight: 10, color: "text-amber-400", bar: "bg-amber-500" },
      { name: "Commercial", value: profile?.commercial_maturity || 0, weight: 15, color: "text-cyan-400", bar: "bg-cyan-500" },
      { name: "Presence", value: profile?.executive_presence || 0, weight: 15, color: "text-emerald-400", bar: "bg-emerald-500" },
      { name: "Influence", value: profile?.confidence || 0, weight: 10, color: "text-pink-400", bar: "bg-pink-500" },
      { name: "Journey", value: Math.min(100, Math.round((profile?.cached_journey_points || 0) / 500)), weight: 10, color: "text-indigo-400", bar: "bg-indigo-500" },
      { name: "Readiness", value: profile?.cached_readiness_score || profile?.interview_readiness || 0, weight: 15, color: "text-blue-400", bar: "bg-blue-500" },
      { name: "Communication", value: profile?.communication_growth || 0, weight: 10, color: "text-orange-400", bar: "bg-orange-500" },
    ];
    const s = Math.round(dims.reduce((sum, d) => sum + (d.value * d.weight / 100), 0));
    const t = getHealthTrend(user?.id, s);
    return { dimensions: dims, score: s, trend: t };
  }, [profile, user?.id]);

  const TrendIcon = trend.direction === "up" ? TrendingUp : trend.direction === "down" ? TrendingDown : Minus;
  const trendColor = trend.direction === "up" ? "text-emerald-400" : trend.direction === "down" ? "text-rose-400" : "text-white/30";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Heart size={14} className="text-rose-400" />
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Executive Health™</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-white">{score}</span>
          <span className="text-white/30 text-xs">/100</span>
          <TrendIcon size={14} className={trendColor} />
        </div>
      </div>
      <div className="space-y-2">
        {dimensions.map((d) => (
          <div key={d.name} className="flex items-center gap-3">
            <span className="text-white/50 text-xs w-24 flex-shrink-0">{d.name}</span>
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className={`h-full ${d.bar} rounded-full transition-all duration-700`} style={{ width: `${d.value}%` }} />
            </div>
            <span className={`text-xs font-medium w-8 text-right ${d.color}`}>{d.value}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5 text-xs">
        <span className="text-white/30">vs yesterday: <span className={trend.yesterday != null ? (trend.yesterday > 0 ? "text-emerald-400" : trend.yesterday < 0 ? "text-rose-400" : "text-white/50") : "text-white/20"}>{trend.yesterday != null ? `${trend.yesterday > 0 ? "+" : ""}${trend.yesterday}` : "—"}</span></span>
        <span className="text-white/30">vs last week: <span className={trend.lastWeek != null ? (trend.lastWeek > 0 ? "text-emerald-400" : trend.lastWeek < 0 ? "text-rose-400" : "text-white/50") : "text-white/20"}>{trend.lastWeek != null ? `${trend.lastWeek > 0 ? "+" : ""}${trend.lastWeek}` : "—"}</span></span>
      </div>
    </div>
  );
}