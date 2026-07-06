import React from "react";
import { Check, CheckCheck } from "lucide-react";

export default function ModuleSelector({ modules, selectedIds, onToggle, type = "module" }) {
  const filtered = (modules || []).filter(m => m.type === type && m.is_active !== false);

  const selectAll = () => {
    const allIds = filtered.map(m => m.module_id);
    onToggle(allIds);
  };

  const clearAll = () => {
    onToggle([]);
  };

  const allSelected = filtered.length > 0 && filtered.every(m => selectedIds.includes(m.module_id));
  const someSelected = selectedIds.filter(id => filtered.some(m => m.module_id === id)).length > 0;

  const priceLabel = (m) => {
    const price = (m.annual_price || 0).toLocaleString();
    if (m.type === "service") return `$${price}`;
    if (m.is_per_user) return `$${price}/user/yr`;
    return `$${price}/yr`;
  };

  if (filtered.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-end mb-2">
        <button
          type="button"
          onClick={allSelected ? clearAll : selectAll}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            allSelected
              ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15"
              : "bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/10"
          }`}
        >
          <CheckCheck size={12} />
          {allSelected ? "Clear All" : someSelected ? "Select All" : "Select All"}
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {filtered.map(m => {
        const selected = selectedIds.includes(m.module_id);
        return (
          <button
            key={m.module_id}
            type="button"
            onClick={() => onToggle(m.module_id)}
            className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
              selected ? "border-indigo-500/30 bg-indigo-500/5" : "border-white/5 bg-white/[0.02] hover:border-white/10"
            }`}
          >
            <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${selected ? "bg-indigo-500" : "bg-white/5 border border-white/10"}`}>
              {selected && <Check size={12} className="text-white" />}
            </div>
            <span className="text-xl flex-shrink-0">{m.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-white/80 text-sm font-medium">{m.name}</span>
                <span className="text-white/40 text-xs flex-shrink-0">{priceLabel(m)}</span>
              </div>
              <p className="text-white/30 text-xs mt-0.5 line-clamp-2">{m.description}</p>
            </div>
          </button>
        );
      })}
      </div>
    </div>
  );
}