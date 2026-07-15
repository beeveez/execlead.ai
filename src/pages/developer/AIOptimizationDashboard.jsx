import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import {
  getOptimizationAnalytics, PERFORMANCE_TARGETS, AI_OPTIMIZATION_LAYER_VERSION,
  invalidateCache, getCacheStats, INTENT_CATEGORIES,
} from '@/lib/aiOptimizationLayer';
import {
  Brain, Database, Zap, Layers as CacheIcon, BookOpen, TrendingDown,
  DollarSign, Activity, Cpu, RefreshCw, Trash2, Target, Sparkles,
} from 'lucide-react';

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

function SourceBar({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-white/50 w-24 capitalize">{label}</span>
      <div className="flex-1 h-6 bg-white/[0.02] rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full flex items-center justify-end pr-2 transition-all duration-500`}
          style={{ width: `${Math.max(pct, 2)}%` }}
        >
          <span className="text-[9px] text-white font-medium">{count}</span>
        </div>
      </div>
      <span className="text-[10px] text-white/30 w-8 text-right">{pct}%</span>
    </div>
  );
}

function IntentRow({ intent, data }) {
  const meta = INTENT_CATEGORIES[intent] || { label: intent, aiRequired: false };
  const pct = data.total > 0 ? Math.round((data.optimized / data.total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-1.5 border-b border-white/[0.03] last:border-0">
      <span className="text-[11px] text-white/60 flex-1 capitalize truncate">{meta.label}</span>
      <span className="text-[10px] text-white/30 w-8 text-right">{data.total}</span>
      <div className="w-20 h-4 bg-white/[0.02] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${meta.aiRequired ? "bg-amber-500/40" : "bg-emerald-500/40"}`}
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
      <span className={`text-[10px] w-8 text-right ${meta.aiRequired ? "text-amber-400/60" : "text-emerald-400/60"}`}>
        {meta.aiRequired ? "AI" : "OPT"}
      </span>
    </div>
  );
}

export default function AIOptimizationDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    const data = await getOptimizationAnalytics(500);
    setAnalytics(data);
    try {
      const recent = await base44.entities.AIOptimizationEvent.list("-created_date", 20);
      setEvents(recent);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  const handleInvalidate = (trigger) => {
    invalidateCache(trigger);
    loadAnalytics();
  };

  const handleClearCache = () => {
    try {
      Object.keys(localStorage).filter((k) => k.startsWith("aol_cache:")).forEach((k) => localStorage.removeItem(k));
      loadAnalytics();
    } catch {}
  };

  const cacheStats = getCacheStats();
  const optimizationRate = analytics?.optimizationRate || 0;
  const meetsTarget = optimizationRate >= PERFORMANCE_TARGETS.optimizationRateMin;
  const meetsStretch = optimizationRate >= PERFORMANCE_TARGETS.optimizationRateStretch;

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
            <Brain size={12} className="text-cyan-400" />
            Core Platform Service #9
          </div>
          <h1 className="text-2xl font-bold text-white -mt-3">AI Optimization Layer™</h1>
          <p className="text-white/40 text-sm -mt-2 max-w-3xl leading-relaxed">
            The centralized gateway for all AI requests. Intelligently routes requests through intent classification,
            knowledge packs, caching, and database-first strategies — invoking AI only when reasoning is required.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/30 bg-white/[0.02] border border-white/5 rounded-full px-3 py-1.5">
            v{AI_OPTIMIZATION_LAYER_VERSION}
          </span>
          <button
            onClick={loadAnalytics}
            disabled={loading}
            className="flex items-center gap-1.5 text-[11px] text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/20 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-cyan-900 border-t-cyan-400 rounded-full animate-spin"></div>
        </div>
      ) : !analytics || analytics.total === 0 ? (
        <div className="text-center py-20">
          <Sparkles size={32} className="text-cyan-400/30 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No optimization events yet. AI requests will appear here once modules route through the AI Optimization Layer™.</p>
        </div>
      ) : (
        <>
          {/* Optimization Rate Hero */}
          <div className="bg-gradient-to-br from-cyan-500/5 via-blue-500/[0.02] to-transparent border border-cyan-500/10 rounded-2xl p-6">
            <div className="flex items-center gap-8 flex-wrap">
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    <circle
                      cx="60" cy="60" r="52" fill="none"
                      stroke={meetsStretch ? "#10b981" : meetsTarget ? "#06b6d4" : "#f59e0b"}
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 52}`}
                      strokeDashoffset={`${2 * Math.PI * 52 * (1 - optimizationRate / 100)}`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">{optimizationRate}%</span>
                    <span className="text-[9px] text-white/40 uppercase tracking-wider">Optimized</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Target size={10} className={meetsTarget ? "text-emerald-400" : "text-amber-400"} />
                  <span className="text-[10px] text-white/40">
                    Target: {PERFORMANCE_TARGETS.optimizationRateMin}% · Stretch: {PERFORMANCE_TARGETS.optimizationRateStretch}%
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-[300px] grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon={Activity} label="Total Requests" value={analytics.total} color="text-cyan-400" />
                <StatCard icon={Cpu} label="AI Invocations" value={analytics.aiInvoked} sublabel={`${Math.round((analytics.aiInvoked / analytics.total) * 100)}% of requests`} color="text-amber-400" />
                <StatCard icon={Database} label="Optimized" value={analytics.optimized} sublabel="Served without AI" color="text-emerald-400" />
                <StatCard icon={DollarSign} label="Cost Saved" value={`$${analytics.totalCostSaved.toFixed(4)}`} sublabel={`${analytics.totalCreditsSaved} credits`} color="text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Source Breakdown */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
              <Zap size={14} className="text-cyan-400" />
              Response Source Distribution
            </h3>
            <div className="space-y-2.5">
              <SourceBar label="Database" count={analytics.databaseHits} total={analytics.total} color="bg-emerald-500/30" />
              <SourceBar label="Cache" count={analytics.cacheHits} total={analytics.total} color="bg-blue-500/30" />
              <SourceBar label="Knowledge" count={analytics.knowledgeHits} total={analytics.total} color="bg-violet-500/30" />
              <SourceBar label="AI" count={analytics.aiInvoked} total={analytics.total} color="bg-amber-500/30" />
            </div>
          </div>

          {/* Performance & Cache Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
                <Activity size={14} className="text-cyan-400" />
                Performance Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-white/40">Avg Response Time</span>
                  <span className="text-sm font-medium text-white">{analytics.avgResponseTime}ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-white/40">Avg AI Cost</span>
                  <span className="text-sm font-medium text-white">${analytics.avgAICost.toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-white/40">Total AI Spend</span>
                  <span className="text-sm font-medium text-white">${analytics.totalAICost.toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-white/40">DB Target</span>
                  <span className={`text-xs ${analytics.avgResponseTime < PERFORMANCE_TARGETS.database ? "text-emerald-400" : "text-amber-400"}`}>
                    &lt; {PERFORMANCE_TARGETS.database}ms
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                  <CacheIcon size={14} className="text-blue-400" />
                  Cache Layer™
                </h3>
                <button
                  onClick={handleClearCache}
                  className="flex items-center gap-1 text-[10px] text-red-400/60 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={10} />
                  Clear All
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-white/40">Cache Hits</span>
                  <span className="text-sm font-medium text-blue-400">{cacheStats.hits}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-white/40">Cache Sets</span>
                  <span className="text-sm font-medium text-white">{cacheStats.sets}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-white/40">Hit Rate</span>
                  <span className="text-sm font-medium text-white">
                    {cacheStats.hits + cacheStats.sets > 0
                      ? Math.round((cacheStats.hits / (cacheStats.hits + cacheStats.sets)) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
              {/* Cache Invalidation Triggers */}
              <div className="mt-4 pt-3 border-t border-white/5">
                <span className="text-[9px] text-white/30 uppercase tracking-wider">Invalidation Triggers</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {["resume_updated", "knowledge_updated", "company_updated", "leadership_dna_updated", "platform_updated"].map((t) => (
                    <button
                      key={t}
                      onClick={() => handleInvalidate(t)}
                      className="text-[9px] text-white/40 hover:text-white/70 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-full px-2 py-1 transition-colors"
                    >
                      {t.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Intent Breakdown */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
              <BookOpen size={14} className="text-violet-400" />
              Intent Router™ — Request Classification
            </h3>
            <div className="space-y-0.5">
              <div className="flex items-center gap-3 py-1.5 border-b border-white/5 mb-1">
                <span className="text-[9px] text-white/30 uppercase tracking-wider flex-1">Intent</span>
                <span className="text-[9px] text-white/30 uppercase tracking-wider w-8 text-right">Count</span>
                <span className="text-[9px] text-white/30 uppercase tracking-wider w-20 text-center">Optimized</span>
                <span className="text-[9px] text-white/30 uppercase tracking-wider w-8 text-right">Type</span>
              </div>
              {Object.entries(analytics.intentBreakdown)
                .sort(([, a], [, b]) => b.total - a.total)
                .map(([intent, data]) => (
                  <IntentRow key={intent} intent={intent} data={data} />
                ))}
            </div>
          </div>

          {/* Recent Events */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
              <TrendingDown size={14} className="text-emerald-400" />
              Recent Optimization Events
            </h3>
            <div className="space-y-1">
              {events.slice(0, 15).map((e) => (
                <div key={e.id} className="flex items-center gap-3 py-2 border-b border-white/[0.03] last:border-0">
                  <div className={`w-2 h-2 rounded-full ${
                    e.source === "ai" ? "bg-amber-400" :
                    e.source === "cache" ? "bg-blue-400" :
                    e.source === "knowledge" ? "bg-violet-400" : "bg-emerald-400"
                  }`} />
                  <span className="text-[11px] text-white/50 flex-1 truncate">{e.request_text || "(no text)"}</span>
                  <span className="text-[9px] text-white/30 capitalize">{e.intent?.replace(/_/g, " ")}</span>
                  <span className={`text-[9px] uppercase font-medium w-12 text-right ${
                    e.source === "ai" ? "text-amber-400/60" :
                    e.source === "cache" ? "text-blue-400/60" :
                    e.source === "knowledge" ? "text-violet-400/60" : "text-emerald-400/60"
                  }`}>
                    {e.source}
                  </span>
                  <span className="text-[9px] text-white/20 w-16 text-right">{e.response_time_ms}ms</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}