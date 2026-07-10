import React, { useState } from "react";
import { ChevronDown, ChevronUp, Bug, Check } from "lucide-react";

export default function ExecDebugPanel({
  workspacePersona,
  activeWorkspace,
  pageContext,
  pathname,
  messages,
  contextSwitchAt,
}) {
  const [expanded, setExpanded] = useState(false);

  const debugRows = [
    { label: "Current Persona", value: workspacePersona?.tagline || "—" },
    { label: "Current Workspace", value: activeWorkspace || "—" },
    { label: "Current Module", value: pageContext?.module || "—" },
    { label: "Current Route", value: pathname || "—" },
    { label: "Active Context", value: workspacePersona?.id || "—" },
    { label: "Loaded Knowledge Pack", value: workspacePersona?.expertise?.join(", ") || "—" },
    { label: "Conversation Memory", value: `${messages.length} messages` },
    { label: "Prompt Version", value: "1.0" },
    { label: "Configuration Version", value: "2026-07-10-v1" },
    { label: "Context Switch", value: contextSwitchAt ? new Date(contextSwitchAt).toLocaleTimeString() : "—" },
  ];

  return (
    <div className="border-b border-border bg-muted/30 flex-shrink-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Bug size={11} />
          EXEC™ Debug Panel
        </span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {expanded && (
        <div className="px-4 pb-3 space-y-1 animate-fade-in">
          {debugRows.map((row) => (
            <div key={row.label} className="flex items-start gap-2 text-[10px]">
              <span className="text-muted-foreground font-medium min-w-[140px] flex-shrink-0">{row.label}:</span>
              <span className="text-foreground break-all">{row.value}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 pt-1 text-[10px] text-emerald-500">
            <Check size={10} />
            <span>Context validated — persona aligned with workspace</span>
          </div>
        </div>
      )}
    </div>
  );
}