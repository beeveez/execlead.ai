import React from "react";
import { AI_MEMORY_CAPABILITY } from "@/components/developer/diagnostics/capabilities";
import DiagnosticsWorkspace from "@/components/developer/diagnostics/DiagnosticsWorkspace";

/**
 * AI Memory Intelligence™ — thin wrapper around the generic DiagnosticsWorkspace.
 * Kept for backward compatibility with drawers/dashboards that embed it as a modal.
 * The routed page (AIMemoryIntelligence.jsx) uses DiagnosticsWorkspace directly.
 */
export default function AIMemoryWorkspace({ runtime, onClose, onRerun, fullPage = false }) {
  return (
    <DiagnosticsWorkspace
      capability={AI_MEMORY_CAPABILITY}
      runtime={runtime}
      fullPage={fullPage}
      onClose={onClose}
      onRerun={onRerun}
    />
  );
}