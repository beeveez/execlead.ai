import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import {
  getObservabilityAnalytics, calculateAIScore, generateAlerts, getRecentTraces,
  OBSERVABILITY_VERSION,
} from '@/lib/aiObservabilityEngine';
import AIScoreHero from '@/components/observability/AIScoreHero';
import AlertsPanel from '@/components/observability/AlertsPanel';
import LatencyBreakdown from '@/components/observability/LatencyBreakdown';
import {
  Activity, RefreshCw, Eye, Server, DollarSign, Layers,
  Cpu, Shield, Database, Zap, TrendingUp,
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

function DistributionBar({ label, count, total, color, icon: Icon }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      {Icon && <Icon size={10} className="text-white/30" />}
      <span className="text-[11px] text-white/50 flex-1 capitalize">{label}</span>
      <div className="flex-1 h-4 bg-white/[0.02] rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${Math.max(pct, 2)}%` }} />
      </div>
      <span className="text-[10px] text-white/40 w-8 text-right">{count}</span>
      <span className="text-[10px] text-white/20 w-8 text-right">{pct}%</span>
    </div>
  );
}

export default function AIObservabilityCenter() {
  const [analytics, setAnalytics] = useState(null);
  const [aiScore, setAiScore] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [traces, setTraces] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await getObservabilityAnalytics(500);
    setAnalytics(data);
    setAiScore(calculateAIScore(data));
    setAlerts(generateAlerts(data));
    const recent = await getRecentTraces(20);
    setTraces(recent);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
            <Eye size={12} className="text-indigo-400" />
            Core Platform Service #12
          </div>
          <h1 className="text-2xl font-bold text-white -mt-3">AI Observability Center™</h1>
          <p className="text-white/40 text-sm -mt-2 max-w-3xl leading-relaxed">
            Enterprise AI Telemetry & Operations Platform. Observes every AI request, measures every decision,
            detects every anomaly — providing complete visibility into AI operations across EXECLEAD.AI.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/30 bg-white/[0.02] border border-white/5 rounded-full px-3 py-1.5">
            v{OBSERVABILITY_VERSION}
          </span>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 text-[11px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin"></div>
        </div>
      ) : !analytics || analytics.totalTraces === 0 ? (
        <div className="text-center py-20">
          <Eye size={32} className="text-indigo-400/30 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No observability data yet. AI request traces will appear here once requests flow through the full AI pipeline.</p>
        </div>
      ) : (
        <>
          {/* AI Score™ + Executive Overview */}
          {aiScore && <AIScoreHero aiScore={aiScore} metrics={analytics} />}

          {/* Alerts + Latency Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AlertsPanel alerts={alerts} />
            <LatencyBreakdown metrics={analytics} />
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <StatCard icon={Activity} label="Total Traces" value={analytics.totalTraces} color="text-indigo-400" />
            <StatCard icon={Zap} label="AI Served" value={analytics.aiServed} sublabel={`${analytics.aiInvocationRate}% of all requests`} color="text-cyan-400" />
            <StatCard icon={Shield} label="Policy Blocked" value={analytics.policyBlocked} color="text-rose-400" />
            <StatCard icon={Server} label="Fallbacks" value={analytics.fallbacksUsed} sublabel={`${analytics.fallbackRate}% fallback rate`} color="text-amber-400" />
            <StatCard icon={DollarSign} label="Total Cost" value={`$${analytics.totalCost.toFixed(3)}`} color="text-emerald-400" />
            <StatCard icon={TrendingUp} label="Cost Saved" value={`$${analytics.totalCostSaved.toFixed(2)}`} sublabel={`${analytics.totalCreditsSavedOpt.toLocaleString()} credits`} color="text-emerald-400" />
          </div>

          {/* Source Distribution & Cache Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
                <Database size={14} className="text-emerald-400" />
                Source Distribution & Cache Analytics
              </h3>
              <div className="space-y-2.5">
                <DistributionBar label="Database" count={analytics.sourceDist.database} total={analytics.totalRequests} color="bg-blue-500/30" icon={Database} />
                <DistributionBar label="Cache" count={analytics.sourceDist.cache} total={analytics.totalRequests} color="bg-emerald-500/30" icon={Zap} />
                <DistributionBar label="Knowledge" count={analytics.sourceDist.knowledge} total={analytics.totalRequests} color="bg-violet-500/30" icon={Layers} />
                <DistributionBar label="AI Invocation" count={analytics.sourceDist.ai} total={analytics.totalRequests} color="bg-cyan-500/30" icon={Cpu} />
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-[10px] text-white/30 uppercase">Optimization</div>
                  <div className="text-lg font-bold text-emerald-400">{analytics.optimizationRate}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-white/30 uppercase">Cache Hit</div>
                  <div className="text-lg font-bold text-violet-400">{analytics.cacheHitRate}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-white/30 uppercase">Knowledge Hit</div>
                  <div className="text-lg font-bold text-cyan-400">{analytics.knowledgeHitRate}%</div>
                </div>
              </div>
            </div>

            {/* Provider Health */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
                <Server size={14} className="text-emerald-400" />
                Provider Health
              </h3>
              <div className="space-y-3">
                {Object.entries(analytics.providerStats).map(([provider, stats]) => (
                  <div key={provider} className="border border-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-medium text-white/70 capitalize">{provider}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full uppercase font-medium ${
                        stats.status === "healthy" ? "bg-emerald-500/10 text-emerald-400" :
                        stats.status === "warning" ? "bg-amber-500/10 text-amber-400" :
                        "bg-rose-500/10 text-rose-400"
                      }`}>{stats.status}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[9px] text-white/30">
                      <div>{stats.requests} requests</div>
                      <div>{stats.avgLatency}ms avg</div>
                      <div>${stats.cost.toFixed(3)} cost</div>
                    </div>
                    <div className="mt-2 h-1 bg-white/[0.02] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${stats.status === "healthy" ? "bg-emerald-500/30" : stats.status === "warning" ? "bg-amber-500/30" : "bg-rose-500/30"}`} style={{ width: `${stats.successRate}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Model Analytics & Workspace Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
                <Cpu size={14} className="text-cyan-400" />
                Model Analytics
              </h3>
              <div className="space-y-1">
                {analytics.modelStats.map((stat) => (
                  <div key={stat.model} className="flex items-center gap-3 py-2 border-b border-white/[0.03] last:border-0">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.03] text-white/40 w-8 text-center">T{stat.tier}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-white/60 truncate">{stat.model}</div>
                      <div className="text-[9px] text-white/30 capitalize">{stat.provider}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-white/50">{stat.requests} req</div>
                      <div className="text-[9px] text-white/30">{stat.avgLatency}ms</div>
                    </div>
                    <div className="text-right w-12">
                      <div className={`text-[11px] font-medium ${stat.successRate >= 90 ? "text-emerald-400" : stat.successRate >= 70 ? "text-amber-400" : "text-rose-400"}`}>{stat.successRate}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
                <Layers size={14} className="text-violet-400" />
                Workspace Analytics
              </h3>
              <div className="space-y-2">
                {analytics.workspaceStats.map((ws) => (
                  <div key={ws.workspace} className="flex items-center gap-3 border border-white/5 rounded-lg p-2.5">
                    <span className="text-[11px] font-medium text-white/70 capitalize flex-1">{ws.workspace}</span>
                    <div className="text-right">
                      <div className="text-[11px] text-white/50">{ws.requests} req</div>
                      <div className="text-[9px] text-white/30">{ws.avgLatency}ms avg</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-cyan-400">${ws.cost.toFixed(3)}</div>
                      <div className="text-[9px] text-white/30">{ws.credits} cr</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cost Analytics */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
              <DollarSign size={14} className="text-emerald-400" />
              Cost Analytics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
                <div className="text-[10px] text-white/30 uppercase mb-1">Today</div>
                <div className="text-lg font-bold text-cyan-400">${analytics.costToday.toFixed(3)}</div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
                <div className="text-[10px] text-white/30 uppercase mb-1">This Month</div>
                <div className="text-lg font-bold text-cyan-400">${analytics.costThisMonth.toFixed(2)}</div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
                <div className="text-[10px] text-white/30 uppercase mb-1">Projected Monthly</div>
                <div className="text-lg font-bold text-amber-400">${analytics.projectedMonthly.toFixed(2)}</div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
                <div className="text-[10px] text-white/30 uppercase mb-1">Cost Saved</div>
                <div className="text-lg font-bold text-emerald-400">${analytics.totalCostSaved.toFixed(2)}</div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
                <div className="text-[10px] text-white/30 uppercase mb-1">Avg Tokens/Req</div>
                <div className="text-lg font-bold text-white">{analytics.avgTokenInput.toLocaleString()}</div>
              </div>
            </div>
            {/* Feature cost breakdown */}
            <div className="mt-4 pt-3 border-t border-white/5">
              <div className="text-[10px] text-white/30 uppercase mb-2">Top Cost Drivers by Intent</div>
              <div className="space-y-1.5">
                {analytics.intentStats.slice(0, 5).map((item) => (
                  <div key={item.intent} className="flex items-center gap-3">
                    <span className="text-[11px] text-white/50 capitalize flex-1 truncate">{item.intent?.replace(/_/g, " ")}</span>
                    <span className="text-[10px] text-white/30">{item.requests} req</span>
                    <div className="w-20 h-3 bg-white/[0.02] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500/30 rounded-full" style={{ width: `${Math.min(100, (item.cost / (analytics.intentStats[0]?.cost || 1)) * 100)}%` }} />
                    </div>
                    <span className="text-[10px] text-cyan-400 w-12 text-right">${item.cost.toFixed(3)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Request Traces */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white/80 mb-4 flex items-center gap-2">
              <Activity size={14} className="text-indigo-400" />
              Recent Request Traces
            </h3>
            <div className="space-y-1">
              {traces.slice(0, 15).map((t) => (
                <div key={t.id} className="flex items-center gap-3 py-2 border-b border-white/[0.03] last:border-0">
                  <div className={`w-2 h-2 rounded-full ${
                    t.response_status === "success" ? "bg-emerald-400" :
                    t.response_status === "failed" ? "bg-rose-400" :
                    t.response_status === "blocked" ? "bg-amber-400" : "bg-cyan-400"
                  }`} />
                  <span className="text-[9px] text-white/20 font-mono w-32 truncate">{t.request_id}</span>
                  <span className="text-[11px] text-white/50 flex-1 truncate">{t.request_text || "(no text)"}</span>
                  <span className="text-[9px] text-white/30 capitalize w-24">{t.intent?.replace(/_/g, " ") || "—"}</span>
                  {t.selected_model && <span className="text-[9px] text-cyan-400/60 w-24 truncate">{t.selected_model}</span>}
                  {t.fallback_used && <span className="text-[9px] text-amber-400/60">fallback</span>}
                  <span className="text-[9px] text-white/20 w-16 text-right">{t.total_response_time_ms}ms</span>
                  <span className="text-[9px] text-white/20 w-12 text-right">${(t.actual_cost || t.estimated_cost || 0).toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}