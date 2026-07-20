import React from "react";
import { Network, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function DependencyValidationPanel({ results }) {
  if (!results) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 flex items-center justify-center gap-2 text-white/40 text-sm">
        <Loader2 size={16} className="animate-spin" /> Running dependency validation...
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Network size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white/80">Dependency Validation</h3>
        <span className={`text-[10px] px-2 py-0.5 rounded-full ml-auto ${results.allPassed ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}>
          {results.passed}/{results.total} Operational
        </span>
      </div>
      <div className="space-y-2">
        {results.results.map((dep) => {
          const ok = dep.status === "operational";
          return (
            <div key={dep.id} className={`flex items-start gap-3 p-3 rounded-lg border ${ok ? "bg-emerald-500/[0.02] border-emerald-500/10" : "bg-red-500/[0.02] border-red-500/10"}`}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                {ok ? <CheckCircle2 size={14} className="text-emerald-400" /> : <XCircle size={14} className="text-red-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-white/70">{dep.name}</span>
                  {dep.critical && <span className="text-[8px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">CRITICAL</span>}
                </div>
                <div className="text-[10px] text-white/30 mt-0.5">{dep.details}</div>
              </div>
            </div>
          );
        })}
      </div>
      {!results.allPassed && (
        <div className="mt-3 p-3 rounded-lg bg-red-500/5 border border-red-500/15">
          <p className="text-[11px] text-red-400/80">⚠ Any dependency failure prevents activation. Resolve all failures before enabling exec_verified.</p>
        </div>
      )}
    </div>
  );
}