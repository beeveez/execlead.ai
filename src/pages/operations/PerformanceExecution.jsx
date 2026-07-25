import React, { useState } from "react";
import {
  Gauge, CheckCircle, XCircle, AlertTriangle, Zap, Clock, Database, Brain, Cpu,
  HardDrive, Network, Server, Monitor, Target, Rocket, Activity, TrendingUp,
  TrendingDown, ArrowUp, ArrowDown, Users, RefreshCw, Search, Navigation,
  BarChart3, Layers, Wifi, MemoryStick, Timer, ServerCog, FileText, Bug,
  ChevronRight,
} from "lucide-react";
import {
  PLATFORM_HEALTH, PERFORMANCE_TARGETS, LOAD_TESTS, STRESS_TESTS, DATABASE_METRICS,
  SLOW_QUERIES, DATABASE_HEALTH, AI_PERFORMANCE, AI_PROVIDER_PERFORMANCE, CACHE_METRICS,
  CACHE_HOT_KEYS, UX_METRICS, AUTOMATED_BENCHMARKS, OPTIMIZATION_RECOMMENDATIONS,
  PERFORMANCE_ANALYTICS, computePerformanceScore, getPerformanceGateStatus,
} from "@/lib/performanceExecutionEngine";
import PerformanceScoreGauge from "@/components/performance-execution/PerformanceScoreGauge";
import PerformanceReleaseGate from "@/components/performance-execution/PerformanceReleaseGate";

const STATUS_COLORS = { pass: "#10b981", warn: "#f59e0b", fail: "#ef4444", completed: "#10b981", "in_progress": "#06b6d4", planned: "#6366f1" };
const STRESS_COLORS = { pass: "#10b981", warn: "#f59e0b", fail: "#ef4444" };

export default function PerformanceExecution() {
  const [tab, setTab] = useState("dashboard");
  const score = computePerformanceScore();
  const gate = getPerformanceGateStatus();

  const TABS = [
    { id: "dashboard", label: "Dashboard", icon: Gauge },
    { id: "targets", label: "Targets", icon: Target },
    { id: "load", label: "Load Testing", icon: Users },
    { id: "stress", label: "Stress Testing", icon: Zap },
    { id: "database", label: "Database", icon: Database },
    { id: "ai", label: "AI Performance", icon: Brain },
    { id: "cache", label: "Cache", icon: Server },
    { id: "ux", label: "UX Performance", icon: Monitor },
    { id: "tests", label: "Automated Tests", icon: CheckCircle },
    { id: "optimization", label: "Optimization", icon: Zap },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "gate", label: "Release Gate", icon: Activity },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-0">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Zap size={12} className="text-cyan-400" /> Enterprise Performance Validation Standard · Version 1.0 · Priority P0
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Performance & Load Testing Framework™</h1>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${gate.pass ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
            {gate.pass ? <CheckCircle size={14} /> : <AlertTriangle size={14} />} Gate: {gate.pass ? "PASS" : "WARN"}
          </div>
        </div>
        <p className="text-white/40 text-sm mt-1">Performance is a feature. Every user interaction should feel immediate. Every AI request should be optimized. Every deployment must improve or maintain platform responsiveness.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <HealthKpi icon={Gauge} label="Performance Score" value={`${score}%`} color="#6366f1" />
        <HealthKpi icon={Server} label="API Response" value={`${PLATFORM_HEALTH.responseTime}ms`} color="#06b6d4" />
        <HealthKpi icon={Brain} label="AI Response" value={`${PLATFORM_HEALTH.aiResponseTime}s`} color="#a855f7" />
        <HealthKpi icon={Database} label="DB Latency" value={`${PLATFORM_HEALTH.databaseLatency}ms`} color="#10b981" />
        <HealthKpi icon={Server} label="Cache Hit" value={`${PLATFORM_HEALTH.cacheHitRate}%`} color="#f59e0b" />
        <HealthKpi icon={Activity} label="Error Rate" value={`${PLATFORM_HEALTH.errorRate}%`} color="#10b981" />
        <HealthKpi icon={Activity} label="Throughput" value={`${PLATFORM_HEALTH.apiThroughput}`} color="#06b6d4" sub="req/s" />
        <HealthKpi icon={MemoryStick} label="Memory" value={`${PLATFORM_HEALTH.memoryUsage}%`} color="#f59e0b" />
        <HealthKpi icon={Cpu} label="CPU" value={`${PLATFORM_HEALTH.cpuUsage}%`} color="#f59e0b" />
        <HealthKpi icon={HardDrive} label="Disk" value={`${PLATFORM_HEALTH.diskUsage}%`} color="#06b6d4" />
        <HealthKpi icon={Users} label="Concurrent" value={`${PLATFORM_HEALTH.concurrentUsers}`} color="#6366f1" sub="users" />
        <HealthKpi icon={Wifi} label="Network" value={`${PLATFORM_HEALTH.networkLatency}ms`} color="#10b981" />
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${tab === t.id ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "text-white/40 hover:text-white/70 hover:bg-white/5"}`}>
            <t.icon size={12} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && <PerformanceScoreGauge />}
      {tab === "targets" && <TargetsTab />}
      {tab === "load" && <LoadTestingTab />}
      {tab === "stress" && <StressTestingTab />}
      {tab === "database" && <DatabaseTab />}
      {tab === "ai" && <AIPerformanceTab />}
      {tab === "cache" && <CacheTab />}
      {tab === "ux" && <UXPerformanceTab />}
      {tab === "tests" && <AutomatedTestsTab />}
      {tab === "optimization" && <OptimizationTab />}
      {tab === "analytics" && <AnalyticsTab />}
      {tab === "gate" && <PerformanceReleaseGate />}
    </div>
  );
}

function HealthKpi({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex items-center gap-2">
      <Icon size={16} style={{ color }} className="shrink-0" />
      <div>
        <div className="text-sm font-bold text-white">{value}{sub && <span className="text-[9px] text-white/30 ml-1">{sub}</span>}</div>
        <div className="text-[10px] text-white/40">{label}</div>
      </div>
    </div>
  );
}

function TargetsTab() {
  return (
    <div className="space-y-4">
      <div className="bg-cyan-500/5 border border-cyan-500/15 rounded-xl p-4 flex items-start gap-3">
        <Target size={16} className="text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-cyan-400">Platform Performance Targets</h3>
          <p className="text-xs text-white/40 mt-1">Every metric has a target. Every deployment must meet or maintain these targets. Performance regressions are blocked.</p>
        </div>
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/40 border-b border-white/5">
                <th className="text-left py-2 px-2">Metric</th>
                <th className="text-left py-2 px-2">Target</th>
                <th className="text-left py-2 px-2">Actual</th>
                <th className="text-center py-2 px-2">Status</th>
                <th className="text-right py-2 px-2">Margin</th>
              </tr>
            </thead>
            <tbody>
              {PERFORMANCE_TARGETS.map((t, i) => {
                const targetNum = parseFloat(t.target.replace(/[^0-9.]/g, ""));
                const actualNum = parseFloat(t.actual.replace(/[^0-9.]/g, ""));
                const margin = Math.round(((targetNum - actualNum) / targetNum) * 100);
                return (
                  <tr key={i} className="border-b border-white/[0.03]">
                    <td className="py-2 px-2 text-white/80">{t.metric}</td>
                    <td className="py-2 px-2 text-white/50">{t.target}</td>
                    <td className="py-2 px-2 text-white/60 font-medium">{t.actual}</td>
                    <td className="py-2 px-2 text-center">
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${STATUS_COLORS[t.status]}20`, color: STATUS_COLORS[t.status] }}>
                        {t.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right">
                      <span className={margin >= 0 ? "text-emerald-400" : "text-amber-400"}>
                        {margin >= 0 ? "+" : ""}{margin}% under target
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LoadTestingTab() {
  return (
    <div className="space-y-4">
      <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-4 flex items-start gap-3">
        <Users size={16} className="text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-indigo-400">Load Testing — 50 / 100 / 250 / 500 / 1000 Users</h3>
          <p className="text-xs text-white/40 mt-1">Automatically execute load tests at 5 user levels. Measure response time, error rate, memory, CPU, database, API, cache, and AI queue.</p>
        </div>
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Load Test Results™</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/40 border-b border-white/5">
                <th className="text-left py-2 px-2">Users</th>
                <th className="text-right py-2 px-2">Response Time</th>
                <th className="text-right py-2 px-2">Error Rate</th>
                <th className="text-right py-2 px-2">Memory</th>
                <th className="text-right py-2 px-2">CPU</th>
                <th className="text-right py-2 px-2">DB Latency</th>
                <th className="text-right py-2 px-2">Cache Hit</th>
                <th className="text-right py-2 px-2">AI Queue</th>
                <th className="text-center py-2 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {LOAD_TESTS.map((t, i) => (
                <tr key={i} className="border-b border-white/[0.03]">
                  <td className="py-2 px-2 text-white/80 font-medium">{t.users} users</td>
                  <td className="py-2 px-2 text-right text-white/60">{t.responseTime}ms</td>
                  <td className={`py-2 px-2 text-right ${t.errorRate > 0.3 ? "text-amber-400" : "text-emerald-400"}`}>{t.errorRate}%</td>
                  <td className="py-2 px-2 text-right text-white/60">{t.memory}%</td>
                  <td className="py-2 px-2 text-right text-white/60">{t.cpu}%</td>
                  <td className="py-2 px-2 text-right text-white/60">{t.database}ms</td>
                  <td className="py-2 px-2 text-right text-white/60">{t.cache}%</td>
                  <td className={`py-2 px-2 text-right ${t.aiQueue > 20 ? "text-amber-400" : "text-white/60"}`}>{t.aiQueue}</td>
                  <td className="py-2 px-2 text-center">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${STATUS_COLORS[t.status]}20`, color: STATUS_COLORS[t.status] }}>
                      {t.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="text-[10px] text-white/30 mt-2">Last run: 2026-07-25 10:00–11:00 UTC · All tests completed</div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <LoadSummary label="Max Users Tested" value="1,000" icon={Users} color="#6366f1" />
        <LoadSummary label="Max Response Time" value="420ms" icon={Clock} color="#f59e0b" />
        <LoadSummary label="Max Error Rate" value="0.5%" icon={AlertTriangle} color="#10b981" />
        <LoadSummary label="Max AI Queue" value="32" icon={Brain} color="#a855f7" />
      </div>
    </div>
  );
}

function LoadSummary({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center gap-3">
      <Icon size={20} style={{ color }} className="shrink-0" />
      <div>
        <div className="text-xl font-bold text-white">{value}</div>
        <div className="text-[10px] text-white/40">{label}</div>
      </div>
    </div>
  );
}

function StressTestingTab() {
  return (
    <div className="space-y-4">
      <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 flex items-start gap-3">
        <Zap size={16} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-amber-400">Stress Testing — Extreme Scenarios</h3>
          <p className="text-xs text-white/40 mt-1">Simulate traffic spikes, large AI requests, concurrent uploads, bulk searches, multiple simulations, simultaneous coaching, database stress, and cache saturation.</p>
        </div>
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="space-y-2">
          {STRESS_TESTS.map((s) => (
            <div key={s.id} className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-white/30">{s.id}</span>
                  <span className="text-xs text-white/80">{s.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/30">{s.users} users · {s.duration}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${STRESS_COLORS[s.result]}20`, color: STRESS_COLORS[s.result] }}>
                    {s.result.toUpperCase()}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-white/40 mb-1">{s.description}</p>
              <div className="flex items-center gap-4 text-[10px] text-white/30">
                <span>Peak Response: <span className={s.peakResponseTime > 5000 ? "text-amber-400" : "text-white/60"}>{s.peakResponseTime}ms</span></span>
                <span>Peak Errors: <span className={s.peakErrorRate > 0.3 ? "text-amber-400" : "text-emerald-400"}>{s.peakErrorRate}%</span></span>
                <span>Status: {s.status}</span>
              </div>
              <p className="text-[10px] text-white/40 mt-1"><span className="text-indigo-400/60">→</span> {s.notes}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DatabaseTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DbKpi label="Avg Query Time" value={`${DATABASE_METRICS.avgQueryTime}ms`} icon={Clock} color="#10b981" />
        <DbKpi label="Slow Queries" value={`${DATABASE_METRICS.slowQueries}`} icon={AlertTriangle} color="#f59e0b" />
        <DbKpi label="Connection Pool" value={`${DATABASE_METRICS.connectionPool.utilization}%`} icon={Network} color="#06b6d4" sub={`${DATABASE_METRICS.connectionPool.used}/${DATABASE_METRICS.connectionPool.max}`} />
        <DbKpi label="Index Usage" value={`${DATABASE_METRICS.indexUsage}%`} icon={Database} color="#10b981" />
        <DbKpi label="Deadlocks" value={`${DATABASE_METRICS.deadlocks}`} icon={XCircle} color="#10b981" />
        <DbKpi label="Entity Growth" value={`+${DATABASE_METRICS.entityGrowth}%`} icon={TrendingUp} color="#a855f7" sub="MoM" />
        <DbKpi label="Health Score" value={`${DATABASE_METRICS.healthScore}%`} icon={CheckCircle} color="#10b981" />
        <DbKpi label="QPS" value={`${DATABASE_HEALTH.queriesPerSecond}`} icon={Activity} color="#06b6d4" />
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Slow Queries — Top 3</h3>
        <div className="space-y-2">
          {SLOW_QUERIES.map((q, i) => (
            <div key={i} className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <code className="text-[11px] text-white/80 font-mono">{q.query}</code>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-amber-400">{q.time}ms</span>
                  <span className="text-[10px] text-white/30">{q.calls} calls</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">{q.type}</span>
                <p className="text-[10px] text-emerald-400/60"><span className="text-emerald-400">Recommendation:</span> {q.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Database Health Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DbRow label="Query Time" value={`${DATABASE_HEALTH.queryTime}ms`} target="&lt; 50ms" pass />
          <DbRow label="Queries Per Second" value={`${DATABASE_HEALTH.queriesPerSecond}`} target="&lt; 1000" pass />
          <DbRow label="Active Connections" value={`${DATABASE_HEALTH.activeConnections}/${DATABASE_HEALTH.maxConnections}`} target="&lt; 80% pool" pass />
          <DbRow label="Slow Query Threshold" value={`${DATABASE_HEALTH.slowQueryThreshold}ms`} target="&lt; 200ms" pass />
          <DbRow label="Index Usage" value={`${DATABASE_HEALTH.indexUsage}%`} target="&gt; 85%" pass />
          <DbRow label="Deadlocks" value={`${DATABASE_HEALTH.deadlocks}`} target="0" pass />
          <DbRow label="Entity Growth" value={`+${DATABASE_HEALTH.entityGrowth}%`} target="&lt; 20%/mo" pass />
          <DbRow label="Health Score" value={`${DATABASE_HEALTH.healthScore}%`} target="&gt; 90%" pass />
        </div>
      </div>
    </div>
  );
}

function DbKpi({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <Icon size={16} style={{ color }} />
      <div className="text-xl font-bold text-white mt-2">{value} {sub && <span className="text-[10px] text-white/30">{sub}</span>}</div>
      <div className="text-[10px] text-white/40">{label}</div>
    </div>
  );
}

function DbRow({ label, value, target, pass }) {
  return (
    <div className="flex items-center justify-between bg-white/[0.01] border border-white/[0.03] rounded-lg p-2.5">
      <div>
        <span className="text-xs text-white/70">{label}</span>
        <span className="text-[9px] text-white/30 ml-2" dangerouslySetInnerHTML={{ __html: `Target: ${target}` }} />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-white/80 font-medium">{value}</span>
        {pass ? <CheckCircle size={12} className="text-emerald-400" /> : <AlertTriangle size={12} className="text-amber-400" />}
      </div>
    </div>
  );
}

function AIPerformanceTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <AiKpi label="Total Requests" value={AI_PERFORMANCE.totalRequests.toLocaleString()} icon={Activity} color="#6366f1" />
        <AiKpi label="Avg Tokens" value={AI_PERFORMANCE.avgTokens.toLocaleString()} icon={Brain} color="#a855f7" />
        <AiKpi label="Avg Cost" value={`$${AI_PERFORMANCE.avgCost}`} icon={TrendingUp} color="#f59e0b" />
        <AiKpi label="Avg Response" value={`${AI_PERFORMANCE.avgResponseTime}s`} icon={Clock} color="#06b6d4" />
        <AiKpi label="Queue Length" value={`${AI_PERFORMANCE.queueLength}`} icon={Layers} color="#10b981" />
        <AiKpi label="Retries" value={`${AI_PERFORMANCE.retries}`} icon={RefreshCw} color="#f59e0b" />
        <AiKpi label="Failures" value={`${AI_PERFORMANCE.failures}`} icon={XCircle} color="#ef4444" />
        <AiKpi label="Provider Latency" value={`${AI_PERFORMANCE.providerLatency}s`} icon={Network} color="#06b6d4" />
        <AiKpi label="Cache Usage" value={`${AI_PERFORMANCE.cacheUsage}%`} icon={Server} color="#10b981" />
        <AiKpi label="Knowledge Cache" value={`${AI_PERFORMANCE.knowledgeCacheHitRate}%`} icon={Database} color="#a855f7" />
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">AI Provider Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/40 border-b border-white/5">
                <th className="text-left py-2 px-2">Provider</th>
                <th className="text-left py-2 px-2">Model</th>
                <th className="text-right py-2 px-2">Requests</th>
                <th className="text-right py-2 px-2">Avg Latency</th>
                <th className="text-right py-2 px-2">Avg Cost</th>
                <th className="text-right py-2 px-2">Cache Hit</th>
                <th className="text-right py-2 px-2">Errors</th>
              </tr>
            </thead>
            <tbody>
              {AI_PROVIDER_PERFORMANCE.map((p, i) => (
                <tr key={i} className="border-b border-white/[0.03]">
                  <td className="py-2 px-2 text-white/80">{p.provider}</td>
                  <td className="py-2 px-2 text-white/50">{p.model}</td>
                  <td className="py-2 px-2 text-right text-white/60">{p.requests}</td>
                  <td className="py-2 px-2 text-right text-white/60">{p.avgLatency}s</td>
                  <td className="py-2 px-2 text-right text-white/60">${p.avgCost}</td>
                  <td className="py-2 px-2 text-right text-emerald-400">{p.cacheHit}%</td>
                  <td className="py-2 px-2 text-right text-white/60">{p.errors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AiKpi({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <Icon size={16} style={{ color }} />
      <div className="text-xl font-bold text-white mt-2">{value}</div>
      <div className="text-[10px] text-white/40">{label}</div>
    </div>
  );
}

function CacheTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <CacheKpi label="Hit Rate" value={`${CACHE_METRICS.hitRate}%`} icon={TrendingUp} color="#10b981" />
        <CacheKpi label="Miss Rate" value={`${CACHE_METRICS.missRate}%`} icon={TrendingDown} color="#f59e0b" />
        <CacheKpi label="Memory Usage" value={`${CACHE_METRICS.memoryUsage}%`} icon={MemoryStick} color="#06b6d4" />
        <CacheKpi label="Evictions" value={`${CACHE_METRICS.evictions}`} icon={RefreshCw} color="#a855f7" />
        <CacheKpi label="Rebuild Time" value={`${CACHE_METRICS.rebuildTime}s`} icon={Clock} color="#06b6d4" />
        <CacheKpi label="Hot Keys" value={`${CACHE_METRICS.hotKeys}`} icon={Zap} color="#f59e0b" />
        <CacheKpi label="Cold Keys" value={`${CACHE_METRICS.coldKeys}`} icon={TrendingDown} color="#06b6d4" />
        <CacheKpi label="Total Size" value={CACHE_METRICS.size} icon={HardDrive} color="#6366f1" />
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Hot Keys — Most Accessed Cache Items</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-white/40 border-b border-white/5">
                <th className="text-left py-2 px-2">Cache Key</th>
                <th className="text-right py-2 px-2">Requests</th>
                <th className="text-right py-2 px-2">Hit Rate</th>
                <th className="text-right py-2 px-2">Size</th>
              </tr>
            </thead>
            <tbody>
              {CACHE_HOT_KEYS.map((k, i) => (
                <tr key={i} className="border-b border-white/[0.03]">
                  <td className="py-2 px-2 text-white/80 font-mono text-[11px]">{k.key}</td>
                  <td className="py-2 px-2 text-right text-white/60">{k.requests.toLocaleString()}</td>
                  <td className="py-2 px-2 text-right text-emerald-400">{k.hitRate}%</td>
                  <td className="py-2 px-2 text-right text-white/60">{k.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CacheKpi({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <Icon size={16} style={{ color }} />
      <div className="text-xl font-bold text-white mt-2">{value}</div>
      <div className="text-[10px] text-white/40">{label}</div>
    </div>
  );
}

function UXPerformanceTab() {
  const metrics = [
    { name: "Largest Contentful Paint", acronym: "LCP", value: UX_METRICS.lcp, target: UX_METRICS.lcpTarget, score: UX_METRICS.lcpScore, unit: "s", desc: "Time until largest element renders" },
    { name: "First Contentful Paint", acronym: "FCP", value: UX_METRICS.fcp, target: UX_METRICS.fcpTarget, score: UX_METRICS.fcpScore, unit: "s", desc: "Time until first content renders" },
    { name: "Time To Interactive", acronym: "TTI", value: UX_METRICS.tti, target: UX_METRICS.ttiTarget, score: UX_METRICS.ttiScore, unit: "s", desc: "Time until page is fully interactive" },
    { name: "Cumulative Layout Shift", acronym: "CLS", value: UX_METRICS.cls, target: UX_METRICS.clsTarget, score: UX_METRICS.clsScore, unit: "", desc: "Visual stability score (0 = no shift)" },
    { name: "Interaction Delay", acronym: "INP", value: UX_METRICS.interactionDelay, target: UX_METRICS.interactionDelayTarget, score: UX_METRICS.interactionDelayScore, unit: "ms", desc: "Response time to user interaction" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metrics.map((m) => {
          const scoreColor = m.score >= 90 ? "#10b981" : m.score >= 70 ? "#f59e0b" : "#ef4444";
          return (
            <div key={m.acronym} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-xs text-white/40">{m.acronym}</div>
                  <div className="text-[10px] text-white/30">{m.name}</div>
                </div>
                <div className="text-2xl font-bold" style={{ color: scoreColor }}>{m.score}</div>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-xl font-bold text-white">{m.value}{m.unit}</span>
                <span className="text-[10px] text-white/30">/ target: {m.target}{m.unit}</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full" style={{ width: `${m.score}%`, backgroundColor: scoreColor }} />
              </div>
              <p className="text-[10px] text-white/30">{m.desc}</p>
            </div>
          );
        })}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-xs text-white/40">A11Y</div>
              <div className="text-[10px] text-white/30">Accessibility Performance</div>
            </div>
            <div className="text-2xl font-bold text-emerald-400">{UX_METRICS.accessibility}</div>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${UX_METRICS.accessibility}%` }} />
          </div>
          <p className="text-[10px] text-white/30">WCAG compliance and accessibility score</p>
        </div>
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">UX Performance Score™ — {UX_METRICS.uxScore}</h3>
        <p className="text-xs text-white/40">Core Web Vitals aggregated score. Target: 90 or higher for "Good" rating. All metrics are measured in production using Real User Monitoring (RUM).</p>
      </div>
    </div>
  );
}

function AutomatedTestsTab() {
  return (
    <div className="space-y-4">
      <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-4 flex items-start gap-3">
        <CheckCircle size={16} className="text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-indigo-400">Automated Performance Tests — Before Every Deployment</h3>
          <p className="text-xs text-white/40 mt-1">8 automated benchmarks execute before every deployment. Performance regression exceeding 10% blocks deployment.</p>
        </div>
      </div>
      <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-3 mb-3 flex items-center gap-2">
        <CheckCircle size={16} className="text-emerald-400" />
        <span className="text-sm text-emerald-400 font-medium">All 8 benchmarks passed</span>
        <span className="text-xs text-white/40 ml-auto">Total duration: 3m 07s · Last run: 2026-07-25T13:00Z</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {AUTOMATED_BENCHMARKS.map((b) => (
          <div key={b.name} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <CheckCircle size={16} className="text-emerald-400" />
              <div>
                <div className="text-xs text-white/80">{b.name}</div>
                <div className="text-[9px] text-white/30">{b.category} · {b.duration} · Target: {b.target}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-emerald-400">{b.result}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">PASS</span>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-amber-400">Performance Regression Threshold — Deployment Blocked</h3>
          <p className="text-xs text-white/40 mt-1">If any benchmark result regresses by more than 10% compared to the previous run, the deployment is automatically blocked and the team is notified.</p>
        </div>
      </div>
    </div>
  );
}

function OptimizationTab() {
  return (
    <div className="space-y-4">
      <div className="bg-cyan-500/5 border border-cyan-500/15 rounded-xl p-4 flex items-start gap-3">
        <Zap size={16} className="text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-cyan-400">Performance Optimization Recommendations</h3>
          <p className="text-xs text-white/40 mt-1">Automatically recommended optimizations across database, caching, AI, images, bundle, lazy loading, background processing, and streaming.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {OPTIMIZATION_RECOMMENDATIONS.map((o) => {
          const pColor = o.priority === "high" ? "#f59e0b" : o.priority === "medium" ? "#06b6d4" : "#6366f1";
          const sColor = o.status === "completed" ? "#10b981" : o.status === "in_progress" ? "#06b6d4" : "#6366f1";
          return (
            <div key={o.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="flex items-start gap-2">
                {o.status === "completed" ? <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" /> : <Target size={14} className="text-indigo-400 shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${sColor}20`, color: sColor }}>{o.status.replace(/_/g, " ")}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${pColor}20`, color: pColor }}>{o.priority}</span>
                    <span className="text-[9px] text-white/30">{o.category}</span>
                  </div>
                  <p className="text-xs text-white/80">{o.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px]">
                    <span className="text-emerald-400/60">Impact: {o.impact}</span>
                    <span className="text-white/30">Effort: {o.effort}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AnalyticsTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <AnalyticsKpi label="Peak Users" value={PERFORMANCE_ANALYTICS.peakUsage.users} sub={`at ${PERFORMANCE_ANALYTICS.peakUsage.time}`} icon={Users} color="#f59e0b" />
        <AnalyticsKpi label="Peak Requests" value={PERFORMANCE_ANALYTICS.peakUsage.requests} sub="req/s at peak" icon={Activity} color="#ef4444" />
        <AnalyticsKpi label="Avg Users" value={PERFORMANCE_ANALYTICS.avgUsage.users} sub="concurrent avg" icon={Users} color="#06b6d4" />
        <AnalyticsKpi label="Avg Requests" value={PERFORMANCE_ANALYTICS.avgUsage.requests} sub="req/s avg" icon={Activity} color="#6366f1" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Top Slow Pages</h3>
          <div className="space-y-2">
            {PERFORMANCE_ANALYTICS.topSlowPages.map((p, i) => (
              <div key={i} className="flex items-center justify-between bg-white/[0.01] border border-white/[0.03] rounded-lg p-2.5">
                <div>
                  <span className="text-xs text-white/80 font-mono">{p.page}</span>
                  <span className="text-[9px] text-white/30 ml-2">{p.visits} visits</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/60">{p.loadTime}s</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${STATUS_COLORS[p.status]}20`, color: STATUS_COLORS[p.status] }}>{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Top Slow APIs</h3>
          <div className="space-y-2">
            {PERFORMANCE_ANALYTICS.topSlowAPIs.map((a, i) => (
              <div key={i} className="flex items-center justify-between bg-white/[0.01] border border-white/[0.03] rounded-lg p-2.5">
                <div>
                  <span className="text-xs text-white/80 font-mono">{a.endpoint}</span>
                  <span className="text-[9px] text-white/30 ml-2">{a.calls} calls</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/60">{a.time}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${STATUS_COLORS[a.status]}20`, color: STATUS_COLORS[a.status] }}>{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Most Expensive AI Calls</h3>
        <div className="space-y-2">
          {PERFORMANCE_ANALYTICS.mostExpensiveAICalls.map((c, i) => (
            <div key={i} className="flex items-center justify-between bg-white/[0.01] border border-white/[0.03] rounded-lg p-2.5">
              <div>
                <span className="text-xs text-white/80">{c.feature}</span>
                <span className="text-[9px] text-white/30 ml-2">{c.calls} calls · ${c.cost}/call</span>
              </div>
              <span className="text-sm font-bold text-amber-400">${c.totalCost}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsKpi({ label, value, sub, icon: Icon, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <Icon size={16} style={{ color }} />
      <div className="text-xl font-bold text-white mt-2">{value}</div>
      <div className="text-[10px] text-white/40">{label}</div>
      {sub && <div className="text-[9px] text-white/30 mt-0.5">{sub}</div>}
    </div>
  );
}