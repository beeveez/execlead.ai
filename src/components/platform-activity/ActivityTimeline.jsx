import React, { useState } from 'react';
import { Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import { getCategoryConfig, getSeverityConfig, getStatusConfig } from '@/lib/platformActivityConfig';

export default function ActivityTimeline({ activities, loading, onLoadMore, hasMore, onSelect, selectedId }) {
  const [expanded, setExpanded] = useState(new Set());

  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-16 bg-white/[0.02] border border-white/5 rounded-xl">
        <p className="text-white/40 text-sm">No activities found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((activity) => (
        <ActivityRow
          key={activity.id}
          activity={activity}
          expanded={expanded.has(activity.id)}
          onToggle={() => toggleExpand(activity.id)}
          onSelect={() => onSelect(activity)}
          isSelected={selectedId === activity.id}
        />
      ))}
      {hasMore && (
        <button
          onClick={onLoadMore}
          className="w-full py-3 text-center text-sm text-white/40 hover:text-white/60 border border-white/5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
        >
          Load More Activities
        </button>
      )}
    </div>
  );
}

function ActivityRow({ activity, expanded, onToggle, onSelect, isSelected }) {
  const cat = getCategoryConfig(activity.category);
  const sev = getSeverityConfig(activity.severity);
  const status = getStatusConfig(activity.status);
  const Icon = cat.icon;

  return (
    <div
      className={`rounded-lg border transition-colors cursor-pointer ${
        isSelected
          ? 'bg-indigo-500/5 border-indigo-500/30'
          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Severity dot */}
        <div className="flex flex-col items-center pt-1">
          <span className={`w-2 h-2 rounded-full ${sev.dot}`} />
        </div>

        {/* Icon */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-white/5`}>
          <Icon size={14} className={cat.color} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white/80 text-sm font-medium truncate">{activity.action}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${sev.bg} ${sev.color}`}>{sev.label}</span>
            {activity.status !== 'completed' && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${status.bg} ${status.color}`}>{status.label}</span>
            )}
            {activity.risk_score > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full bg-white/5 ${activity.risk_score > 60 ? 'text-red-400' : activity.risk_score > 30 ? 'text-amber-400' : 'text-white/40'}`}>
                Risk: {activity.risk_score}
              </span>
            )}
          </div>
          <p className="text-white/40 text-xs mt-0.5 truncate">
            {activity.description || activity.action}
          </p>
          <div className="flex items-center gap-3 mt-1 text-xs text-white/30">
            {activity.performed_by_name && <span>👤 {activity.performed_by_name}</span>}
            {activity.module && <span>📦 {activity.module}</span>}
            {activity.workspace && <span>🏢 {activity.workspace}</span>}
            {activity.ai_credits_used > 0 && <span>🤖 {activity.ai_credits_used} credits</span>}
            {activity.duration_ms > 0 && <span>⏱ {activity.duration_ms}ms</span>}
            <span className="ml-auto">{relativeTime(activity.created_date)}</span>
          </div>

          {expanded && (
            <div className="mt-2 pt-2 border-t border-white/5 text-xs text-white/50 space-y-1">
              {activity.activity_id && <div><span className="text-white/30">Activity ID:</span> {activity.activity_id}</div>}
              {activity.target_entity && <div><span className="text-white/30">Target:</span> {activity.target_entity}{activity.target_entity_id ? ` (${activity.target_entity_id.substring(0, 12)})` : ''}</div>}
              {activity.request_id && <div><span className="text-white/30">Request ID:</span> {activity.request_id}</div>}
              {activity.correlation_id && <div><span className="text-white/30">Correlation ID:</span> {activity.correlation_id}</div>}
              {activity.model_used && <div><span className="text-white/30">Model:</span> {activity.model_used}{activity.provider ? ` (${activity.provider})` : ''}</div>}
              {activity.tags && activity.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {activity.tags.map((tag, i) => (
                    <span key={i} className="bg-white/5 px-1.5 py-0.5 rounded text-white/40">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className="text-white/20 hover:text-white/40 p-1"
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>
    </div>
  );
}

function relativeTime(dateStr) {
  if (!dateStr) return '';
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
}