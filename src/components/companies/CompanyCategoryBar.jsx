import React from "react";
import { COMPANY_CATEGORIES } from "@/lib/companySeedData";

export default function CompanyCategoryBar({ active, onChange, counts = {} }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {COMPANY_CATEGORIES.map((cat) => {
        const isActive = active === cat.id;
        const count = counts[cat.id];
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              isActive
                ? "bg-violet-500/15 text-violet-400 border border-violet-500/30"
                : "bg-white/[0.03] text-white/40 border border-white/5 hover:border-white/10 hover:text-white/60"
            }`}
          >
            <span>{cat.icon}</span>
            {cat.label}
            {count != null && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${isActive ? "bg-violet-500/20" : "bg-white/5"}`}>{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}