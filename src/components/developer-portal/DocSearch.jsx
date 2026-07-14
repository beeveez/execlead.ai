import React from "react";
import { Search, X } from "lucide-react";

export default function DocSearch({ value, onChange }) {
  return (
    <div className="relative flex-1 max-w-md">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search documentation..."
        className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-8 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40"
      />
      {value && (
        <button onClick={() => onChange("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50">
          <X size={14} />
        </button>
      )}
    </div>
  );
}