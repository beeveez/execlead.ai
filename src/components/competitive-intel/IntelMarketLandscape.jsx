import React from "react";
import { Globe, Layers } from "lucide-react";

export default function IntelMarketLandscape({ competitors }) {
  const categories = {};
  competitors.forEach((c) => {
    if (!categories[c.category]) categories[c.category] = [];
    categories[c.category].push(c);
  });
  return (
    <div>
      <div className="flex items-center gap-2 mb-4"><Globe size={16} className="text-indigo-400" /><h2 className="text-lg font-semibold">Market Landscape™</h2></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {Object.entries(categories).map(([cat, list]) => (
          <div key={cat} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2"><Layers size={13} className="text-accent-orange" /><h3 className="text-white text-sm font-semibold">{cat}</h3></div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60">{list.length}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {list.map((c) => (
                <span key={c.id} className="text-[11px] px-2 py-1 rounded-lg bg-white/[0.03] border border-white/8 text-white/70">{c.company_name}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}