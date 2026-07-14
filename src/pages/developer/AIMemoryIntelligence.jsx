import React, { useMemo } from "react";
import { useExecConcierge } from "@/lib/ExecConciergeContext";
import AIMemoryWorkspace from "@/components/developer/ai-memory/AIMemoryWorkspace";

export default function AIMemoryIntelligence() {
  const concierge = useExecConcierge();

  const runtime = useMemo(() => ({
    hasMemory: (concierge.messages?.length || 0) > 0,
    hasUserContext: !!concierge.userContext,
    hasExecutiveMemory: !!concierge.hasExecutiveMemory,
    hasLongTermRecall: !!concierge.hasLongTermRecall,
    hasScheduledSync: true,
    personaResolved: !!concierge.workspacePersona,
    pageContextResolved: !!concierge.pageContext,
    conversationLength: concierge.messages?.length || 0,
  }), [concierge]);

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <AIMemoryWorkspace runtime={runtime} fullPage />
    </div>
  );
}