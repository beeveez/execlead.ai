import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { UserCircle, ChevronRight } from "lucide-react";
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
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-white/40">
        <Link to="/developer" className="hover:text-white/70 transition-colors">Developer Console</Link>
        <ChevronRight size={10} className="text-white/20" />
        <Link to="/developer/cognitive" className="hover:text-white/70 transition-colors">Cognitive Excellence Engine™</Link>
        <ChevronRight size={10} className="text-white/20" />
        <span className="text-indigo-400 flex items-center gap-1">
          <UserCircle size={11} /> Personalization Intelligence™
        </span>
      </nav>

      <DiagnosticsWorkspace capability={PERSONALIZATION_CAPABILITY} runtime={runtime} fullPage />
    </div>
  );
}