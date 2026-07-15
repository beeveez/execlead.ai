import React, { useState } from 'react';
import { Activity, ChevronDown, ChevronRight, Zap, Clock, Database, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDuration, formatCacheAge } from '@/lib/digitalTwinCache';

/**
 * Performance Metrics™ panel — Developer Mode only.
 * Displays load times, cache status, build metrics, and refresh status.
 */
export default function PerformanceMetrics({ metrics, cachedAt }) {
  const [expanded, setExpanded] = useState(false);

  const refreshStatusMeta = {
    idle: { icon: Clock, color: '#64748b', label: 'Idle' },
    refreshing: { icon: RefreshCw, color: '#3b82f6', label: 'Refreshing...' },
    completed: { icon: CheckCircle2, color: '#10b981', label: 'Completed' },
    error: { icon: AlertCircle, color: '#ef4444', label: 'Error' },
  };

  const status = refreshStatusMeta[metrics.backgroundRefreshStatus] || refreshStatusMeta.idle;
  const StatusIcon = status.icon;

  const rows = [
    { icon: Clock, label: 'Total Load Time', value: formatDuration(metrics.totalLoadTime), color: '#3b82f6' },
    { icon: Zap, label: 'Cache', value: metrics.cacheHit ? `Hit · ${formatCacheAge(cachedAt)}` : 'Miss', color: metrics.cacheHit ? '#10b981' : '#f59e0b' },
    { icon: Database, label: 'Twin Build Time', value: formatDuration(metrics.twinBuildTime), color: '#a855f7' },
    { icon: Clock, label: 'LLM Response Time', value: formatDuration(metrics.llmResponseTime), color: '#06b6d4' },
    { icon: Database, label: 'Data Sources', value: `${metrics.dataSourcesLoaded}/${metrics.dataSourcesTotal}`, color: '#8b5cf6' },
    { icon: StatusIcon, label: 'Background Refresh', value: status.label, color: status.color },
    { icon: Activity, label: 'First Render', value: formatDuration(metrics.firstRenderTime), color: '#10b981' },
  ];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-white/[0.02] transition-colors"
      >
        {expanded ? <ChevronDown size={12} className="text-white/30" /> : <ChevronRight size={12} className="text-white/30" />}
        <Activity size={12} className="text-emerald-400" />
        <span className="text-[11px] font-medium text-white/60">Performance Metrics™</span>
        <span className="text-[9px] text-white/30 ml-auto">Developer Mode</span>
      </button>
      {expanded && (
        <div className="px-4 pb-3 grid grid-cols-2 md:grid-cols-4 gap-2">
          {rows.map((row, i) => {
            const Icon = row.icon;
            return (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={10} style={{ color: row.color }} />
                  <span className="text-[8px] uppercase tracking-wider text-white/30">{row.label}</span>
                </div>
                <div className="text-xs font-bold" style={{ color: row.color }}>{row.value}</div>
              </div>
            );
          })}
          {metrics.rebuildReason && (
            <div className="col-span-full text-[9px] text-white/30 mt-1">
              Last rebuild trigger: <span className="text-white/50">{metrics.rebuildReason}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}