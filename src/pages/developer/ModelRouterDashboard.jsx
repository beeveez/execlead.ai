import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import {
  getRoutingAnalytics, generateRoutingRecommendations,
  MODEL_ROUTER_VERSION, MODEL_REGISTRY, TIER_LABELS,
} from '@/lib/modelRouterEngine';
import {
  Cpu, RefreshCw, CheckCircle, XCircle, AlertTriangle, Zap,
  Scale, Brain, TrendingUp, DollarSign, Clock, Activity,
  Lightbulb, ArrowRight, Layers,
} from 'lucide-react';

const TIER_COLORS = {
  1: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", bar: "bg-emerald-500/30" },
  2: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20", bar: "bg-cyan-500/30" },
  3: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20", bar: "bg-violet-500/30" },
};

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

function ModelRow({ stat }) {
  const model = MODEL_REGISTRY[stat.model];
  const tierColor = TIER_COLORS[stat.tier] || TIER_COLORS[1];
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/[0.03] last:border-0">
      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${tierColor.bg} ${tierColor.text} border ${tierColor.border} w-12 text-center`}>
        T{stat.tier}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-medium text-white/70 truncate">{model?.label || stat.model}</div>
        <div className="text-[9px] text-white/30 capitalize">{stat.provider}</div>
      </div>
      <div className="text-right">
        <div className="text-[11px] text-white/60">{stat.requests} req</div>
        <div className="text-[9px] text-white/30">{stat.avgLatency}ms avg</div>
      </div>
      <div className="w-16 text-right">
        <div className={`text-[11px] font-medium ${stat.successRate >= 90 ? "text-emerald-400" : stat.successRate >= 70 ? "text-amber-400" : "text-rose-400"}`}>
          {stat.successRate}%
        </div>
        <div className="text-[9px] text-white/30">${stat.totalCost.toFixed(3)}</div>
      </div>
    </div>
  );
}

function RecommendationCard({ rec }) {
  const severityColors = {
    critical: "bg-rose-500/10 border-rose-500/20 text-rose-400",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    info: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
  };
  const colorClass = severityColors[rec.severity] || severityColors.info;
  return (
    <div className={`border rounded-lg p-3 ${colorClass}`}>
      <div className="flex items-start gap-2">
        <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-[11px] text-white/70 leading-relaxed">{rec.message}</p>
          {rec.type && (
            <span className="text-[9px] uppercase tracking-wider opacity-60 mt-1 inline-block">
              {rec.type.replace(/_/g, " ")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ModelRouterDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [data, recs] = await Promise.all([
      getRoutingAnalytics(500),
      generateRoutingRecommendations(500),
    ]);
    setAnalytics(data);
    setRecommendations(recs.recommendations || []);
    try {
      const recent = await base44.entities.ModelRoutingEvent.list("-created_date", 20);
      setEvents(recent);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
            <Cpu size={12} className="text-cyan-400" />
            Core Platform Service #11
          </div>
          <h1 className="text-2xl font-bold text-white -mt-3">Model Router™</h1>
          <p className="text-white/40 text-sm -mt-2 max-w-3xl leading-relaxed">
            Enterprise Multi-Model Intelligence Orchestrator. Intelligently selects the most appropriate AI model
            for every approved request — optimizing cost, speed, quality, context length, and reasoning depth.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/30 bg-white/[0.02] border border-white/5 rounded-full px-3 py-1.5">
            v{MODEL_ROUTER_VERSION}
          </span>
          <button
            onClick={loadData}
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
          <Cpu size={32} className="text-cyan-400/30 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No routing events yet. Model routing decisions will appear here once AI requests pass through the Model Router™.</p>
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="bg-gradient-to-br from-cyan-500/5 via-blue-500/[0.02] to-transparent border border-cyan-500/10 rounded-2xl p-6">
            <div className="flex items-center gap-8 flex-wrap">
              <div className="flex flex-col items-center">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 ${
                  analytics.successRate >= 90 ? "border-emerald-500/30" : analytics.successRate >= 70 ? "border-amber-500/30" : "border-rose-500/30"
                }`}>
                  <span className="text-3xl font-bold text-white">{analytics.successRate}%</span>
                </div>
                <span className="text-[9px] text-white/40 uppercase tracking-wider mt-2">Success Rate</span>
              </div>
              <div className="flex-1 min-w-[300px] grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard icon={Activity} label="Total Routed" value={analytics.total} color="text-cyan-400" />
                <StatCard icon={CheckCircle} label="Successful" value={analytics.successful} color="text-emerald-400" />
                <StatCard icon={ArrowRight} label="Fallbacks Used" value={analytics.fallbacksUsed} sublabel={`${analytics.fallbackRate}% fallback rate`} color="text-amber-400" />
                <StatCard icon={Clock} label="Avg Latency" value={`${analytics.avgLatency}ms`} color="text-violet-400" />
                <StatCard icon={DollarSign} label="Total Cost" value={`$${analytics.totalCost.toFixed(3)}`} sublabel={`$${analytics.avgCost.toFixed(4)}/req avg`} color="text-emerald-400" />
                <StatCard icon={Layers} label="Avg Context" value={`${analytics.avgContextSize.toLocaleString()} tok`} color="text-cyan-400" />
                <StatCard icon={XCircle} label="Failed" value={analytics.failed} color="text-rose-400" />
                <StatCard icon={RefreshCw} label="Retried" value={analytics.retried} color="text-amber-400" />
              </div>
            </div>
          </div>

          {/* Tier Distribution */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
              <Brain size={14} className="text-violet-400" />
              Model Tier Distribution
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((tier) => {
                const count = analytics.tierDist[tier] || 0;
                const pct = analytics.total > 0 ? Math.round((count / analytics.total) * 100) : 0;
                const color = TIER_COLORS[tier];
                return (
                  <div key={tier} className={`${color.bg} border ${color.border} rounded-lg p-4`}>
                    <div className={`text-[10px] uppercase tracking-wider ${color.text} mb-1`}>Tier {tier} — {TIER_LABELS[tier]?.label}</div>
                    <div className="text-2xl font-bold text-white">{count}</div>
                    <div className="text-[10px] text-white/30 mt-1">{pct}% of requests</div>
                    <div className="text-[9px] text-white/20 mt-1">{TIER_LABELS[tier]?.description}</div>
                    <div className="mt-2 h-1.5 bg-white/[0.02] rounded-full overflow-hidden">
                      <div className={`h-full ${color.bar} rounded-full`} style={{ width: `${Math.max(pct, 2)}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Model Performance & Provider Health */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
                <Cpu size={14} className="text-cyan-400" />
                Model Performance
              </h3>
              <div className="space-y-0.5">
                {analytics.modelStats.map((stat) => (
                  <ModelRow key={stat.model} stat={stat} />
                ))}
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
                <Activity size={14} className="text-emerald-400" />
                Provider Health
              </h3>
              <div className="space-y-3">
                {Object.entries(analytics.providerStats).map(([provider, stats]) => (
                  <div key={provider} className="border border-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-medium text-white/70 capitalize">{provider}</span>
                      <span className={`text-[11px] font-medium ${stats.successRate >= 90 ? "text-emerald-400" : stats.successRate >= 70 ? "text-amber-400" : "text-rose-400"}`}>
                        {stats.successRate}% success
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[9px] text-white/30">
                      <div>{stats.requests} requests</div>
                      <div>{stats.avgLatency}ms avg</div>
                      <div>${stats.totalCost.toFixed(3)} cost</div>
                    </div>
                    <div className="mt-2 h-1 bg-white/[0.02] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${stats.successRate >= 90 ? "bg-emerald-500/30" : stats.successRate >= 70 ? "bg-amber-500/30" : "bg-rose-500/30"}`}
                        style={{ width: `${stats.successRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Routing Recommendations™ */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
              <Lightbulb size={14} className="text-amber-400" />
              Routing Recommendations™
              <span className="text-[9px] text-white/30 ml-1">Intelligent Learning</span>
            </h3>
            {recommendations.length === 0 ? (
              <p className="text-[11px] text-white/30 py-4 text-center">
                No routing recommendations at this time. The Model Router™ is performing optimally.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recommendations.map((rec, i) => (
                  <RecommendationCard key={i} rec={rec} />
                ))}
              </div>
            )}
          </div>

          {/* Model Registry Reference */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
              <Layers size={14} className="text-cyan-400" />
              Model Registry — Provider Abstraction
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {Object.values(MODEL_REGISTRY).map((model) => {
                const color = TIER_COLORS[model.tier];
                return (
                  <div key={model.id} className={`border ${color.border} ${color.bg} rounded-lg p-3`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-medium text-white/70">{model.label}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${color.bg} ${color.text}`}>T{model.tier}</span>
                    </div>
                    <div className="text-[9px] text-white/30 space-y-0.5">
                      <div>Provider: <span className="text-white/40 capitalize">{model.provider}</span></div>
                      <div>Context: <span className="text-white/40">{model.maxContext.toLocaleString()} tok</span></div>
                      <div>Cost: <span className="text-white/40">${model.costPer1kTokens.toFixed(4)}/1k</span></div>
                      <div>Latency: <span className="text-white/40">~{model.avgLatencyMs}ms</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Routing Events */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
              <Activity size={14} className="text-cyan-400" />
              Recent Routing Decisions
            </h3>
            <div className="space-y-1">
              {events.slice(0, 15).map((e) => {
                const model = MODEL_REGISTRY[e.selected_model];
                const tierColor = TIER_COLORS[e.tier] || TIER_COLORS[1];
                return (
                  <div key={e.id} className="flex items-center gap-3 py-2 border-b border-white/[0.03] last:border-0">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${tierColor.bg} ${tierColor.text} w-8 text-center`}>T{e.tier}</span>
                    <span className="text-[11px] text-white/50 w-32 truncate">{model?.label || e.selected_model}</span>
                    <span className="text-[9px] text-white/30 capitalize w-20">{e.selected_provider}</span>
                    <span className="text-[9px] text-white/30 capitalize flex-1 truncate">{e.intent?.replace(/_/g, " ") || "—"}</span>
                    <span className={`text-[9px] ${e.success ? "text-emerald-400/60" : "text-rose-400/60"}`}>{e.success ? "✓" : "✗"}</span>
                    {e.fallback_from && <span className="text-[9px] text-amber-400/60">fallback</span>}
                    <span className="text-[9px] text-white/20 w-16 text-right">{e.latency_ms}ms</span>
                    <span className="text-[9px] text-white/20 w-12 text-right">${(e.cost || 0).toFixed(4)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}