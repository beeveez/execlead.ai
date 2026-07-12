import React from "react";
import { ShieldCheck, CheckCircle2, AlertCircle, XCircle, Layers } from "lucide-react";

function confColor(v) {
  if (v >= 80) return "#10b981";
  if (v >= 60) return "#f59e0b";
  if (v >= 40) return "#f97316";
  return "#ef4444";
}

function EvidenceRow({ source }) {
  const status = source.status || (source.coverage > 0 ? "available" : "missing");
  const Icon = status === "available" ? CheckCircle2 : status === "failed" ? XCircle : AlertCircle;
  const color = status === "available" ? "#10b981" : status === "failed" ? "#ef4444" : "#f59e0b";

  return (
    <div className="flex items-center gap-2 py-1 border-b border-border/50 last:border-0">
      <Icon size={10} style={{ color }} className="flex-shrink-0" />
      <span className="text-[10px] text-foreground flex-1 truncate">{source.source || source.name || "—"}</span>
      <span className="text-[9px] text-muted-foreground capitalize w-16 text-right">{status}</span>
      <div className="w-12 h-1 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${source.coverage || 0}%`, backgroundColor: confColor(source.coverage || 0) }} />
      </div>
      <span className="text-[9px] font-medium w-7 text-right" style={{ color: confColor(source.coverage || 0) }}>{source.coverage || 0}%</span>
      {source.contribution_weight !== undefined && (
        <span className="text-[9px] text-muted-foreground w-8 text-right">w:{source.contribution_weight}</span>
      )}
    </div>
  );
}

function FrameworkRow({ fw }) {
  return (
    <div className="py-1.5 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-2">
        <Layers size={10} className="text-indigo-500 flex-shrink-0" />
        <span className="text-[10px] font-bold text-foreground">{fw.name}</span>
        <span className="text-[9px] text-muted-foreground">— {fw.purpose}</span>
        <div className="flex-1" />
        <span className="text-[9px] font-bold" style={{ color: confColor(fw.confidence || 0) }}>{fw.confidence || 0}%</span>
        <span className="text-[9px] text-muted-foreground">contrib: {fw.contribution || 0}%</span>
      </div>
      {fw.influence && (
        <p className="text-[9px] text-muted-foreground mt-0.5 ml-4 italic">{fw.influence}</p>
      )}
    </div>
  );
}

export default function EvidenceTraceabilityMatrix({ evidence, frameworks, used, missing }) {
  const hasMatrix = evidence && evidence.length > 0;
  const hasFw = frameworks && frameworks.length > 0;
  const hasLists = (used && used.length > 0) || (missing && missing.length > 0);

  if (!hasMatrix && !hasFw && !hasLists) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <ShieldCheck size={12} className="text-indigo-500" />
        <h4 className="text-[11px] font-bold text-foreground uppercase tracking-wide">Evidence Traceability™ & Framework Transparency</h4>
      </div>

      {hasLists && (
        <div className="grid grid-cols-2 gap-2">
          {used && used.length > 0 && (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2">
              <div className="text-[9px] font-bold text-emerald-500 mb-1">Evidence Used</div>
              <div className="flex flex-wrap gap-1">
                {used.map((e, i) => (
                  <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">{e}</span>
                ))}
              </div>
            </div>
          )}
          {missing && missing.length > 0 && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-2">
              <div className="text-[9px] font-bold text-amber-500 mb-1">Evidence Missing</div>
              <div className="flex flex-wrap gap-1">
                {missing.map((e, i) => (
                  <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">{e}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {hasMatrix && (
        <div className="rounded-lg border border-border bg-muted/20 p-2">
          <div className="text-[9px] font-medium text-muted-foreground mb-1 uppercase tracking-wide">Evidence Sources</div>
          {evidence.map((src, i) => <EvidenceRow key={i} source={src} />)}
        </div>
      )}

      {hasFw && (
        <div className="rounded-lg border border-border bg-muted/20 p-2">
          <div className="text-[9px] font-medium text-muted-foreground mb-1 uppercase tracking-wide">Framework Influence</div>
          {frameworks.map((fw, i) => <FrameworkRow key={i} fw={fw} />)}
        </div>
      )}
    </div>
  );
}