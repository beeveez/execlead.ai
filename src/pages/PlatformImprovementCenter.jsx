import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { getAllEnrichedMetrics, getScoreStatus, getScoreBarColor, METRIC_CATEGORIES } from '@/lib/metricIntelligenceEngine';
import { openMetricDrawer } from '@/lib/metricDrawerStore';
import { toast } from '@/components/ui/use-toast';
import {
  BarChart3, Filter, Download, TrendingUp, AlertTriangle,
  CheckCircle2, ArrowRight, Loader2, Target, Search,
} from 'lucide-react';

const PRIORITY_FILTERS = [
  { value: 'all', label: 'All Metrics' },
  { value: 'critical', label: 'Critical (<75%)' },
  { value: 'improvement', label: 'Needs Improvement (75-89%)' },
  { value: 'optimization', label: 'Optimization (90-99%)' },
  { value: 'healthy', label: 'Healthy (100%)' },
];

export default function PlatformImprovementCenter() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [groupBy, setGroupBy] = useState('category');

  useEffect(() => {
    const load = async () => {
      try {
        const enriched = await getAllEnrichedMetrics(base44);
        setMetrics(enriched);
      } catch (err) {
        setMetrics([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Summary stats
  const stats = useMemo(() => {
    if (!metrics.length) return { total: 0, critical: 0, improvement: 0, optimization: 0, healthy: 0, avgScore: 0 };
    const critical = metrics.filter((m) => m.current < 75).length;
    const improvement = metrics.filter((m) => m.current >= 75 && m.current < 90).length;
    const optimization = metrics.filter((m) => m.current >= 90 && m.current < 100).length;
    const healthy = metrics.filter((m) => m.current >= 100).length;
    const avgScore = Math.round(metrics.reduce((s, m) => s + m.current, 0) / metrics.length);
    return { total: metrics.length, critical, improvement, optimization, healthy, avgScore };
  }, [metrics]);

  // Filtered metrics
  const filtered = useMemo(() => {
    return metrics
      .filter((m) => {
        if (priorityFilter === 'critical') return m.current < 75;
        if (priorityFilter === 'improvement') return m.current >= 75 && m.current < 90;
        if (priorityFilter === 'optimization') return m.current >= 90 && m.current < 100;
        if (priorityFilter === 'healthy') return m.current >= 100;
        return true;
      })
      .filter((m) => categoryFilter === 'all' || m.category === categoryFilter)
      .filter((m) => !search || m.name.toLowerCase().includes(search.toLowerCase()));
  }, [metrics, priorityFilter, categoryFilter, search]);

  // Grouped metrics
  const grouped = useMemo(() => {
    if (groupBy === 'none') return null;
    const map = new Map();
    for (const m of filtered) {
      const key = m[groupBy] || 'Uncategorized';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(m);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered, groupBy]);

  const handleExport = () => {
    const data = filtered.map((m) => ({
      Metric: m.name,
      Category: m.category,
      CurrentScore: m.current,
      Target: m.target,
      Status: m.status.label,
      EstimatedFuture: m.estimatedFutureScore,
      PotentialImprovement: m.totalImprovement,
      OpenActions: m.recommendedActions.length,
      CompletedActions: m.completedActions,
      Module: m.module || '',
    }));
    const headers = Object.keys(data[0] || {});
    const csv = [headers.join(','), ...data.map((d) => headers.map((h) => `"${String(d[h] || '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'platform-improvement-report.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Export Complete', description: `${data.length} metrics exported.` });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
            <BarChart3 size={12} className="text-indigo-400" /> Operations Workspace
          </div>
          <h1 className="text-2xl font-bold text-white">Platform Improvement Center™</h1>
          <p className="text-white/40 text-sm mt-1">Every metric below target — aggregated, explained, and actionable.</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white/50 hover:text-white/70"
        >
          <Download size={14} /> Export Report
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <SummaryStat label="Total Metrics" value={stats.total} icon={BarChart3} color="text-white" bg="bg-white/5" />
        <SummaryStat label="Critical" value={stats.critical} icon={AlertTriangle} color="text-red-400" bg="bg-red-500/10" />
        <SummaryStat label="Needs Improvement" value={stats.improvement} icon={Target} color="text-amber-400" bg="bg-amber-500/10" />
        <SummaryStat label="Optimization" value={stats.optimization} icon={TrendingUp} color="text-blue-400" bg="bg-blue-500/10" />
        <SummaryStat label="Avg Score" value={`${stats.avgScore}%`} icon={CheckCircle2} color="text-emerald-400" bg="bg-emerald-500/10" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search metrics..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          />
        </div>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none">
          {PRIORITY_FILTERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none">
          <option value="all">All Categories</option>
          {METRIC_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <div className="flex items-center gap-1.5">
          <Filter size={12} className="text-white/30" />
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none">
            <option value="category">Group by Category</option>
            <option value="none">No Grouping</option>
          </select>
        </div>
      </div>

      {/* Metrics */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <CheckCircle2 size={32} className="text-emerald-400/50 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No metrics match your filters.</p>
        </div>
      ) : grouped ? (
        <div className="space-y-4">
          {grouped.map(([key, items]) => (
            <div key={key}>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-white/60 text-sm font-semibold capitalize">{key}</h3>
                <span className="text-white/20 text-xs">{items.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((m) => <MetricRow key={m.id} metric={m} />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((m) => <MetricRow key={m.id} metric={m} />)}
        </div>
      )}
    </div>
  );
}

function SummaryStat({ label, value, icon: Icon, color, bg }) {
  return (
    <div className={`${bg} border border-white/5 rounded-xl p-3`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={12} className={color} />
        <span className="text-white/30 text-xs uppercase tracking-wider">{label}</span>
      </div>
      <span className={`text-xl font-bold ${color}`}>{value}</span>
    </div>
  );
}

function MetricRow({ metric }) {
  const status = metric.status;
  const isClickable = metric.current < 100;

  return (
    <button
      onClick={() => isClickable && openMetricDrawer(metric.id, metric.current, metric.previous, metric.name)}
      disabled={!isClickable}
      className={`text-left bg-white/[0.02] border border-white/5 rounded-xl p-4 overflow-hidden relative transition-all ${
        isClickable ? 'hover:border-white/15 hover:bg-white/[0.04] cursor-pointer' : 'cursor-default'
      }`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${getScoreBarColor(metric.current)}`} />

      <div className="flex items-center justify-between mb-2">
        <span className="text-white/60 text-sm font-medium truncate">{metric.name}</span>
        <span className={`text-lg font-bold ${status.textClass}`}>{metric.current}%</span>
      </div>

      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
        <div className={`h-full rounded-full ${getScoreBarColor(metric.current)}`} style={{ width: `${metric.current}%` }} />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className={`px-1.5 py-0.5 rounded ${status.bgLight} ${status.textClass} font-medium`}>{status.label}</span>
        {metric.estimatedFutureScore > metric.current && (
          <span className="text-emerald-400/60">→ {metric.estimatedFutureScore}%</span>
        )}
      </div>

      {isClickable && metric.recommendedActions.length > 0 && (
        <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-1 text-xs text-white/30">
          <AlertTriangle size={10} />
          {metric.recommendedActions.length} action{metric.recommendedActions.length !== 1 ? 's' : ''} available
          <ArrowRight size={10} className="ml-auto" />
        </div>
      )}
    </button>
  );
}