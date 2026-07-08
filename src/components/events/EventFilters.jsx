import React from "react";
import { Search, X } from "lucide-react";
import { EVENT_TYPES } from "@/lib/eventPlatform";

export default function EventFilters({ filters, onChange, onClear, resultCount }) {
  const update = (key, value) => onChange({ ...filters, [key]: value });
  const hasFilters = filters.search || filters.type || filters.format || filters.price;

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={filters.search}
            onChange={(e) => update('search', e.target.value)}
            placeholder="Search events..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          />
        </div>
        <span className="text-xs text-white/30 whitespace-nowrap">{resultCount} result{resultCount !== 1 ? 's' : ''}</span>
        {hasFilters && (
          <button onClick={onClear} className="flex items-center gap-1 text-xs text-white/40 hover:text-white/60 transition-colors">
            <X size={12} /> Clear
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <select
          value={filters.type}
          onChange={(e) => update('type', e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/70 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
        >
          <option value="" className="bg-[#0d0d14]">All Types</option>
          {EVENT_TYPES.map(t => <option key={t.id} value={t.id} className="bg-[#0d0d14]">{t.label}</option>)}
        </select>
        <select
          value={filters.format}
          onChange={(e) => update('format', e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/70 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
        >
          <option value="" className="bg-[#0d0d14]">All Formats</option>
          <option value="virtual" className="bg-[#0d0d14]">Virtual</option>
          <option value="inperson" className="bg-[#0d0d14]">In-Person</option>
        </select>
        <select
          value={filters.price}
          onChange={(e) => update('price', e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/70 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
        >
          <option value="" className="bg-[#0d0d14]">All Prices</option>
          <option value="free" className="bg-[#0d0d14]">Free</option>
          <option value="paid" className="bg-[#0d0d14]">Paid</option>
        </select>
      </div>
    </div>
  );
}