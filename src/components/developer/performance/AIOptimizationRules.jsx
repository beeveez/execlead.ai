import React from "react";
import { AI_SKIP_MODULES, AI_CACHE_CHECK_STEPS, AI_OPTIMIZATION_RULES } from "@/lib/aiInvocationGuard";
import { Brain, Ban, CheckCheck, Settings2 } from "lucide-react";

export default function AIOptimizationRules() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
        <Brain className="w-4 h-4 text-indigo-400" />
        AI Optimization — Invocation Guard™
      </h3>

      {/* Skip Modules */}
      <div>
        <p className="text-xs text-white/40 mb-2 flex items-center gap-1">
          <Ban className="w-3 h-3" /> Never Invoke AI For
        </p>
        <div className="flex flex-wrap gap-1.5">
          {AI_SKIP_MODULES.map((m) => (
            <span key={m.module} className="rounded-full border border-red-500/15 bg-red-500/5 px-2 py-0.5 text-xs text-white/60" title={m.reason}>
              {m.module}
            </span>
          ))}
        </div>
      </div>

      {/* Cache Check Flow */}
      <div>
        <p className="text-xs text-white/40 mb-2 flex items-center gap-1">
          <CheckCheck className="w-3 h-3" /> Pre-Flight Check Flow
        </p>
        <div className="space-y-1">
          {AI_CACHE_CHECK_STEPS.map((s) => (
            <div key={s.step} className="flex items-center gap-2 rounded border border-white/5 bg-white/5 px-2 py-1.5">
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                s.step === 5 ? "bg-indigo-500/20 text-indigo-300" : "bg-emerald-500/10 text-emerald-300"
              }`}>
                {s.step}
              </span>
              <div className="flex-1">
                <p className="text-xs text-white/70">{s.name}</p>
                <p className="text-xs text-white/40">{s.description}</p>
              </div>
              {s.step === 5 && <span className="text-xs text-indigo-300">AI</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Optimization Rules */}
      <div>
        <p className="text-xs text-white/40 mb-2 flex items-center gap-1">
          <Settings2 className="w-3 h-3" /> Optimization Rules
        </p>
        <div className="space-y-1">
          {Object.entries(AI_OPTIMIZATION_RULES).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between rounded border border-white/5 bg-white/5 px-2 py-1">
              <span className="text-xs text-white/60">{key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).trim()}</span>
              <span className="text-xs font-mono text-indigo-300">
                {Array.isArray(val) ? val.join(", ") : String(val)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}