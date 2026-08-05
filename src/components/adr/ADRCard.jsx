import React from "react";
import { ADR_STATUS_META, ADR_CATEGORY_META } from "@/lib/architectureDecisionEngine";
import { ChevronRight } from "lucide-react";

export default function ADRCard({ adr, onClick }) {
  const status = ADR_STATUS_META[adr.status] || ADR_STATUS_META.proposed;
  const cat = ADR_CATEGORY_META[adr.category] || { label: adr.category };

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white/[0.02] border border-white/10 rounded-xl p-4 hover:border-white/20 hover:bg-white/[0.04] transition-all group"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wider text-white/30 font-mono">{adr.adr_id}</span>
            <span className="text-[10px] text-white/20">•</span>
            <span className="text-[10px] uppercase tracking-wider text-white/30 font-mono">{cat.label}</span>
            {adr.version && (
              <>
                <span className="text-[10px] text-white/20">•</span>
                <span className="text-[10px] text-white/30 font-mono">v{adr.version}</span>
              </>
            )}
          </div>
          <h3 className="text-sm font-semibold text-white/90 group-hover:text-white truncate">{adr.title}</h3>
        </div>
        <ChevronRight size={16} className="text-white/10 group-hover:text-white/30 transition-colors flex-shrink-0 mt-1" />
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.bg} ${status.text}`}>
          {status.label}
        </span>
        {adr.owner && <span className="text-[10px] text-white/30">by {adr.owner}</span>}
        {adr.superseded_by && (
          <span className="text-[10px] text-violet-400/70">superseded by {adr.superseded_by}</span>
        )}
        {adr.related_exception_ids?.length > 0 && (
          <span className="text-[10px] text-white/20 ml-auto">
            {adr.related_exception_ids.length} exception{adr.related_exception_ids.length === 1 ? "" : "s"}
          </span>
        )}
      </div>
    </button>
  );
}