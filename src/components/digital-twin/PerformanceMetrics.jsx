import React, { useState } from 'react';
import {
  Activity, ChevronDown, ChevronRight, Zap, Clock, Database, RefreshCw,
  CheckCircle2, AlertCircle, AlertTriangle, Server, Cpu, Layers, Gauge,
} from 'lucide-react';
import { formatDuration, formatCacheAge } from '@/lib/digitalTwinCache';

const REFRESH_META = {
  idle:      { icon: Clock,       color: '#64748b', label: 'Idle' },
  refreshing:{ icon: RefreshCw,    color: '#3b82f6', label: 'Refreshing...' },
  completed: { icon: CheckCircle2, color: '#10b981', label: 'Completed' },
  error:     { icon: AlertCircle,  color: '#ef4444', label: 'Error' },
};

function MetricCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={10} style={{ color }} />
        <span className="text-[8px] uppercase tracking-wider text-white/30">{label}</span>
      </div>
      <div className="text-xs font-bold" style={{ color }}>{value}</div>
      {sub && <div className="text-[8px] text-white/30 mt-0.5">{sub}</div>}
    </div>
  );
}

function TimingRow({ entry }) {
  const isSlow = entry.duration > 500;
  const isError = entry.status === 'error';
  const color = isError ? '#ef4444' : isSlow ? '#f59e0b' : '#10b981';
  const pct = Math.min(100, (entry.duration / 2000) * 100); // scale to 2s max

  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-[10px] text-white/50 w-28 flex-shrink-0 truncate">{entry.name}</span>
      <div className="flex-1 h-3 bg-white/[0.02] rounded relative overflow-hidden">
        <div
          className="h-full rounded transition-all"
          style={{ width: `${pct}%`, background: color, opacity: 0.6 }}
        />
      </div>
      <span className="text-[10px] font-mono w-16 text-right" style={{ color }}>
        {formatDuration(entry.duration)}
      </span>
      <span className="text-[9px] text-white/30 w-12 text-right">{entry.recordCount} recs</span>
      {isSlow && (
        <span className="flex items-center gap-0.5 text-[8px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-1 py-0.5">
          <AlertTriangle size={8} />
          BLOCKING
        </span>
      )}
      {isError && (
        <span className="text-[8px] text-red-400 bg-red-500/10 border border-red-500/20 rounded px-1 py-0.5">
          ERROR
        </span>
      )}
    </div>
  );
}

export default function PerformanceMetrics({ metrics, cachedAt }) {
  const [expanded, setExpanded] = useState(false);
  const [showTimings, setShowTimings] = useState(false);

  const status = REFRESH_META[metrics.backgroundRefreshStatus] || REFRESH_META.idle;
  const StatusIcon = status.icon;

  const hasTimings = metrics.dataSourceTimings && metrics.dataSourceTimings.length > 0;
  const hasBlocking = metrics.blockingRequests && metrics.blockingRequests.length > 0;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-white/[0.02] transition-colors"
      >
        {expanded ? <ChevronDown size={12} className="text-white/30" /> : <ChevronRight size={12} className="text-white/30" />}
        <Activity size={12} className="text-emerald-400" />
        <span className="text-[11px] font-medium text-white/60">Digital Twin Performance Diagnostics™</span>
        <span className="text-[9px] text-white/30 ml-auto">Developer Mode</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* ── Top-Level Metrics Grid ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <MetricCard
              icon={Clock}
              label="Total Load Time"
              value={formatDuration(metrics.totalLoadTime)}
              color={metrics.totalLoadTime > 3000 ? '#ef4444' : metrics.totalLoadTime > 1500 ? '#f59e0b' : '#10b981'}
              sub={metrics.skippedRebuild ? 'Cache hit (TTL)' : 'Full rebuild'}
            />
            <MetricCard
              icon={Zap}
              label="Cache"
              value={metrics.cacheHit ? `Hit · ${formatCacheAge(cachedAt)}` : 'Miss'}
              color={metrics.cacheHit ? (metrics.cacheStale ? '#f59e0b' : '#10b981') : '#f59e0b'}
              sub={metrics.cacheStale ? 'Stale — rebuilt' : 'Fresh'}
            />
            <MetricCard
              icon={Database}
              label="Core Build"
              value={formatDuration(metrics.coreBuildTime)}
              color="#a855f7"
              sub="Scores only"
            />
            <MetricCard
              icon={Layers}
              label="Enrichment"
              value={formatDuration(metrics.enrichmentTime)}
              color="#06b6d4"
              sub="Forecast + Intel"
            />
            <MetricCard
              icon={Clock}
              label="LLM Duration"
              value={formatDuration(metrics.llmResponseTime)}
              color={metrics.llmResponseTime > 2000 ? '#ef4444' : '#06b6d4'}
            />
            <MetricCard
              icon={Database}
              label="Data Sources"
              value={`${metrics.dataSourcesLoaded}/${metrics.dataSourcesTotal}`}
              color={metrics.dataSourcesLoaded === metrics.dataSourcesTotal ? '#10b981' : '#f59e0b'}
              sub={`${metrics.dataSourcesTotalRequested} requested`}
            />
            <MetricCard
              icon={StatusIcon}
              label="Background Refresh"
              value={status.label}
              color={status.color}
            />
            <MetricCard
              icon={Activity}
              label="First Render"
              value={formatDuration(metrics.firstRenderTime)}
              color="#10b981"
              sub={metrics.cacheHit ? 'From cache' : 'After fetch'}
            />
          </div>

          {/* ── Architecture Status ── */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`flex items-center gap-1 text-[9px] px-2 py-1 rounded border ${
              metrics.parallelRequests
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
            }`}>
              <Cpu size={9} />
              {metrics.parallelRequests ? 'Parallel (Promise.all)' : 'Sequential'}
            </span>
            {metrics.skippedRebuild && (
              <span className="flex items-center gap-1 text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">
                <CheckCircle2 size={9} />
                Cache TTL Hit — Rebuild Skipped
              </span>
            )}
            {hasBlocking && (
              <span className="flex items-center gap-1 text-[9px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded">
                <AlertTriangle size={9} />
                {metrics.blockingRequests.length} Blocking Request(s) &gt;500ms
              </span>
            )}
            {metrics.slowestQuery && (
              <span className="flex items-center gap-1 text-[9px] text-white/40 bg-white/[0.02] border border-white/5 px-2 py-1 rounded">
                <Gauge size={9} />
                Slowest: {metrics.slowestQuery.name} ({formatDuration(metrics.slowestQuery.duration)})
              </span>
            )}
          </div>

          {/* ── Per-Source Timings ── */}
          {hasTimings && (
            <div>
              <button
                onClick={() => setShowTimings(!showTimings)}
                className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40 hover:text-white/60 transition-colors mb-1"
              >
                {showTimings ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                <Server size={10} />
                Data Source Timings ({metrics.dataSourceTimings.length})
              </button>
              {showTimings && (
                <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2 space-y-0.5">
                  <div className="flex items-center gap-2 py-1 border-b border-white/5 mb-1">
                    <span className="text-[8px] uppercase tracking-wider text-white/30 w-28">Source</span>
                    <span className="text-[8px] uppercase tracking-wider text-white/30 flex-1">Duration</span>
                    <span className="text-[8px] uppercase tracking-wider text-white/30 w-16 text-right">Time</span>
                    <span className="text-[8px] uppercase tracking-wider text-white/30 w-12 text-right">Records</span>
                    <span className="text-[8px] uppercase tracking-wider text-white/30 w-20">Status</span>
                  </div>
                  {metrics.dataSourceTimings.map((entry, i) => (
                    <TimingRow key={i} entry={entry} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Blocking Requests Detail ── */}
          {hasBlocking && showTimings && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/70 mb-1 flex items-center gap-1">
                <AlertTriangle size={10} />
                Root Cause Analysis — Requests Exceeding 500ms
              </div>
              <div className="space-y-1">
                {metrics.blockingRequests.map((req, i) => (
                  <div key={i} className="bg-amber-500/[0.03] border border-amber-500/10 rounded-lg p-2 flex items-center gap-2">
                    <AlertTriangle size={10} className="text-amber-400 flex-shrink-0" />
                    <span className="text-[10px] text-white/60 font-medium">{req.name}</span>
                    <span className="text-[10px] text-amber-400 font-mono ml-auto">{formatDuration(req.duration)}</span>
                  </div>
                ))}
              </div>
              <div className="text-[9px] text-white/30 mt-1.5">
                Blocking requests delay the entire <code className="text-white/40">Promise.all()</code> resolution.
                Consider reducing result limits or splitting into priority tiers.
              </div>
            </div>
          )}

          {/* ── Rebuild Trigger ── */}
          {metrics.rebuildReason && (
            <div className="text-[9px] text-white/30">
              Last rebuild trigger: <span className="text-white/50">{metrics.rebuildReason}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}