import React, { useState } from "react";
import { TARGETING_DIMENSIONS } from "@/lib/featureFlagEngine";
import { SectionCard, EmptyState } from "./Shared";
import { Target, Plus, X, ChevronDown, ChevronUp } from "lucide-react";

export default function TargetingPanel({ flag, onUpdate }) {
  const rules = parseRules(flag.targeting_rules);
  const [expandedDim, setExpandedDim] = useState(null);
  const [newValues, setNewValues] = useState({});

  function parseRules(json) {
    try { return JSON.parse(json || "[]"); } catch { return []; }
  }

  function stringifyRules(rules) {
    return JSON.stringify(rules);
  }

  async function addRule(dimension, values) {
    const parsed = values.split(",").map((v) => v.trim()).filter(Boolean);
    if (parsed.length === 0) return;
    const existing = rules.find((r) => r.dimension === dimension);
    let updated;
    if (existing) {
      updated = rules.map((r) => r.dimension === dimension ? { ...r, values: [...new Set([...r.values, ...parsed])] } : r);
    } else {
      updated = [...rules, { dimension, values: parsed }];
    }
    await onUpdate({ targeting_rules: stringifyRules(updated) }, "targeting_changed", `Added ${dimension} targeting rule`);
    setNewValues({ ...newValues, [dimension]: "" });
  }

  async function removeRuleValue(dimension, value) {
    const updated = rules
      .map((r) => r.dimension === dimension ? { ...r, values: r.values.filter((v) => v !== value) } : r)
      .filter((r) => r.values.length > 0);
    await onUpdate({ targeting_rules: stringifyRules(updated) }, "targeting_changed", `Removed ${dimension} targeting value`);
  }

  return (
    <SectionCard title="Targeting Rules" icon={Target}>
      {rules.length > 0 ? (
        <div className="space-y-2 mb-3">
          {rules.map((rule) => {
            const dim = TARGETING_DIMENSIONS.find((d) => d.id === rule.dimension);
            return (
              <div key={rule.dimension} className="rounded-lg border border-white/5 bg-white/[0.01] p-2">
                <div className="text-[10px] uppercase tracking-wide text-white/40 mb-1">{dim?.label || rule.dimension}</div>
                <div className="flex flex-wrap gap-1">
                  {rule.values.map((v) => (
                    <span key={v} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs text-white/60">
                      {v}
                      <button onClick={() => removeRuleValue(rule.dimension, v)} className="text-white/30 hover:text-red-400"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-white/40 mb-3">No targeting rules. The flag applies to all users matching its type and status.</p>
      )}

      <div className="space-y-1">
        {TARGETING_DIMENSIONS.map((dim) => {
          const isExpanded = expandedDim === dim.id;
          const hasRule = rules.some((r) => r.dimension === dim.id);
          return (
            <div key={dim.id} className="rounded-lg border border-white/5 overflow-hidden">
              <button
                onClick={() => setExpandedDim(isExpanded ? null : dim.id)}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${hasRule ? "bg-emerald-500" : "bg-white/20"}`} />
                  <span className="text-sm text-white/70">{dim.label}</span>
                  {hasRule && <span className="text-[10px] text-emerald-400">active</span>}
                </div>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-white/30" /> : <ChevronDown className="w-3.5 h-3.5 text-white/30" />}
              </button>
              {isExpanded && (
                <div className="px-3 pb-2 pt-1 border-t border-white/5">
                  <p className="text-[10px] text-white/30 mb-1.5">{dim.description}</p>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40"
                      placeholder="Comma-separated values..."
                      value={newValues[dim.id] || ""}
                      onChange={(e) => setNewValues({ ...newValues, [dim.id]: e.target.value })}
                      onKeyDown={(e) => { if (e.key === "Enter") addRule(dim.id, newValues[dim.id] || ""); }}
                    />
                    <button onClick={() => addRule(dim.id, newValues[dim.id] || "")} className="px-2 py-1 rounded bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 text-xs">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}