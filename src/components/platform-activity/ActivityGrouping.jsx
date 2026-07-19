import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const GROUP_OPTIONS = [
  { value: 'none', label: 'No Grouping' },
  { value: 'category', label: 'Category' },
  { value: 'workspace', label: 'Workspace' },
  { value: 'module', label: 'Module' },
  { value: 'performed_by_name', label: 'User' },
  { value: 'date', label: 'Date' },
  { value: 'severity', label: 'Severity' },
  { value: 'status', label: 'Status' },
  { value: 'risk_score', label: 'Risk Level' },
];

const SEVERITY_ORDER = { emergency: 0, critical: 1, error: 2, warning: 3, success: 4, information: 5 };

function getGroupKey(activity, field) {
  if (field === 'date') {
    const d = new Date(activity.created_date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
  if (field === 'risk_score') {
    const r = activity.risk_score || 0;
    if (r >= 70) return 'Critical Risk (70-100)';
    if (r >= 40) return 'High Risk (40-69)';
    if (r >= 20) return 'Medium Risk (20-39)';
    if (r > 0) return 'Low Risk (1-19)';
    return 'No Risk (0)';
  }
  return activity[field] || 'Uncategorized';
}

function getGroupOrder(key, field) {
  if (field === 'severity') return SEVERITY_ORDER[key] ?? 99;
  if (field === 'risk_score') {
    const order = { 'Critical Risk (70-100)': 0, 'High Risk (40-69)': 1, 'Medium Risk (20-39)': 2, 'Low Risk (1-19)': 3, 'No Risk (0)': 4 };
    return order[key] ?? 99;
  }
  return 0;
}

export default function ActivityGrouping({ activities, onSelect, selectedId, loading, onLoadMore, hasMore }) {
  const [groupBy, setGroupBy] = useState('none');
  const [collapsed, setCollapsed] = useState({});

  const grouped = useMemo(() => {
    if (groupBy === 'none') return null;
    const map = new Map();
    for (const a of activities) {
      const key = getGroupKey(a, groupBy);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(a);
    }
    return [...map.entries()].sort((a, b) => {
      const oa = getGroupOrder(a[0], groupBy);
      const ob = getGroupOrder(b[0], groupBy);
      if (oa !== ob) return oa - ob;
      return a[0].localeCompare(b[0]);
    });
  }, [activities, groupBy]);

  const toggle = (key) => setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  if (groupBy === 'none' || !grouped) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-white/30 text-xs">Group by:</span>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/60 focus:outline-none"
          >
            {GROUP_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <ActivityTimelineSimple activities={activities} loading={loading} onSelect={onSelect} selectedId={selectedId} onLoadMore={onLoadMore} hasMore={hasMore} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-white/30 text-xs">Group by:</span>
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/60 focus:outline-none"
        >
          {GROUP_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span className="text-white/20 text-xs">{grouped.length} groups · {activities.length} activities</span>
      </div>
      <div className="space-y-2">
        {grouped.map(([key, items]) => (
          <div key={key} className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
            <button
              onClick={() => toggle(key)}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-2">
                {collapsed[key] ? <ChevronRight size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
                <span className="text-white/70 text-sm font-medium">{key}</span>
              </div>
              <span className="text-white/30 text-xs">{items.length}</span>
            </button>
            {!collapsed[key] && (
              <div className="border-t border-white/5">
                <ActivityTimelineSimple activities={items} loading={false} onSelect={onSelect} selectedId={selectedId} onLoadMore={null} hasMore={false} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Inline minimal timeline to avoid circular dependency with ActivityTimeline
function ActivityTimelineSimple({ activities, loading, onSelect, selectedId, onLoadMore, hasMore }) {
  if (loading) {
    return <div className="py-8 text-center text-white/30 text-sm">Loading activities…</div>;
  }
  if (!activities || activities.length === 0) {
    return <div className="py-8 text-center text-white/30 text-sm">No activities found.</div>;
  }
  return (
    <div className="divide-y divide-white/5">
      {activities.map((a) => (
        <button
          key={a.id}
          onClick={() => onSelect?.(a)}
          className={`w-full text-left flex items-start gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors ${selectedId === a.id ? 'bg-indigo-500/5' : ''}`}
        >
          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
            a.severity === 'critical' || a.severity === 'emergency' ? 'bg-red-500' :
            a.severity === 'error' ? 'bg-orange-500' :
            a.severity === 'warning' ? 'bg-amber-500' :
            a.severity === 'success' ? 'bg-emerald-500' : 'bg-indigo-500'
          }`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-white/70 text-sm truncate">{a.action}</span>
              <span className="text-white/30 text-xs whitespace-nowrap">{a.category}</span>
            </div>
            <div className="flex items-center gap-2 text-white/30 text-xs mt-0.5">
              {a.performed_by_name && <span>{a.performed_by_name}</span>}
              {a.workspace && <span>· {a.workspace}</span>}
              {a.duration_ms > 0 && <span>· {a.duration_ms}ms</span>}
            </div>
          </div>
        </button>
      ))}
      {onLoadMore && hasMore && (
        <button onClick={onLoadMore} className="w-full py-2.5 text-center text-indigo-400 text-xs hover:bg-white/[0.02]">
          Load More
        </button>
      )}
    </div>
  );
}