import React from "react";
import { BookLock, ToggleLeft, ToggleRight } from "lucide-react";

/**
 * PolicyEnginePanel — AI Policy Engine™: list of governance policies with
 * enable/disable and threshold editing.
 */
export default function PolicyEnginePanel({ policies, onToggle }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <BookLock size={16} className="text-indigo-400" />
        <h3 className="text-white font-semibold text-sm">AI Policy Engine™</h3>
      </div>

      <div className="space-y-2">
        {policies.map((p) => (
          <div key={p.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">{p.name}</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/5 text-white/40">{p.severity}</span>
                </div>
                <p className="text-[11px] text-white/40 mt-0.5">{p.description}</p>
              </div>
              <button
                onClick={() => onToggle(p.id, { enabled: !p.enabled })}
                className="flex-shrink-0"
                title={p.enabled ? "Enabled" : "Disabled"}
              >
                {p.enabled ? (
                  <ToggleRight size={22} className="text-emerald-400" />
                ) : (
                  <ToggleLeft size={22} className="text-white/30" />
                )}
              </button>
            </div>
            {p.threshold != null && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-white/40">Threshold:</span>
                <input
                  type="number"
                  value={p.threshold}
                  onChange={(e) => onToggle(p.id, { threshold: Number(e.target.value) })}
                  className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500/40"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}