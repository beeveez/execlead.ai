import React from "react";
import { Search, X, Filter } from "lucide-react";
import { STATUS_FILTERS, CERTIFICATION_FILTERS, WORKSPACE_FILTERS, STATUS_META, CERTIFICATION_META } from "@/lib/migrationLedgerEngine";

export default function MigrationFilters({ searchQuery, onSearchChange, activeStatuses, onToggleStatus, activeCerts, onToggleCert, activeWorkspaces, onToggleWorkspace, onClear }) {
  const hasActiveFilters = activeStatuses.length > 0 || activeCerts.length > 0 || activeWorkspaces.length > 0 || searchQuery.trim().length > 0;

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by Migration ID, Name, Version, Capability, Status, Author…"
          className="w-full bg-white/[0.03] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40 transition-colors"
        />
        {searchQuery && (
          <button onClick={() => onSearchChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Filter rows */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1 text-white/30 text-[10px] uppercase tracking-wider mr-1">
          <Filter size={10} /> Status
        </span>
        {STATUS_FILTERS.map((s) => {
          const meta = STATUS_META[s];
          const active = activeStatuses.includes(s);
          return (
            <button
              key={s}
              onClick={() => onToggleStatus(s)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all ${active ? `${meta.bg} ${meta.text} ${meta.border}` : "bg-white/[0.02] text-white/40 border-white/5 hover:border-white/10"}`}
            >
              {meta.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-white/30 text-[10px] uppercase tracking-wider mr-1">Certification</span>
        {CERTIFICATION_FILTERS.map((c) => {
          const meta = CERTIFICATION_META[c];
          const active = activeCerts.includes(c);
          return (
            <button
              key={c}
              onClick={() => onToggleCert(c)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all ${active ? `${meta.bg} ${meta.text} border-white/10` : "bg-white/[0.02] text-white/40 border-white/5 hover:border-white/10"}`}
            >
              {meta.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-white/30 text-[10px] uppercase tracking-wider mr-1">Workspace</span>
        {WORKSPACE_FILTERS.map((w) => {
          const active = activeWorkspaces.includes(w);
          return (
            <button
              key={w}
              onClick={() => onToggleWorkspace(w)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all ${active ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-white/[0.02] text-white/40 border-white/5 hover:border-white/10"}`}
            >
              {w}
            </button>
          );
        })}
        {hasActiveFilters && (
          <button onClick={onClear} className="ml-auto text-white/30 hover:text-white/60 text-[11px] flex items-center gap-1">
            <X size={10} /> Clear
          </button>
        )}
      </div>
    </div>
  );
}