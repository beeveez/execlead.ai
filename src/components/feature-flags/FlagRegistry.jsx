import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { FLAG_STATES, FLAG_TYPES, FLAG_CATEGORIES, RELEASE_STRATEGIES, getFlagStateConfig, getStrategyConfig, computeFlagSummary } from "@/lib/featureFlagEngine";
import { StatusBadge, TypeBadge, SectionCard, StatCard, Spinner, EmptyState, ProgressBar } from "./Shared";
import { Flag as FlagIcon, Plus, Search, AlertTriangle, Zap, Edit2 } from "lucide-react";

export default function FlagRegistry({ flags, loading, onSelectFlag, onAddFlag, onEditFlag }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = useMemo(() => {
    return flags.filter((f) => {
      if (statusFilter !== "all" && f.status !== statusFilter) return false;
      if (categoryFilter !== "all" && f.category !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return f.name?.toLowerCase().includes(q) || f.flag_key?.toLowerCase().includes(q) || f.description?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [flags, search, statusFilter, categoryFilter]);

  const summary = computeFlagSummary(flags);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="Total Flags" value={summary.total} color="indigo" />
        <StatCard label="Active" value={summary.active} sublabel="Enabled + Beta + Internal" color="emerald" />
        <StatCard label="Disabled" value={summary.disabled} color="red" />
        <StatCard label="Beta" value={summary.beta} color="amber" />
        <StatCard label="Kill Switched" value={summary.killed} color="orange" />
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40"
            placeholder="Search by name, key, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/60 focus:outline-none" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          {FLAG_STATES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/60 focus:outline-none" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">All Categories</option>
          {FLAG_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <button onClick={onAddFlag} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors whitespace-nowrap">
          <Plus className="w-4 h-4" /> Add Flag
        </button>
      </div>

      {loading ? (
        <Spinner label="Loading feature flags..." />
      ) : filtered.length === 0 ? (
        <EmptyState label={search || statusFilter !== "all" || categoryFilter !== "all" ? "No flags match your filters." : "No feature flags registered yet."} />
      ) : (
        <div className="space-y-2">
          {filtered.map((flag) => (
            <FlagRow key={flag.id} flag={flag} onSelect={() => onSelectFlag(flag)} onEdit={() => onEditFlag(flag)} />
          ))}
        </div>
      )}
    </div>
  );
}

function FlagRow({ flag, onSelect, onEdit }) {
  const stateConfig = getFlagStateConfig(flag.status);
  const strategyConfig = getStrategyConfig(flag.release_strategy);
  const hasErrors = (flag.error_count || 0) > 0;

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 transition-all cursor-pointer group" onClick={onSelect}>
      <div className={`w-2 h-2 rounded-full shrink-0 ${flag.kill_switch_active ? "bg-red-500" : stateConfig.color === "emerald" ? "bg-emerald-500" : stateConfig.color === "amber" ? "bg-amber-500" : stateConfig.color === "red" ? "bg-red-500" : "bg-slate-500"}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white truncate">{flag.name}</span>
          <TypeBadge type={flag.flag_type} />
          {flag.kill_switch_active && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
              <Zap className="w-2.5 h-2.5" /> KILLED
            </span>
          )}
          {hasErrors && <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <code className="text-[10px] text-white/30">{flag.flag_key}</code>
          {strategyConfig.id !== "none" && <span className="text-[10px] text-white/30">· {strategyConfig.label} · {flag.rollout_percentage}%</span>}
          {flag.owner && <span className="text-[10px] text-white/20 hidden sm:inline">· {flag.owner}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {strategyConfig.id !== "none" && flag.rollout_percentage < 100 && (
          <div className="w-16 hidden sm:block"><ProgressBar value={flag.rollout_percentage} color={stateConfig.color} /></div>
        )}
        <StatusBadge status={flag.status} />
        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 rounded hover:bg-white/10 text-white/30 hover:text-white/70 transition-colors opacity-0 group-hover:opacity-100">
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}