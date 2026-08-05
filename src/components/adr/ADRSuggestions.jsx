import React from "react";
import { Button } from "@/components/ui/button";
import { ADR_TRIGGERS } from "@/lib/architectureDecisionEngine";
import { Sparkles, ArrowRight } from "lucide-react";

// Surfaces automatic ADR creation prompts — both static trigger reminders
// and derived draft suggestions (e.g. from approved exceptions).
export default function ADRSuggestions({ suggestions = [], onAccept, onDismiss }) {
  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles size={14} className="text-amber-400" />
        <h3 className="text-sm font-semibold text-white/80">Automatic ADR Prompts</h3>
        <span className="text-[10px] text-white/30 ml-auto">Create a record when these events occur</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {ADR_TRIGGERS.map((t) => (
          <span key={t.key} className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/40 border border-white/10">
            {t.label}
          </span>
        ))}
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-wider text-white/30">Derived drafts from approved exceptions</div>
          {suggestions.map((s, i) => (
            <div key={i} className="bg-amber-500/[0.04] border border-amber-500/15 rounded-lg p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white/80 truncate">{s.suggested_title}</div>
                <div className="text-[10px] text-white/30">
                  exception {s.source_ref_id} · {s.affected_workspaces?.[0] || "—"}
                </div>
              </div>
              <Button size="sm" onClick={() => onAccept(s)} className="bg-amber-600 hover:bg-amber-500 text-white">
                Draft <ArrowRight size={12} className="ml-1" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}