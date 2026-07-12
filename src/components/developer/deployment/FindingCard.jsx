import React, { useState } from "react";
import { ChevronDown, Zap, Copy, X, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const LEVEL_CFG = {
  error: { color: "text-red-400", border: "border-red-500/20", bg: "bg-red-500/5", label: "Critical", priority: "P0" },
  warning: { color: "text-amber-400", border: "border-amber-500/20", bg: "bg-amber-500/5", label: "Medium", priority: "P1" },
  info: { color: "text-blue-400", border: "border-blue-500/20", bg: "bg-blue-500/5", label: "Info", priority: "P2" },
};

export default function FindingCard({ finding, onDismiss, onVerify, query }) {
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();
  const cfg = LEVEL_CFG[finding.level] || LEVEL_CFG.info;
  const matches = !query || finding.message?.toLowerCase().includes(query.toLowerCase()) ||
    finding.code?.toLowerCase().includes(query.toLowerCase()) ||
    finding.rootCause?.toLowerCase().includes(query.toLowerCase());
  if (!matches) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(finding.recommendedAction || finding.message);
    toast({ title: "Repair patch copied to clipboard" });
  };
  const handleAutoRepair = () => {
    toast({ title: "⚡ Auto Repair initiated", description: finding.recommendedAction });
  };

  return (
    <div className={`rounded-lg border ${cfg.border} ${cfg.bg} overflow-hidden`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/[0.02]">
        <ChevronDown size={14} className={`text-white/30 transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`} />
        <span className={`text-xs font-bold shrink-0 ${cfg.color}`}>{cfg.label}</span>
        <span className="text-sm text-white/70 flex-1 truncate">{finding.message}</span>
        {finding.autoRepairable && <Zap size={12} className="text-amber-400 shrink-0" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-3 text-xs">
            <Field label="Severity" value={cfg.label} />
            <Field label="Priority" value={cfg.priority} />
            <Field label="Category" value={finding.code?.replace(/_/g, " ") || "—"} />
            <Field label="Engineering Owner" value={finding.relatedRegistries?.[0] || "Platform Engineering"} />
            <Field label="Confidence" value={finding.autoRepairable ? "High" : "Medium"} />
            <Field label="Auto Repair" value={finding.autoRepairable ? "Available" : "Manual"} />
          </div>
          <Detail label="Root Cause" value={finding.rootCause} />
          <Detail label="Impact" value={finding.impact} />
          <Detail label="Suggested Fix" value={finding.recommendedAction} />
          {finding.evidence?.length > 0 && (
            <div>
              <Label text="Evidence" />
              <div className="mt-1 space-y-1">
                {finding.evidence.map((e, i) => (
                  <div key={i} className="text-xs text-white/40 font-mono bg-white/[0.02] rounded px-2 py-1">{e}</div>
                ))}
              </div>
            </div>
          )}
          {finding.affectedModules?.length > 0 && (
            <div>
              <Label text="Affected Modules" />
              <div className="mt-1 flex flex-wrap gap-1">
                {finding.affectedModules.map((m, i) => (
                  <span key={i} className="text-xs text-white/50 bg-white/5 rounded px-2 py-0.5 font-mono">{m}</span>
                ))}
              </div>
            </div>
          )}
          {finding.relatedRegistries?.length > 0 && (
            <div>
              <Label text="Related Registries" />
              <div className="mt-1 flex flex-wrap gap-1">
                {finding.relatedRegistries.map((r, i) => (
                  <span key={i} className="text-xs text-indigo-400/70 bg-indigo-500/5 rounded px-2 py-0.5">{r}</span>
                ))}
              </div>
            </div>
          )}
          {finding.auditHistory?.length > 0 && (
            <div>
              <Label text="Previous Occurrences" />
              <div className="mt-1 space-y-1">
                {finding.auditHistory.slice(0, 5).map((a, i) => (
                  <div key={i} className="text-xs text-white/30 font-mono">{a.timestamp || a.appliedAt || JSON.stringify(a).slice(0, 100)}</div>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-wrap gap-2 pt-2">
            {finding.autoRepairable && (
              <ActionBtn onClick={handleAutoRepair} icon={Zap} label="Run Auto Repair" className="text-amber-400 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20" />
            )}
            <ActionBtn onClick={handleCopy} icon={Copy} label="Copy Repair Patch" />
            <ActionBtn onClick={() => onVerify?.(finding)} icon={RefreshCw} label="Verify Again" />
            <ActionBtn onClick={() => onDismiss?.(finding)} icon={X} label="Dismiss" />
          </div>
        </div>
      )}
    </div>
  );
}

const Field = ({ label, value }) => (
  <div><span className="text-white/30">{label}</span><p className="text-white/60 font-medium">{value}</p></div>
);
const Detail = ({ label, value }) => (
  <div><Label text={label} /><p className="text-white/60 text-xs mt-0.5">{value}</p></div>
);
const Label = ({ text }) => <span className="text-white/30 text-xs uppercase tracking-wider">{text}</span>;
const ActionBtn = ({ onClick, icon: Icon, label, className = "text-white/60 bg-white/5 border-white/5 hover:bg-white/10" }) => (
  <button onClick={onClick} className={`text-xs flex items-center gap-1.5 border rounded px-3 py-1.5 transition-colors ${className}`}>
    <Icon size={12} /> {label}
  </button>
);