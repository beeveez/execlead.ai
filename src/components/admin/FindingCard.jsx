import React, { useState } from "react";
import { AlertTriangle, AlertCircle, Info, ChevronDown, ChevronRight, ExternalLink, Code2, Wrench, Check } from "lucide-react";

const SEVERITY = {
  critical: { color: "#ef4444", bg: "bg-red-500/10", border: "border-red-500/20", icon: AlertCircle, label: "Critical" },
  warning: { color: "#f59e0b", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: AlertTriangle, label: "Warning" },
  information: { color: "#3b82f6", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: Info, label: "Information" },
};

function ActionButton({ action, onRun, onPreview, running, done }) {
  if (action.type === "link") {
    return (
      <a href={action.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs transition-colors">
        <ExternalLink size={11} /> {action.label}
      </a>
    );
  }
  if (action.type === "code") {
    return (
      <button type="button" onClick={() => onPreview(action)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs transition-colors">
        <Code2 size={11} /> {action.label}
      </button>
    );
  }
  return (
    <button type="button" onClick={() => onRun(action)} disabled={running || done} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-medium transition-colors disabled:opacity-40">
      {done ? <Check size={11} /> : <Wrench size={11} />} {done ? "Fixed" : action.label}
    </button>
  );
}

export default function FindingCard({ finding, selected, ignored, reviewed, onToggleSelect, onRunAction, onPreviewAction, runningActionId, doneActionIds }) {
  const [expanded, setExpanded] = useState(finding.severity === "critical");
  const sev = SEVERITY[finding.severity];
  const Icon = sev.icon;

  return (
    <div className={`rounded-xl border ${sev.border} ${sev.bg} overflow-hidden transition-opacity ${ignored ? "opacity-40" : ""} ${reviewed ? "ring-1 ring-emerald-500/30" : ""}`}>
      <div className="flex items-start gap-3 p-4">
        <label className="mt-0.5 shrink-0 flex items-center justify-center w-6 h-6 cursor-pointer relative z-10" aria-label={`Select finding: ${finding.title}`}>
          <input
            type="checkbox"
            checked={!!selected}
            onChange={() => onToggleSelect(finding.id)}
            className="w-5 h-5 cursor-pointer accent-indigo-500"
          />
        </label>
        <Icon size={16} style={{ color: sev.color }} className="mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">{finding.title}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${sev.bg} ${sev.border} border`} style={{ color: sev.color }}>{sev.label}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10 uppercase">{finding.category}</span>
            {ignored && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10 uppercase">Ignored</span>}
            {reviewed && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">Reviewed</span>}
          </div>
          <p className="text-xs text-white/50 mt-1">{finding.description}</p>
        </div>
        {finding.actions.length > 0 && (
          <button type="button" onClick={() => setExpanded(!expanded)} className="shrink-0 text-white/40 hover:text-white/70 relative z-10" aria-label={expanded ? "Collapse finding details" : "Expand finding details"}>
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
      </div>
      {expanded && finding.actions.length > 0 && (
        <div className="px-4 pb-4 pl-11 flex flex-wrap gap-2">
          {finding.actions.map((a) => (
            <ActionButton
              key={a.id}
              action={a}
              onRun={(act) => onRunAction(finding, act)}
              onPreview={(act) => onPreviewAction(finding, act)}
              running={runningActionId === `${finding.id}:${a.id}`}
              done={doneActionIds.includes(`${finding.id}:${a.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}