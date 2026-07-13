import React, { useMemo, useState } from "react";
import { X } from "lucide-react";
import AIMemoryHeader from "@/components/developer/ai-memory/AIMemoryHeader";
import AIMemoryScoreBreakdown from "@/components/developer/ai-memory/AIMemoryScoreBreakdown";
import AIMemoryFailureRegistry from "@/components/developer/ai-memory/AIMemoryFailureRegistry";
import AIMemoryEngineeringTasks from "@/components/developer/ai-memory/AIMemoryEngineeringTasks";
import AIMemoryDependencyGraph from "@/components/developer/ai-memory/AIMemoryDependencyGraph";
import AIMemoryEvidence from "@/components/developer/ai-memory/AIMemoryEvidence";
import AIMemoryExecCopilot from "@/components/developer/ai-memory/AIMemoryExecCopilot";
import AIMemoryActions from "@/components/developer/ai-memory/AIMemoryActions";
import AIMemoryDetailPanel from "@/components/developer/ai-memory/AIMemoryDetailPanel";

const COLOR_MAP = {
  violet: { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400" },
  indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/20", text: "text-indigo-400" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400" },
  cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/20", text: "text-cyan-400" },
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400" },
  blue: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400" },
  red: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400" },
};

/**
 * Universal Diagnostics Workspace™
 * ----------------------------------
 * Generic shell that renders the standard diagnostics flow for ANY capability:
 * score ring + stats → contributing dimensions → failure registry →
 * engineering tasks → dependency graph → evidence → EXEC™ copilot → actions.
 *
 * Driven by a capability descriptor (see capabilities.js) so every capability
 * across EXECLEAD.AI uses the same interactive, explainable, repairable experience.
 *
 * Props:
 *   capability  — descriptor from capabilities.js (name, icon, color, computeIntelligence, …)
 *   runtime     — live runtime telemetry passed to the compute function
 *   fullPage    — true for routed pages, false for modal/drawer embedding
 *   onClose     — modal close handler (modal mode only)
 *   onRerun     — external recompute callback (e.g. refresh parent dashboard)
 */
export default function DiagnosticsWorkspace({ capability, runtime, fullPage = false, onClose, onRerun }) {
  const [recomputeKey, setRecomputeKey] = useState(0);
  const intelligence = useMemo(
    () => capability.computeIntelligence(runtime),
    [capability, runtime, recomputeKey]
  );

  const [activeDetail, setActiveDetail] = useState(null);
  const [taskOverrides, setTaskOverrides] = useState({});
  const [failureOverrides, setFailureOverrides] = useState({});

  const handleInspect = (item) => setActiveDetail(item);

  const handleRecompute = () => {
    setRecomputeKey((k) => k + 1);
    onRerun?.();
  };

  const tasks = intelligence.tasks.map((t) => ({ ...t, ...taskOverrides[t.id] }));
  const failures = intelligence.failures.map((f) => ({ ...f, ...failureOverrides[f.id] }));

  const Icon = capability.icon;
  const c = COLOR_MAP[capability.color] || COLOR_MAP.violet;

  const renderContent = () => (
    <>
      <AIMemoryHeader intelligence={intelligence} onRecompute={handleRecompute} capability={capability} />

      <AIMemoryScoreBreakdown dimensions={intelligence.dimensions} onInspect={handleInspect} />

      <AIMemoryFailureRegistry
        failures={failures}
        onInspect={handleInspect}
        onOverride={(id, patch) => setFailureOverrides((s) => ({ ...s, [id]: patch }))}
      />

      <AIMemoryEngineeringTasks
        tasks={tasks}
        onInspect={handleInspect}
        onOverride={(id, patch) => setTaskOverrides((s) => ({ ...s, [id]: patch }))}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AIMemoryDependencyGraph chain={intelligence.dependencyChain} onInspect={handleInspect} />
        <AIMemoryEvidence items={intelligence.evidenceItems} onInspect={handleInspect} />
      </div>

      <AIMemoryExecCopilot intelligence={intelligence} capability={capability} />

      <AIMemoryActions intelligence={intelligence} onRecompute={handleRecompute} capability={capability} />
    </>
  );

  // Full-page mode — rendered inside a routed page
  if (fullPage) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center`}>
            <Icon size={14} className={c.text} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">{capability.name}</h2>
            <p className="text-[10px] text-white/40">Universal Explainable Metrics™ — Standard Diagnostics Experience</p>
          </div>
        </div>
        {renderContent()}
        {activeDetail && (
          <AIMemoryDetailPanel item={activeDetail} onClose={() => setActiveDetail(null)} />
        )}
      </div>
    );
  }

  // Modal mode — embedded from drawers and inline diagnostics
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-6xl bg-[#0a0a0f] border border-white/10 rounded-2xl flex flex-col max-h-[92vh] animate-fade-in overflow-hidden">
        <div className="shrink-0 border-b border-white/10 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center`}>
              <Icon size={14} className={c.text} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{capability.name} Workspace</h2>
              <p className="text-[10px] text-white/40">Universal Explainable Metrics™ — Standard Diagnostics Experience</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {renderContent()}
        </div>

        {activeDetail && (
          <AIMemoryDetailPanel item={activeDetail} onClose={() => setActiveDetail(null)} />
        )}
      </div>
    </div>
  );
}