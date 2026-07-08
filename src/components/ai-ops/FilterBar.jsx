import React from "react";
import { Search, RefreshCw, Calendar, X } from "lucide-react";
import { MODULE_LABELS, PROVIDER_META, STATUS_META, RANGE_PRESETS } from "@/lib/aiOperations";

const MODEL_OPTIONS = ["automatic", "gpt-5", "gpt-5-mini", "claude-sonnet-5", "claude_sonnet_4_6", "gemini_3_flash", "gemini_3_1_pro", "deepseek", "llama"];

export default function FilterBar({ filter, updateFilter, resetFilter, autoRefresh, setAutoRefresh, refresh, lastRefresh, scope }) {
  const hasFilters = filter.module || filter.provider || filter.model || filter.status || filter.search || filter.dateRange !== "30d";
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-3">
      <div className="flex flex-col lg:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            value={filter.search}
            onChange={(e) => updateFilter({ search: e.target.value })}
            placeholder="Search user, module, prompt ID, provider, model..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          {RANGE_PRESETS.map((r) => (
            <button
              key={r.key}
              onClick={() => updateFilter({ dateRange: r.key })}
              className={`px-2.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filter.dateRange === r.key ? "bg-indigo-500/15 text-indigo-400" : "bg-white/5 text-white/40 hover:text-white/70"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <button onClick={refresh} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium transition-colors shrink-0">
          <RefreshCw size={13} /> Refresh
        </button>
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors shrink-0 ${autoRefresh ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/40"}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${autoRefresh ? "bg-emerald-400 animate-pulse" : "bg-white/30"}`} />
          {autoRefresh ? "Live" : "Paused"}
        </button>
      </div>

      {filter.dateRange === "custom" && (
        <div className="flex items-center gap-2 text-xs">
          <Calendar size={13} className="text-white/30" />
          <input type="date" value={filter.customStart} onChange={(e) => updateFilter({ customStart: e.target.value })} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white" />
          <span className="text-white/30">to</span>
          <input type="date" value={filter.customEnd} onChange={(e) => updateFilter({ customEnd: e.target.value })} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Select value={filter.module} onChange={(v) => updateFilter({ module: v })} placeholder="All Modules" options={Object.entries(MODULE_LABELS)} />
        <Select value={filter.provider} onChange={(v) => updateFilter({ provider: v })} placeholder="All Providers" options={Object.entries(PROVIDER_META).map(([k, v]) => [k, v.label])} />
        <Select value={filter.model} onChange={(v) => updateFilter({ model: v })} placeholder="All Models" options={MODEL_OPTIONS.map((m) => [m, m])} />
        <Select value={filter.status} onChange={(v) => updateFilter({ status: v })} placeholder="All Statuses" options={Object.entries(STATUS_META).map(([k, v]) => [k, v.label])} />
        {hasFilters && (
          <button onClick={resetFilter} className="flex items-center gap-1 px-2.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/60 text-xs">
            <X size={12} /> Clear
          </button>
        )}
        {lastRefresh && (
          <span className="text-[10px] text-white/25 ml-auto">Updated {lastRefresh.toLocaleTimeString()} · {scope} view</span>
        )}
      </div>
    </div>
  );
}

function Select({ value, onChange, placeholder, options }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none capitalize">
      <option value="">{placeholder}</option>
      {options.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
    </select>
  );
}