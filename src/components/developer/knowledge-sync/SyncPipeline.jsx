import React, { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { SYNC_STAGES, runKnowledgeSync } from "@/lib/execKnowledgeSyncEngine";

export default function SyncPipeline({ onComplete }) {
  const [running, setRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState(-1);
  const [stages, setStages] = useState([]);

  const handleSync = useCallback(async () => {
    setRunning(true);
    setStages(SYNC_STAGES.map((s) => ({ ...s, status: "pending" })));
    // Animate through each stage with real computation at the end
    for (let i = 0; i < SYNC_STAGES.length; i++) {
      setCurrentStage(i);
      setStages((prev) => prev.map((s, idx) => idx === i ? { ...s, status: "running" } : s));
      // Small delay for UX; the actual computation happens on the final stage
      await new Promise((r) => setTimeout(r, i === SYNC_STAGES.length - 2 ? 100 : 250));
      setStages((prev) => prev.map((s, idx) => idx === i ? { ...s, status: "completed" } : s));
    }
    // Run the actual synchronization (synchronous computation)
    const result = runKnowledgeSync();
    setRunning(false);
    setCurrentStage(-1);
    onComplete?.(result);
  }, [onComplete]);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-violet-500/10 text-violet-400">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Synchronization Pipeline</h3>
            <p className="text-[11px] text-white/40">Trigger EXEC™ to discover, validate, and register all platform capabilities</p>
          </div>
        </div>
        <button
          onClick={handleSync}
          disabled={running}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {running ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {running ? "Synchronizing…" : "Synchronize EXEC™"}
        </button>
      </div>

      <AnimatePresence>
        {(running || stages.length > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1.5 overflow-hidden"
          >
            {stages.map((stage, i) => (
              <div key={stage.id} className="flex items-center gap-2.5 text-sm">
                {stage.status === "completed" ? (
                  <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                ) : stage.status === "running" ? (
                  <Loader2 size={14} className="text-violet-400 animate-spin flex-shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-white/10 flex-shrink-0" />
                )}
                <span className={stage.status === "completed" ? "text-white/50" : stage.status === "running" ? "text-white" : "text-white/30"}>
                  {stage.label}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {!running && stages.length === 0 && (
        <div className="text-center py-4">
          <p className="text-white/30 text-sm">Click "Synchronize EXEC™" to run the full discovery → validation → registration pipeline.</p>
        </div>
      )}
    </div>
  );
}