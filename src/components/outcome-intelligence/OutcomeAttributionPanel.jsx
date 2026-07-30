import React, { useState } from "react";
import { ChevronDown, ChevronRight, Target, ShieldCheck } from "lucide-react";
import { OUTCOME_CATEGORIES, OUTCOME_TYPES } from "@/lib/outcomeAttributionEngine";

/**
 * OutcomeAttributionPanel — Outcome Attribution™ for the user's most
 * significant outcomes. For every positive outcome shows evidence
 * contributing, competencies involved, and confidence of attribution.
 */
export default function OutcomeAttributionPanel({ outcomes = [] }) {
  const [expanded, setExpanded] = useState(null);

  if (!outcomes.length) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <Header />
        <div className="text-center py-8 text-white/40 text-xs">
          No outcomes recorded yet. Outcomes like promotions, certifications, and competency improvements will appear here with full attribution.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <Header />
      <div className="space-y-2 mt-4">
        {outcomes.slice(0, 12).map((o) => {
          const attr = o._attribution || {};
          const meta = o._meta || OUTCOME_TYPES[o.outcome_type] || {};
          const cat = OUTCOME_CATEGORIES[o.outcome_category] || { color: "#6366f1" };
          const isOpen = expanded === o.outcome_id;
          return (
            <div key={o.outcome_id} className="border border-white/5 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : o.outcome_id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-white/[0.02] transition-colors text-left"
              >
                {isOpen ? <ChevronDown size={14} className="text-white/40" /> : <ChevronRight size={14} className="text-white/40" />}
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-white text-xs font-medium truncate">{meta.label || o.outcome_type}{o.outcome_title ? ` — ${o.outcome_title}` : ""}</div>
                  <div className="text-[10px] text-white/40">{new Date(o.outcome_date).toLocaleDateString()}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold" style={{ color: cat.color }}>
                    {o.outcome_value >= 0 ? "+" : ""}{o.outcome_value}
                  </div>
                  <div className="text-[9px] text-white/30">{o.outcome_unit}</div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <ShieldCheck size={11} style={{ color: `${cat.color}aa` }} />
                  <span className="text-[10px] text-white/50">{attr.confidence || 0}%</span>
                </div>
              </button>
              {isOpen && (
                <div className="px-4 pb-3 pt-1 space-y-3 border-t border-white/5">
                  {/* Narrative */}
                  <p className="text-[11px] text-white/60 italic">{attr.narrative}</p>
                  {/* Primary drivers */}
                  <div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Target size={10} /> Primary Drivers
                    </div>
                    <div className="space-y-1.5">
                      {(attr.primaryDrivers || []).map((d) => (
                        <div key={d.source} className="flex items-center gap-2">
                          <span className="text-[11px] text-white/70 w-32 truncate">{d.label}</span>
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500/60 rounded-full" style={{ width: `${d.percentage}%` }} />
                          </div>
                          <span className="text-[10px] text-white/50 w-8 text-right">{d.percentage}%</span>
                        </div>
                      ))}
                      {!(attr.primaryDrivers || []).length && <span className="text-[10px] text-white/30">Insufficient evidence to attribute drivers.</span>}
                    </div>
                  </div>
                  {/* Competencies */}
                  {(attr.contributingCompetencies || []).length > 0 && (
                    <div>
                      <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5">Competencies Involved</div>
                      <div className="flex flex-wrap gap-1.5">
                        {attr.contributingCompetencies.map((c) => (
                          <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="flex items-center gap-2">
      <Target size={16} className="text-indigo-400" />
      <h3 className="text-white font-semibold text-sm">Outcome Attribution™</h3>
      <span className="text-[10px] text-white/30">Evidence-backed drivers for every outcome</span>
    </div>
  );
}