import React, { useState, useCallback } from "react";
import { useDeveloper } from "@/lib/DeveloperContext";
import { runKnowledgeSync } from "@/lib/execKnowledgeSyncEngine";
import { Shield } from "lucide-react";
import SyncStatusHero from "@/components/developer/knowledge-sync/SyncStatusHero";
import SyncPipeline from "@/components/developer/knowledge-sync/SyncPipeline";
import SyncSuccessPanel from "@/components/developer/knowledge-sync/SyncSuccessPanel";
import SyncMetricsGrid from "@/components/developer/knowledge-sync/SyncMetricsGrid";
import RegistryBreakdown from "@/components/developer/knowledge-sync/RegistryBreakdown";
import ValidationFindings from "@/components/developer/knowledge-sync/ValidationFindings";
import SyncReport from "@/components/developer/knowledge-sync/SyncReport";
import SelfAwareness from "@/components/developer/knowledge-sync/SelfAwareness";
import SyncHistory from "@/components/developer/knowledge-sync/SyncHistory";

export default function ExecKnowledgeSync() {
  const { canAccessDeveloper } = useDeveloper();
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);

  const handleComplete = useCallback((syncResult) => {
    setResult(syncResult);
    setRunning(false);
  }, []);

  const handleSyncStart = useCallback(() => {
    setRunning(true);
  }, []);

  if (!canAccessDeveloper) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
          <Shield size={32} className="mx-auto text-white/20 mb-3" />
          <h2 className="text-white font-medium mb-1">Developer Access Required</h2>
          <p className="text-white/30 text-sm">EXEC™ Knowledge Synchronization™ is restricted to Developer and Super Admin roles.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <SyncStatusHero result={result} running={running} />

      <SyncPipeline onComplete={handleComplete} onSyncStart={handleSyncStart} />

      {result && !running && <SyncSuccessPanel result={result} />}

      {result && (
        <>
          <SyncMetricsGrid metrics={result.metrics} />
          <RegistryBreakdown registries={result.registries} />
          <ValidationFindings validation={result.validation} />
          <SyncReport report={result.report} />
          <SelfAwareness result={result} />
          <SyncHistory />
        </>
      )}

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
        <p className="text-white/30 text-xs">
          EXEC™ Knowledge Synchronization Engine™ — the permanent bridge between platform engineering and EXEC™ intelligence.
          After any platform enhancement, EXEC™ immediately understands the new functionality without requiring manual prompts.
        </p>
      </div>
    </div>
  );
}