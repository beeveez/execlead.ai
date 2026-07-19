import React, { useMemo } from 'react';
import { Activity, AlertTriangle, CheckCircle, XCircle, Zap, Clock, Cpu, TrendingUp } from 'lucide-react';
import { ACTIVITY_CATEGORIES, SEVERITIES } from '@/lib/platformActivityConfig';

export default function ActivityAnalytics({ activities }) {
  const stats = useMemo(() => computeStats(activities), [activities]);

  return (
    <div className="space-y-4">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <KPI icon={Activity} label="Total Events" value={stats.total} color="text-indigo-400" />
        <KPI icon={CheckCircle} label="Success" value={stats.success} color="text-emerald-400" />
        <KPI icon={AlertTriangle} label="Warnings" value={stats.warnings} color="text-amber-400" />
        <KPI icon={XCircle} label="Errors" value={stats.errors} color="text-red-400" />
        <KPI icon={Zap} label="Critical" value={stats.critical} color="text-red-500" />
        <KPI icon={Cpu} label="AI Credits" value={stats.totalAiCredits} color="text-fuchsia-400" />
      </div>

      {/* Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DistributionCard title="Top Categories" data={stats.topCategories} />
        <DistributionCard title="Top Modules" data={stats.topModules} />
      </div>

      {/* Severity Breakdown + Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <h3 className="text-white/60 text-sm font-medium mb-3">Severity Distribution</h3>
          <div className="space-y-2">
            {SEVERITIES.map((sev) => {
              const count = stats.severityCounts[sev.value] || 0;
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={sev.value} className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${sev.dot}`} />
                  <span className="text-white/50 text-xs w-24">{sev.label}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${sev.dot} opacity-60`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-white/40 text-xs w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <h3 className="text-white/60 text-sm font-medium mb-3">Performance Metrics</h3>
          <div className="space-y-3">
            <PerfMetric label="Avg Duration" value={`${stats.avgDuration.toFixed(0)} ms`} icon={Clock} />
            <PerfMetric label="Avg Execution Time" value={`${stats.avgExecTime.toFixed(0)} ms`} icon={Clock} />
            <PerfMetric label="Total AI Credits" value={String(stats.totalAiCredits)} icon={Cpu} />
            <PerfMetric label="Total AI Cost" value={`$${stats.totalAiCost.toFixed(4)}`} icon={TrendingUp} />
            <PerfMetric label="Cache Hit Rate" value={`${stats.cacheHitRate.toFixed(1)}%`} icon={CheckCircle} />
            <PerfMetric label="Error Rate" value={`${stats.errorRate.toFixed(1)}%`} icon={XCircle} />
          </div>
        </div>
      </div>

      {/* Top Users */}
      <DistributionCard title="Top Users" data={stats.topUsers} />
    </div>
  );
}

function KPI({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
      <Icon size={16} className={color} />
      <div className="text-white font-bold text-lg mt-1">{value}</div>
      <div className="text-white/30 text-xs">{label}</div>
    </div>
  );
}

function DistributionCard({ title, data }) {
  const max = data.length > 0 ? data[0].count : 1;
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <h3 className="text-white/60 text-sm font-medium mb-3">{title}</h3>
      {data.length === 0 ? (
        <p className="text-white/30 text-xs">No data</p>
      ) : (
        <div className="space-y-2">
          {data.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-white/50 text-xs w-32 truncate">{item.label}</span>
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-indigo-500/40" style={{ width: `${(item.count / max) * 100}%` }} />
              </div>
              <span className="text-white/40 text-xs w-8 text-right">{item.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PerfMetric({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon size={12} className="text-white/30" />
        <span className="text-white/50 text-xs">{label}</span>
      </div>
      <span className="text-white/70 text-sm font-medium">{value}</span>
    </div>
  );
}

function computeStats(activities) {
  const total = activities.length;
  const severityCounts = {};
  const categoryCounts = {};
  const moduleCounts = {};
  const userCounts = {};
  let success = 0, warnings = 0, errors = 0, critical = 0;
  let totalDuration = 0, totalExecTime = 0, totalAiCredits = 0, totalAiCost = 0;
  let cacheHits = 0, cacheTotal = 0;

  for (const a of activities) {
    severityCounts[a.severity] = (severityCounts[a.severity] || 0) + 1;
    categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
    if (a.module) moduleCounts[a.module] = (moduleCounts[a.module] || 0) + 1;
    if (a.performed_by_name) userCounts[a.performed_by_name] = (userCounts[a.performed_by_name] || 0) + 1;

    if (a.severity === 'success') success++;
    if (a.severity === 'warning') warnings++;
    if (a.severity === 'error' || a.severity === 'critical' || a.severity === 'emergency') errors++;
    if (a.severity === 'critical' || a.severity === 'emergency') critical++;

    totalDuration += a.duration_ms || 0;
    totalExecTime += a.execution_time_ms || 0;
    totalAiCredits += a.ai_credits_used || 0;
    totalAiCost += a.ai_cost || 0;

    cacheTotal++;
    if (a.cache_hit) cacheHits++;
  }

  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([k, v]) => ({ label: ACTIVITY_CATEGORIES.find((c) => c.value === k)?.label || k, count: v }));

  const topModules = Object.entries(moduleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([k, v]) => ({ label: k, count: v }));

  const topUsers = Object.entries(userCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([k, v]) => ({ label: k, count: v }));

  return {
    total, success, warnings, errors, critical,
    totalAiCredits, totalAiCost,
    avgDuration: total > 0 ? totalDuration / total : 0,
    avgExecTime: total > 0 ? totalExecTime / total : 0,
    cacheHitRate: cacheTotal > 0 ? (cacheHits / cacheTotal) * 100 : 0,
    errorRate: total > 0 ? (errors / total) * 100 : 0,
    severityCounts, topCategories, topModules, topUsers,
  };
}