import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function ExecutiveMomentum({ profile }) {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const events = await base44.entities.JourneyEvent.list("-created_date", 200);
        const now = Date.now();
        const weekMs = 604800000;
        const thisWeek = events.filter((e) => new Date(e.event_date || e.created_date).getTime() > now - weekMs);
        const lastWeek = events.filter((e) => {
          const t = new Date(e.event_date || e.created_date).getTime();
          return t > now - 2 * weekMs && t <= now - weekMs;
        });
        const sumPts = (arr) => arr.reduce((s, e) => s + (e.points || 0), 0);
        const cnt = (arr, cat) => arr.filter((e) => e.category === cat).length;

        const direction = (curr, prev) => curr > prev ? "up" : curr < prev ? "down" : "stable";

        setMetrics([
          { label: "Journey Points", value: sumPts(thisWeek), prev: sumPts(lastWeek), dir: direction(sumPts(thisWeek), sumPts(lastWeek)) },
          { label: "Challenges", value: cnt(thisWeek, "challenge"), prev: cnt(lastWeek, "challenge"), dir: direction(cnt(thisWeek, "challenge"), cnt(lastWeek, "challenge")) },
          { label: "Simulations", value: cnt(thisWeek, "simulation"), prev: cnt(lastWeek, "simulation"), dir: direction(cnt(thisWeek, "simulation"), cnt(lastWeek, "simulation")) },
          { label: "Learning", value: cnt(thisWeek, "learning"), prev: cnt(lastWeek, "learning"), dir: direction(cnt(thisWeek, "learning"), cnt(lastWeek, "learning")) },
          { label: "Readiness", value: profile?.cached_readiness_score || 0, prev: null, dir: "stable" },
          { label: "Promotion", value: profile?.cached_promotion_probability || 0, prev: null, dir: "stable" },
        ]);
      } catch {
        setMetrics([
          { label: "Journey Points", value: 0, prev: null, dir: "stable" },
          { label: "Challenges", value: profile?.challenges_completed || 0, prev: null, dir: "stable" },
          { label: "Simulations", value: 0, prev: null, dir: "stable" },
          { label: "Learning", value: profile?.sessions_completed || 0, prev: null, dir: "stable" },
          { label: "Readiness", value: profile?.cached_readiness_score || 0, prev: null, dir: "stable" },
          { label: "Promotion", value: profile?.cached_promotion_probability || 0, prev: null, dir: "stable" },
        ]);
      }
      setLoading(false);
    };
    load();
  }, [user?.id, profile?.id]);

  if (loading) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Activity size={14} className="text-cyan-400" />
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Executive Momentum™</h2>
        <span className="text-white/20 text-xs ml-auto">30-day</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {metrics.map((m) => {
          const Icon = m.dir === "up" ? TrendingUp : m.dir === "down" ? TrendingDown : Minus;
          const color = m.dir === "up" ? "text-emerald-400" : m.dir === "down" ? "text-rose-400" : "text-white/30";
          return (
            <div key={m.label} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white/40 text-[10px] uppercase tracking-wider truncate">{m.label}</span>
                <Icon size={12} className={color} />
              </div>
              <div className="text-white font-bold text-lg">{m.value}</div>
              {m.prev != null && m.prev > 0 && (
                <div className={`text-[10px] ${color}`}>{m.value > m.prev ? "+" : ""}{m.value - m.prev} vs last week</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}