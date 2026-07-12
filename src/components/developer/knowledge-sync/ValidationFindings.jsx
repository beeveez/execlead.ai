import React, { useState } from "react";
import { AlertOctagon, AlertTriangle, Info, ChevronDown, ChevronRight } from "lucide-react";

const LEVEL_META = {
  error: { icon: AlertOctagon, color: "#ef4444", label: "Error" },
  warning: { icon: AlertTriangle, color: "#f59e0b", label: "Warning" },
  info: { icon: Info, color: "#6366f1", label: "Info" },
};

export default function ValidationFindings({ validation }) {
  const [expanded, setExpanded] = useState({ error: true, warning: false, info: false });
  if (!validation || validation.findings.length === 0) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-2">Knowledge Validation</h3>
        <p className="text-emerald-400 text-sm">✓ All validations passed — no findings.</p>
      </div>
    );
  }
  const groups = ["error", "warning", "info"].map((level) => ({
    level,
    items: validation.findings.filter((f) => f.level === level),
  }));
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Knowledge Validation</h3>
        <div className="flex items-center gap-3 text-[11px]">
          <span className="text-red-400">{validation.errors.length} errors</span>
          <span className="text-amber-400">{validation.warnings.length} warnings</span>
          <span className="text-indigo-400">{validation.infos.length} info</span>
        </div>
      </div>
      <div className="space-y-2">
        {groups.map((g) => {
          if (g.items.length === 0) return null;
          const meta = LEVEL_META[g.level];
          const Icon = meta.icon;
          const isOpen = expanded[g.level];
          return (
            <div key={g.level} className="border border-white/5 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpanded((p) => ({ ...p, [g.level]: !p[g.level] }))}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/[0.02] transition-colors"
              >
                {isOpen ? <ChevronDown size={12} className="text-white/30" /> : <ChevronRight size={12} className="text-white/30" />}
                <Icon size={13} style={{ color: meta.color }} />
                <span className="text-sm text-white/70">{meta.label}s</span>
                <span className="text-xs text-white/30">({g.items.length})</span>
              </button>
              {isOpen && (
                <div className="border-t border-white/5 divide-y divide-white/5">
                  {g.items.map((f, i) => (
                    <div key={i} className="px-3 py-2 flex items-start gap-2">
                      <Icon size={11} className="mt-0.5 flex-shrink-0" style={{ color: meta.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-white/70">{f.message}</div>
                        <div className="text-[10px] text-white/30 mt-0.5">
                          <span className="text-white/40">{f.registry}</span>
                          {f.target && <span> · {f.target}</span>}
                          <span className="ml-2 font-mono">{f.code}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}