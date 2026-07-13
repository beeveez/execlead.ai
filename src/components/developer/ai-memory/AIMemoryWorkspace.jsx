import React, { useMemo, useState } from "react";
import { X, Brain } from "lucide-react";
import { computeAIMemoryIntelligence } from "@/lib/aiMemoryIntelligenceEngine";
import AIMemoryHeader from "./AIMemoryHeader";
import AIMemoryScoreBreakdown from "./AIMemoryScoreBreakdown";
import AIMemoryFailureRegistry from "./AIMemoryFailureRegistry";
import AIMemoryEngineeringTasks from "./AIMemoryEngineeringTasks";
import AIMemoryDependencyGraph from "./AIMemoryDependencyGraph";
import AIMemoryEvidence from "./AIMemoryEvidence";
import AIMemoryExecCopilot from "./AIMemoryExecCopilot";
import AIMemoryActions from "./AIMemoryActions";
import AIMemoryDetailPanel from "./AIMemoryDetailPanel";

export default function AIMemoryWorkspace({ pillar, runtime, onClose, onRerun }) {
  const [recomputeKey, setRecomputeKey] = useState(0);
  const intelligence = useMemo(
    () => computeAIMemoryIntelligence(runtime),
    [runtime, recomputeKey]
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="relative w-full max-w-6xl bg-[#0a0a0f] border border-white/10 rounded-2xl flex flex-col max-h-[92vh] animate-fade-in overflow-hidden">
        {/* Top bar */}
        <div className="shrink-0 border-b border-white/10 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Brain size={14} className="text-violet-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">AI Memory Intelligence™ Workspace</h2>
              <p className="text-[10px] text-white/40">Universal Explainable Metrics™ — Standard Diagnostics Experience</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <AIMemoryHeader intelligence={intelligence} onRecompute={handleRecompute} />

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

          <AIMemoryExecCopilot intelligence={intelligence} />

          <AIMemoryActions intelligence={intelligence} onRecompute={handleRecompute} />
        </div>

        {/* Inline detail panel */}
        {activeDetail && (
          <AIMemoryDetailPanel item={activeDetail} onClose={() => setActiveDetail(null)} />
        )}
      </div>
    </div>
  );
}