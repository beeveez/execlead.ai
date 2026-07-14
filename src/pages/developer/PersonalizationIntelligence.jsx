import React, { useMemo } from "react";
import { useExecConcierge } from "@/lib/ExecConciergeContext";
import { PERSONALIZATION_CAPABILITY } from "@/components/developer/diagnostics/capabilities";
import DiagnosticsWorkspace from "@/components/developer/diagnostics/DiagnosticsWorkspace";

export default function PersonalizationIntelligence() {
  const concierge = useExecConcierge();

  const runtime = useMemo(() => ({
    hasMemory: (concierge.messages?.length || 0) > 0,
    hasUserContext: !!concierge.userContext,
    personaResolved: !!concierge.workspacePersona,
    pageContextResolved: !!concierge.pageContext,
    conversationLength: concierge.messages?.length || 0,
    learnedPreferences: concierge.learnedPreferences,
  }), [concierge]);

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <DiagnosticsWorkspace capability={PERSONALIZATION_CAPABILITY} runtime={runtime} fullPage />
    </div>
  );
}