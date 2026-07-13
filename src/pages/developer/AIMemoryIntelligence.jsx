import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Brain, ChevronRight } from "lucide-react";
import { useExecConcierge } from "@/lib/ExecConciergeContext";
import AIMemoryWorkspace from "@/components/developer/ai-memory/AIMemoryWorkspace";

export default function AIMemoryIntelligence() {
  const concierge = useExecConcierge();

  const runtime = useMemo(() => ({
    hasMemory: (concierge.messages?.length || 0) > 0,
    hasUserContext: !!concierge.userContext,
    hasExecutiveMemory: !!concierge.hasExecutiveMemory,
    personaResolved: !!concierge.workspacePersona,
    pageContextResolved: !!concierge.pageContext,
    conversationLength: concierge.messages?.length || 0,
  }), [concierge]);

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-white/40">
        <Link to="/developer" className="hover:text-white/70 transition-colors">Developer Console</Link>
        <ChevronRight size={10} className="text-white/20" />
        <Link to="/developer/cognitive" className="hover:text-white/70 transition-colors">Cognitive Excellence Engine™</Link>
        <ChevronRight size={10} className="text-white/20" />
        <span className="text-violet-400 flex items-center gap-1">
          <Brain size={11} /> AI Memory Intelligence™
        </span>
      </nav>

      <AIMemoryWorkspace runtime={runtime} fullPage />
    </div>
  );
}