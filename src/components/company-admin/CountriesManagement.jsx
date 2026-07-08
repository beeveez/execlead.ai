import React, { useMemo } from "react";
import { Globe, ChevronRight } from "lucide-react";

/**
 * Countries Management view — displays every country represented in
 * the company library with its company count. Clicking a country drills
 * back into the company list filtered by that country.
 */
export default function CountriesManagement({ companies, onSelectCountry }) {
  const countries = useMemo(() => {
    const map = {};
    for (const c of companies) {
      const key = c.country || "(Unknown)";
      if (!map[key]) map[key] = { name: key, count: 0, active: 0 };
      map[key].count++;
      if (c.status !== "archived") map[key].active++;
    }
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [companies]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {countries.map((country) => (
        <button
          key={country.name}
          onClick={() => onSelectCountry?.(country.name)}
          className="group text-left bg-white/[0.02] border border-white/5 hover:border-white/25 hover:bg-white/[0.04] hover:-translate-y-0.5 rounded-xl p-4 cursor-pointer transition-all duration-150"
          title="View companies"
        >
          <div className="flex items-center justify-between mb-2">
            <Globe size={16} className="text-emerald-400" />
            <ChevronRight size={14} className="text-white/0 group-hover:text-white/40 transition-all" />
          </div>
          <div className="text-white font-semibold text-sm truncate">{country.name}</div>
          <div className="text-white/40 text-xs mt-1">{country.count} companies · {country.active} active</div>
        </button>
      ))}
      {countries.length === 0 && (
        <div className="col-span-full bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
          <Globe size={24} className="mx-auto text-white/20 mb-2" />
          <p className="text-white/30 text-sm">No countries represented yet.</p>
        </div>
      )}
    </div>
  );
}