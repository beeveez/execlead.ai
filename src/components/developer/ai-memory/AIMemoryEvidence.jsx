import React from "react";
import {
  Target, TrendingUp, CheckCircle2, Activity, FileText,
  FileCode, RefreshCw, Edit3, History, ChevronRight,
} from "lucide-react";

const ICONS = {
  Target, TrendingUp, CheckCircle2, Activity, FileText,
  FileCode, RefreshCw, Edit3, History,
};

export default function AIMemoryEvidence({ items, onInspect }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <FileText size={14} className="text-amber-400" />
        <h3 className="text-sm font-bold text-white">Evidence</h3>
        <span className="text-[10px] text-white/30 ml-auto">Click any item for details</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {items.map((item) => {
          const Icon = ICONS[item.icon] || FileText;
          return (
            <button
              key={item.id}
              onClick={() => onInspect({ ...item, itemType: "evidence" })}
              className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-left hover:bg-white/[0.04] hover:border-white/10 transition-colors group"
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon size={11} className="text-white/40" />
                <span className="text-[9px] text-white/30 uppercase tracking-wider truncate">{item.label}</span>
                <ChevronRight size={10} className="text-white/20 group-hover:text-amber-400 ml-auto shrink-0 transition-colors" />
              </div>
              <div className="text-xs text-white/80 font-medium truncate">{item.value}</div>
              <div className="text-[9px] text-white/30 mt-0.5 truncate">{item.type}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}