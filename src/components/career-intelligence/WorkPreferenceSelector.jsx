import React from "react";
import { Monitor, Building, MapPin, Calendar, Plane } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "remote", label: "Remote", icon: Monitor },
  { value: "hybrid", label: "Hybrid", icon: Building },
  { value: "onsite", label: "Onsite", icon: MapPin },
  { value: "flexible", label: "Flexible", icon: Calendar },
  { value: "travel_required", label: "Travel Required", icon: Plane },
];

export default function WorkPreferenceSelector({ value, onChange }) {
  // Support both legacy single-string and new multi-select array formats
  const selected = Array.isArray(value) ? value : (value ? [value] : []);

  const toggle = (val) => {
    const next = selected.includes(val)
      ? selected.filter(v => v !== val)
      : [...selected, val];
    onChange?.(next);
  };

  return (
    <div>
      <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Work Preference</label>
      <div className="grid grid-cols-5 gap-2">
        {OPTIONS.map(opt => {
          const isSelected = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={cn(
                "flex flex-col items-center gap-1.5 py-3 rounded-lg border transition-all",
                isSelected
                  ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400"
                  : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
              )}
            >
              <opt.icon size={18} />
              <span className="text-[10px] font-medium text-center leading-tight">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}