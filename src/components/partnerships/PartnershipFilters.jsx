import React from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import {
  CATEGORIES, WORK_MODELS, EXECUTIVE_LEVELS, LISTING_TIERS,
} from "@/lib/partnershipMarketplace";

export default function PartnershipFilters({ filters, onChange, onClear, resultCount }) {
  const update = (key, value) => onChange({ ...filters, [key]: value });

  const hasActiveFilters = Object.values(filters).some(v => v !== "" && v !== null && v !== undefined);

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
        <input
          value={filters.search || ""}
          onChange={(e) => update("search", e.target.value)}
          placeholder="Search opportunities, organizations, keywords..."
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
        />
      </div>

      {/* Filter dropdowns */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-white/30 mr-1">
          <SlidersHorizontal size={12} /> Filters:
        </div>

        <select value={filters.category || ""} onChange={(e) => update("category", e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>

        <select value={filters.work_model || ""} onChange={(e) => update("work_model", e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
          <option value="">All Models</option>
          {WORK_MODELS.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}
        </select>

        <select value={filters.executive_level || ""} onChange={(e) => update("executive_level", e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
          <option value="">All Levels</option>
          {EXECUTIVE_LEVELS.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
        </select>

        <select value={filters.listing_tier || ""} onChange={(e) => update("listing_tier", e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
          <option value="">All Tiers</option>
          {LISTING_TIERS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>

        <input
          value={filters.country || ""}
          onChange={(e) => update("country", e.target.value)}
          placeholder="Country"
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 w-28"
        />

        <input
          value={filters.industry || ""}
          onChange={(e) => update("industry", e.target.value)}
          placeholder="Industry"
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 w-28"
        />

        {hasActiveFilters && (
          <button onClick={onClear} className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/60 hover:bg-white/5 transition-colors">
            <X size={12} /> Clear
          </button>
        )}

        <span className="text-xs text-white/30 ml-auto">{resultCount} opportunities</span>
      </div>
    </div>
  );
}