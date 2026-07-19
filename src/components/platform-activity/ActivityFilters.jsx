import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X, Calendar } from 'lucide-react';
import { ACTIVITY_CATEGORIES, SEVERITIES, STATUSES, WORKSPACES, BUSINESS_IMPACTS, TIMEFRAMES } from '@/lib/platformActivityConfig';

export default function ActivityFilters({ filters, onFilterChange, resultCount }) {
  const [expanded, setExpanded] = useState(false);

  const update = (key, value) => onFilterChange({ ...filters, [key]: value || undefined });
  const clearAll = () => onFilterChange({});

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl">
      {/* Search row */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={filters.search || ''}
            onChange={(e) => update('search', e.target.value)}
            placeholder="Search activities, IDs, users, descriptions..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          />
        </div>
        <select
          value={filters.timeframe || 'all'}
          onChange={(e) => update('timeframe', e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none"
        >
          {TIMEFRAMES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-colors ${
            expanded || activeFilterCount > 0
              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
              : 'bg-white/5 border-white/10 text-white/50 hover:text-white/70'
          }`}
        >
          <SlidersHorizontal size={14} /> Filters
          {activeFilterCount > 0 && (
            <span className="bg-indigo-500 text-white text-xs px-1.5 rounded-full">{activeFilterCount}</span>
          )}
        </button>
        {activeFilterCount > 0 && (
          <button onClick={clearAll} className="text-white/30 hover:text-white/60 text-xs flex items-center gap-1">
            <X size={12} /> Clear
          </button>
        )}
        <span className="text-white/30 text-xs whitespace-nowrap">{resultCount} events</span>
      </div>

      {/* Advanced filters */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-white/5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <FilterSelect label="Category" value={filters.category} onChange={(v) => update('category', v)} options={ACTIVITY_CATEGORIES} />
          <FilterSelect label="Severity" value={filters.severity} onChange={(v) => update('severity', v)} options={SEVERITIES} />
          <FilterSelect label="Status" value={filters.status} onChange={(v) => update('status', v)} options={STATUSES} />
          <FilterSelect label="Workspace" value={filters.workspace} onChange={(v) => update('workspace', v)} options={WORKSPACES} />
          <FilterSelect label="Business Impact" value={filters.business_impact} onChange={(v) => update('business_impact', v)} options={BUSINESS_IMPACTS} />
          <div>
            <label className="text-white/30 text-xs uppercase tracking-wider mb-1 block">Module</label>
            <input
              value={filters.module || ''}
              onChange={(e) => update('module', e.target.value)}
              placeholder="e.g. coach, resume..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            />
          </div>
          <div>
            <label className="text-white/30 text-xs uppercase tracking-wider mb-1 block">User</label>
            <input
              value={filters.performed_by_name || ''}
              onChange={(e) => update('performed_by_name', e.target.value)}
              placeholder="Search by user..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            />
          </div>
          <div>
            <label className="text-white/30 text-xs uppercase tracking-wider mb-1 block">Entity Type</label>
            <input
              value={filters.target_entity || ''}
              onChange={(e) => update('target_entity', e.target.value)}
              placeholder="e.g. UserProfile..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-white/30 text-xs uppercase tracking-wider mb-1 block">{label}</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none"
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}