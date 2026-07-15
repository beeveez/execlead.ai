import React, { useState, useEffect } from "react";
import { Users, Target, AlertTriangle, Zap, TrendingUp, Calendar } from "lucide-react";
import { getJourneyAnalytics } from "@/lib/journeyOrchestratorEngine";

export default function DeveloperJourneyDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getJourneyAnalytics()
      .then((data) => { if (!cancelled) setAnalytics(data); })
      .catch(() => { if (!cancelled) setAnalytics(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-white/5 border border-white/5 rounded-2xl" />
        <div className="h-64 bg-white/5 border border-white/5 rounded-2xl" />
      </div>
    );
  }
  if (!analytics) return <div className="text-center text-white/40 py-12">Unable to load analytics.</div>;

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={Users} label="Total Users" value={analytics.totalUsers} color="text-indigo-400" />
        <KpiCard icon={TrendingUp} label="Avg Readiness" value={`${analytics.avgReadiness}%`} color="text-emerald-400" />
        <KpiCard icon={Calendar} label="Avg Timeline" value={`${analytics.avgTimelineMonths} mo`} color="text-amber-400" />
        <KpiCard icon={Zap} label="Mission Completion" value={`${analytics.missionCompletionRate}%`} color="text-violet-400" />
      </div>

      {/* Journey Distribution */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Journey Distribution</h3>
        <div className="space-y-2">
          {analytics.stageDistribution.map((s) => (
            <div key={s.stage} className="flex items-center gap-3">
              <span className="text-white/60 text-sm w-40 truncate">{s.stage}</span>
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: `${s.percentage}%` }} />
              </div>
              <span className="text-white/40 text-xs w-16 text-right">{s.count} ({s.percentage}%)</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Career Goals */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Target size={14} className="text-amber-400" /> Top Career Goals
          </h3>
          <div className="space-y-2">
            {analytics.goalDistribution.map((g) => (
              <div key={g.goal} className="flex items-center gap-2 text-sm">
                <span className="text-white/70 flex-1 truncate">{g.goal}</span>
                <span className="text-white/40 text-xs">{g.count}</span>
                <span className="text-white/30 text-xs w-10 text-right">{g.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Common Bottlenecks */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4 flex items-center gap-2">
            <AlertTriangle size={14} className="text-rose-400" /> Common Bottlenecks
          </h3>
          <div className="space-y-2">
            {analytics.commonBottlenecks.map((b) => (
              <div key={b.dimension} className="flex items-center gap-2 text-sm">
                <span className="text-white/70 flex-1 truncate">{b.dimension}</span>
                <span className="text-white/40 text-xs">{b.count} users</span>
              </div>
            ))}
            {analytics.commonBottlenecks.length === 0 && (
              <p className="text-white/30 text-sm">No bottleneck data available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Momentum Distribution */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Momentum Distribution</h3>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(analytics.momentumDistribution).map(([momentum, count]) => (
            <div key={momentum} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-white">{count}</div>
              <div className="text-white/40 text-xs capitalize">{momentum}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-wider mb-1">
        <Icon size={12} className={color} /> {label}
      </div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
}