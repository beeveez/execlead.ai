import React, { useState, useEffect, useCallback } from 'react';
import { getForecastAnalytics, FORECAST_VERSION } from '@/lib/promotionForecastEngine';
import { Brain, RefreshCw, Users, TrendingUp, ShieldCheck, Clock } from 'lucide-react';

function StatCard({ icon: Icon, label, value, sublabel, color = "text-white" }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={color} />
        <span className="text-[10px] uppercase tracking-wider text-white/40">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sublabel && <div className="text-[10px] text-white/30 mt-1">{sublabel}</div>}
    </div>
  );
}

export default function PromotionForecastDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await getForecastAnalytics(500);
    setAnalytics(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
            <Brain size={12} className="text-indigo-400" />
            Core Intelligence Service #1
          </div>
          <h1 className="text-2xl font-bold text-white -mt-3">Promotion Forecast Engine™</h1>
          <p className="text-white/40 text-sm -mt-2 max-w-3xl leading-relaxed">
            Developer dashboard for the centralized intelligence engine. Monitors forecast requests,
            readiness distribution, skill gaps, recommendations, and prediction confidence across the platform.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-1.5 text-[11px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin"></div>
        </div>
      ) : !analytics || analytics.total === 0 ? (
        <div className="text-center py-20">
          <Brain size={32} className="text-indigo-400/30 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No forecast data yet. Forecasts will appear here once users generate their Promotion Forecast™.</p>
        </div>
      ) : (
        <>
          {/* Platform Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <StatCard icon={TrendingUp} label="Total Forecasts" value={analytics.total} color="text-indigo-400" />
            <StatCard icon={Users} label="Unique Users" value={analytics.uniqueUsers} color="text-cyan-400" />
            <StatCard icon={TrendingUp} label="Avg Readiness" value={`${analytics.avgReadiness}%`} color="text-emerald-400" />
            <StatCard icon={TrendingUp} label="Avg Probability" value={`${analytics.avgProbability}%`} color="text-amber-400" />
            <StatCard icon={ShieldCheck} label="Avg Confidence" value={`${analytics.avgConfidence}%`} color="text-violet-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Timeline Distribution */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
                <Clock size={14} className="text-cyan-400" />
                Timeline Distribution
              </h3>
              <div className="space-y-2">
                {Object.entries(analytics.timelineDist).sort((a, b) => b[1] - a[1]).map(([label, count]) => {
                  const pct = analytics.total > 0 ? Math.round((count / analytics.total) * 100) : 0;
                  return (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-[11px] text-white/50 w-24">{label}</span>
                      <div className="flex-1 h-4 bg-white/[0.02] rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500/30 rounded-full" style={{ width: `${Math.max(pct, 2)}%` }} />
                      </div>
                      <span className="text-[10px] text-white/40 w-8 text-right">{count}</span>
                      <span className="text-[10px] text-white/20 w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Momentum + Confidence Distribution */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
                <TrendingUp size={14} className="text-emerald-400" />
                Momentum & Confidence Distribution
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] text-white/30 uppercase mb-2">Momentum</div>
                  <div className="space-y-1.5">
                    {Object.entries(analytics.momentumDist).map(([key, count]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${key === "increasing" ? "bg-emerald-500" : key === "stable" ? "bg-cyan-500" : "bg-rose-500"}`} />
                        <span className="text-[11px] text-white/50 capitalize flex-1">{key}</span>
                        <span className="text-[11px] text-white/40">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-white/30 uppercase mb-2">Confidence</div>
                  <div className="space-y-1.5">
                    {Object.entries(analytics.confDist).map(([key, count]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${key === "high" ? "bg-emerald-500" : key === "medium" ? "bg-amber-500" : "bg-rose-500"}`} />
                        <span className="text-[11px] text-white/50 capitalize flex-1">{key}</span>
                        <span className="text-[11px] text-white/40">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Skill Gaps */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white/80 mb-4">Top Skill Gaps Across Platform</h3>
              <div className="space-y-2">
                {analytics.topGaps.map((gap, i) => {
                  const maxCount = analytics.topGaps[0]?.count || 1;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[9px] text-white/30 w-4">{i + 1}.</span>
                      <span className="text-[11px] text-white/50 flex-1 truncate">{gap.label}</span>
                      <div className="w-20 h-3 bg-white/[0.02] rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500/30 rounded-full" style={{ width: `${(gap.count / maxCount) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-white/40 w-8 text-right">{gap.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Recommendations */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white/80 mb-4">Most Common Recommendations</h3>
              <div className="space-y-2">
                {analytics.topRecs.map((rec, i) => {
                  const maxCount = analytics.topRecs[0]?.count || 1;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[9px] text-white/30 w-4">{i + 1}.</span>
                      <span className="text-[11px] text-white/50 flex-1 truncate">{rec.action}</span>
                      <div className="w-20 h-3 bg-white/[0.02] rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500/30 rounded-full" style={{ width: `${(rec.count / maxCount) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-white/40 w-8 text-right">{rec.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Forecasts */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white/80 mb-4">Recent Forecasts</h3>
            <div className="space-y-1">
              {analytics.recentForecasts.map((f) => (
                <div key={f.id} className="flex items-center gap-3 py-2 border-b border-white/[0.03] last:border-0">
                  <span className="text-[11px] text-white/50 flex-1 truncate">{f.user_name || "Unknown"}</span>
                  <span className="text-[10px] text-white/30 capitalize">{f.current_level} → {f.target_level}</span>
                  <span className={`text-[11px] font-medium ${f.readiness_score >= 70 ? "text-emerald-400" : f.readiness_score >= 50 ? "text-amber-400" : "text-rose-400"}`}>{f.readiness_score}%</span>
                  <span className="text-[10px] text-white/30 w-16 text-right">{f.timeline_label}</span>
                  <span className={`text-[9px] ${f.momentum === "increasing" ? "text-emerald-400" : f.momentum === "declining" ? "text-rose-400" : "text-cyan-400"}`}>{f.momentum}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}