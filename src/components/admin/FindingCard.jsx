import React, { useState } from "react";
import { AlertTriangle, AlertCircle, Info, ChevronDown, ChevronRight, ExternalLink, Code2, Wrench, Check, Copy, FileCode, Eye, Shield, Loader2 } from "lucide-react";
import { REPAIR_LEVEL_META, classifyFinding, getRepairMetadata } from "@/lib/repairEngine";

const SEVERITY = {
  critical: { color: "#ef4444", icon: AlertCircle, label: "Critical" },
  warning: { color: "#f59e0b", icon: AlertTriangle, label: "Warning" },
  information: { color: "#3b82f6", icon: Info, label: "Information" },
};

export default function FindingCard({ finding, selected, ignored, reviewed, onToggleSelect, onRunAction, onPreviewAction, onGeneratePatch, onMarkReviewed, runningActionId, doneActionIds }) {
  const [expanded, setExpanded] = useState(finding.severity === "critical");
  const [copied, setCopied] = useState(false);

  const level = classifyFinding(finding);
  const levelMeta = REPAIR_LEVEL_META[level];
  const metadata = getRepairMetadata(finding);
  const sev = SEVERITY[finding.severity] || SEVERITY.information;
  const SevIcon = sev.icon;

  const entityActions = finding.actions.filter((a) => a.type === "entity");
  const codeAction = finding.actions.find((a) => a.type === "code" && a.preview);
  const linkActions = finding.actions.filter((a) => a.type === "link");

  const handleCopyFix = () => {
    if (codeAction?.preview) {
      navigator.clipboard.writeText(codeAction.preview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isRunning = (actionId) => runningActionId === `${finding.id}:${actionId}`;
  const isDone = (actionId) => doneActionIds.includes(`${finding.id}:${actionId}`);

  return (
    <div className={`rounded-xl border ${levelMeta.ring} ${levelMeta.bg} overflow-hidden transition-opacity ${ignored ? "opacity-40" : ""} ${reviewed ? "ring-1 ring-emerald-500/30" : ""}`}>
      <div className="flex items-start gap-3 p-4">
        <label className="mt-0.5 shrink-0 flex items-center justify-center w-6 h-6 cursor-pointer relative z-10" aria-label={`Select finding: ${finding.title}`}>
          <input
            type="checkbox"
            data-finding-checkbox
            checked={!!selected}
            onChange={() => onToggleSelect(finding.id)}
            className="w-5 h-5 cursor-pointer accent-indigo-500"
          />
        </label>
        <span className="text-sm leading-none mt-1 shrink-0">{levelMeta.dot}</span>
        <SevIcon size={16} style={{ color: sev.color }} className="mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">{finding.title}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${levelMeta.badge}`}>{levelMeta.label}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10 uppercase">{finding.severity}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10 uppercase">{finding.category}</span>
            {ignored && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10 uppercase">Ignored</span>}
            {reviewed && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">Reviewed</span>}
          </div>
          <p className="text-xs text-white/50 mt-1">{finding.description}</p>
        </div>
        <button type="button" onClick={() => setExpanded(!expanded)} className="shrink-0 text-white/40 hover:text-white/70 relative z-10" aria-label={expanded ? "Collapse" : "Expand"}>
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pl-11 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-white/30 uppercase tracking-wider text-[10px] mb-0.5">Root Cause</div>
              <p className="text-white/60">{metadata.rootCause}</p>
            </div>
            {level === "manual" ? (
              <div>
                <div className="text-white/30 uppercase tracking-wider text-[10px] mb-0.5">Affected Components</div>
                <p className="text-white/60">{metadata.affectedComponents.join(", ")}</p>
              </div>
            ) : (
              <div>
                <div className="text-white/30 uppercase tracking-wider text-[10px] mb-0.5">Affected Files</div>
                <p className="text-white/60 font-mono text-[11px]">{metadata.affectedFiles.join(", ")}</p>
              </div>
            )}
          </div>

          {level === "auto" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-white/30 uppercase tracking-wider text-[10px] mb-0.5">Solution</div>
                  <p className="text-white/60">{metadata.solution}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-white/30 uppercase tracking-wider text-[10px] mb-0.5">Impact</div>
                    <p className="text-white/60">{metadata.impact}</p>
                  </div>
                  <div>
                    <div className="text-white/30 uppercase tracking-wider text-[10px] mb-0.5">Risk</div>
                    <p className="text-white/60 capitalize">{metadata.risk}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {entityActions.map((a) => (
                  <button key={a.id} type="button" onClick={() => onRunAction(finding, a)} disabled={isRunning(a.id) || isDone(a.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 disabled:opacity-40 text-emerald-300 text-xs font-medium transition-colors">
                    {isDone(a.id) ? <Check size={11} /> : isRunning(a.id) ? <Loader2 size={11} className="animate-spin" /> : <Wrench size={11} />}
                    {isDone(a.id) ? "Repaired" : a.label}
                  </button>
                ))}
                <button type="button" onClick={() => onMarkReviewed(finding)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs transition-colors">
                  <Eye size={11} /> Mark Reviewed
                </button>
              </div>
            </>
          )}

          {level === "guided" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-white/30 uppercase tracking-wider text-[10px] mb-0.5">Recommended Solution</div>
                  <p className="text-white/60">{metadata.solution}</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <div className="text-white/30 uppercase tracking-wider text-[10px] mb-0.5">Impact</div>
                    <p className="text-white/60">{metadata.impact}</p>
                  </div>
                  <div>
                    <div className="text-white/30 uppercase tracking-wider text-[10px] mb-0.5">Risk</div>
                    <p className="text-white/60 capitalize">{metadata.risk}</p>
                  </div>
                  <div>
                    <div className="text-white/30 uppercase tracking-wider text-[10px] mb-0.5">Effort</div>
                    <p className="text-white/60">{metadata.effort}</p>
                  </div>
                </div>
              </div>
              {codeAction?.preview && (
                <div className="rounded-lg bg-black/40 border border-white/5 p-3">
                  <div className="text-white/30 uppercase tracking-wider text-[10px] mb-1.5">Code Preview</div>
                  <pre className="text-xs text-white/70 font-mono whitespace-pre-wrap leading-relaxed">{codeAction.preview}</pre>
                </div>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                <button type="button" onClick={() => onGeneratePatch(finding)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-medium transition-colors">
                  <FileCode size={11} /> Generate Patch
                </button>
                <button type="button" onClick={() => onPreviewAction(finding, codeAction)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs transition-colors">
                  <Code2 size={11} /> Open in Editor
                </button>
                <button type="button" onClick={handleCopyFix} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs transition-colors">
                  {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />} {copied ? "Copied!" : "Copy Fix"}
                </button>
                <button type="button" onClick={() => onMarkReviewed(finding)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs transition-colors">
                  <Eye size={11} /> Mark Reviewed
                </button>
              </div>
            </>
          )}

          {level === "manual" && (
            <>
              <div className="rounded-lg bg-red-500/5 border border-red-500/15 p-3 flex items-start gap-2">
                <Shield size={14} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300/80">This issue cannot be repaired automatically because it requires architectural changes.</p>
              </div>
              <div className="text-xs">
                <div className="text-white/30 uppercase tracking-wider text-[10px] mb-0.5">Why Automation is Unsafe</div>
                <p className="text-white/60">{metadata.whyUnsafe}</p>
              </div>
              <div className="text-xs">
                <div className="text-white/30 uppercase tracking-wider text-[10px] mb-1">Recommended Implementation Steps</div>
                <ol className="list-decimal list-inside space-y-1">
                  {metadata.implementationSteps.map((step, i) => (
                    <li key={i} className="text-white/60">{step}</li>
                  ))}
                </ol>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-white/30 uppercase tracking-wider text-[10px] mb-0.5">Estimated Effort</div>
                  <p className="text-white/60">{metadata.effort}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {linkActions.map((a) => (
                  <a key={a.id} href={a.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs transition-colors">
                    <ExternalLink size={11} /> {a.label}
                  </a>
                ))}
                <button type="button" onClick={() => onMarkReviewed(finding)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs transition-colors">
                  <Eye size={11} /> Mark Reviewed
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}