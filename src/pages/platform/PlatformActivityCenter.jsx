import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from '@/components/ui/use-toast';
import {
  Activity, BarChart3, Brain, Download, Pause, Play, RefreshCw, Radio,
  Shield, Settings,
} from 'lucide-react';
import ActivityTimeline from '@/components/platform-activity/ActivityTimeline';
import ActivityFilters from '@/components/platform-activity/ActivityFilters';
import ActivityDetailDrawer from '@/components/platform-activity/ActivityDetailDrawer';
import ActivityAnalytics from '@/components/platform-activity/ActivityAnalytics';
import ActivityInsights from '@/components/platform-activity/ActivityInsights';
import { TIMEFRAMES } from '@/lib/platformActivityConfig';

const PAGE_SIZE = 50;

export default function PlatformActivityCenter() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline');
  const [livePaused, setLivePaused] = useState(false);
  const [liveCount, setLiveCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const buildQuery = useCallback((f) => {
    const query = {};
    if (f.category) query.category = f.category;
    if (f.severity) query.severity = f.severity;
    if (f.status) query.status = f.status;
    if (f.workspace) query.workspace = f.workspace;
    if (f.business_impact) query.business_impact = f.business_impact;
    if (f.module) query.module = f.module;
    if (f.performed_by_name) query.performed_by_name = f.performed_by_name;
    if (f.target_entity) query.target_entity = f.target_entity;
    if (f.search) query.action = { $regex: f.search, $options: 'i' };
    if (f.timeframe && f.timeframe !== 'all') {
      const tf = TIMEFRAMES.find((t) => t.value === f.timeframe);
      if (tf?.hours) {
        query.created_date = { $gte: new Date(Date.now() - tf.hours * 3600 * 1000).toISOString() };
      }
    }
    return query;
  }, []);

  const loadActivities = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const query = buildQuery(filters);
      const data = await base44.entities.PlatformActivity.filter(query, '-created_date', PAGE_SIZE);
      setActivities(Array.isArray(data) ? data : []);
      setHasMore(data && data.length === PAGE_SIZE);
      if (reset) setLiveCount(0);
    } catch (err) {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [filters, buildQuery]);

  useEffect(() => { loadActivities(true); }, [loadActivities]);

  // Realtime subscription
  useEffect(() => {
    if (livePaused) return;
    const unsubscribe = base44.entities.PlatformActivity.subscribe((event) => {
      setLiveCount((c) => c + 1);
      if (event.type === 'create') {
        setActivities((prev) => {
          if (prev.length > 0 && event.data) {
            return [event.data, ...prev].slice(0, 200);
          }
          return prev;
        });
      }
    });
    return unsubscribe;
  }, [livePaused]);

  const handleLoadMore = async () => {
    if (activities.length === 0) return;
    try {
      const lastDate = activities[activities.length - 1]?.created_date;
      const query = { ...buildQuery(filters), created_date: { $lt: lastDate } };
      const more = await base44.entities.PlatformActivity.filter(query, '-created_date', PAGE_SIZE);
      if (Array.isArray(more) && more.length > 0) {
        setActivities((prev) => [...prev, ...more]);
        setHasMore(more.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      toast({ title: 'Load More Failed', description: err.message, variant: 'destructive' });
    }
  };

  const handleExport = (format) => {
    const data = activities.map((a) => ({
      ActivityID: a.activity_id || '',
      Timestamp: a.created_date || '',
      Category: a.category || '',
      Severity: a.severity || '',
      Status: a.status || '',
      Workspace: a.workspace || '',
      Module: a.module || '',
      Action: a.action || '',
      PerformedBy: a.performed_by_name || '',
      TargetUser: a.target_user_name || '',
      TargetEntity: a.target_entity || '',
      DurationMs: a.duration_ms || 0,
      RiskScore: a.risk_score || 0,
      BusinessImpact: a.business_impact || '',
      AICredits: a.ai_credits_used || 0,
      Model: a.model_used || '',
      Description: a.description || '',
    }));

    if (format === 'json') {
      downloadFile(JSON.stringify(data, null, 2), 'platform-activities.json', 'application/json');
    } else {
      const headers = Object.keys(data[0] || {});
      const csv = [headers.join(','), ...data.map((d) => headers.map((h) => `"${String(d[h] || '').replace(/"/g, '""')}"`).join(','))].join('\n');
      downloadFile(csv, 'platform-activities.csv', 'text/csv');
    }
    toast({ title: 'Export Complete', description: `${data.length} activities exported as ${format.toUpperCase()}.` });
  };

  const tabs = [
    { id: 'timeline', label: 'Timeline', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'insights', label: 'Smart Insights', icon: Brain },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-1">
            <Shield size={12} className="text-indigo-400" /> Operations Workspace
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity size={22} className="text-indigo-400" /> Platform Activity Center™
          </h1>
          <p className="text-white/40 text-sm mt-1">Unified operational timeline — every action, observable and auditable.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <button
            onClick={() => setLivePaused(!livePaused)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-colors ${
              livePaused
                ? 'bg-white/5 border-white/10 text-white/40'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}
          >
            {livePaused ? <Pause size={14} /> : <Radio size={14} className="animate-pulse" />}
            {livePaused ? 'Paused' : 'Live'}
            {liveCount > 0 && !livePaused && (
              <span className="bg-emerald-500 text-white text-xs px-1.5 rounded-full">{liveCount}</span>
            )}
          </button>
          <button
            onClick={() => loadActivities(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white/50 hover:text-white/70"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white/50 hover:text-white/70"
          >
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white/[0.02] border border-white/5 rounded-xl p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-500/10 text-indigo-300'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === 'timeline' && (
        <>
          <ActivityFilters filters={filters} onFilterChange={setFilters} resultCount={activities.length} />
          <ActivityTimeline
            activities={activities}
            loading={loading}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            onSelect={setSelected}
            selectedId={selected?.id}
          />
        </>
      )}
      {activeTab === 'analytics' && <ActivityAnalytics activities={activities} />}
      {activeTab === 'insights' && <ActivityInsights activities={activities} />}

      {/* Detail Drawer */}
      {selected && <ActivityDetailDrawer activity={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}