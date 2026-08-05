import React from "react";
import { ADR_CATEGORY_META, ADR_WORKSPACES } from "@/lib/architectureDecisionEngine";
import { Search, Filter } from "lucide-react";

export default function ADRFilters({ filters, onChange, owners = [] }) {
  const set = (patch) => onChange({ ...filters, ...patch });

  const selectCls =
    "bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/40";

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
        <input
          value={filters.query}
          onChange={(e) => set({ query: e.target.value })}
          placeholder="Search ADRs by title, id, rationale..."
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40"
        />
      </div>
      <div className="flex items-center gap-2">
        <Filter size={14} className="text-white/20" />
        <select value={filters.status} onChange={(e) => set({ status: e.target.value })} className={selectCls}>
          <option value="all">All statuses</option>
          <option value="proposed">Proposed</option>
          <option value="accepted">Accepted</option>
          <option value="implemented">Implemented</option>
          <option value="deprecated">Deprecated</option>
          <option value="superseded">Superseded</option>
          <option value="rejected">Rejected</option>
        </select>
        <select value={filters.category} onChange={(e) => set({ category: e.target.value })} className={selectCls}>
          <option value="all">All categories</option>
          {Object.entries(ADR_CATEGORY_META).map(([k, m]) => (
            <option key={k} value={k}>{m.label}</option>
          ))}
        </select>
        <select value={filters.workspace} onChange={(e) => set({ workspace: e.target.value })} className={selectCls}>
          <option value="all">All workspaces</option>
          {ADR_WORKSPACES.map((w) => (
            <option key={w.key} value={w.key}>{w.label}</option>
          ))}
        </select>
        <select value={filters.owner} onChange={(e) => set({ owner: e.target.value })} className={selectCls}>
          <option value="all">All owners</option>
          {owners.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>
    </div>
  );
}