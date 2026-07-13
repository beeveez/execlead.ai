import React, { useState } from "react";
import {
  X, ExternalLink, Wrench, FileText, Clock, GitBranch,
  AlertCircle, CheckCircle2, Activity, Download, ChevronDown,
} from "lucide-react";
import { TELEMETRY_STATE_CONFIG } from "@/lib/platformTelemetryService";
import { useRepairWorkflow } from "@/components/developer/repair/RepairWorkflowProvider";

function DiagnosticsField({ icon: Icon, label, children }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
      <div className="flex items-center gap-1.5 text-[9px] text-white/30 uppercase tracking-wider mb-1.5">
        <Icon size={10} /> {label}
      </div>
      <div className="text-xs text-white/80">{children}</div>
    </div>
  );
}

function ArrayList({ items }) {
  if (!items || items.length === 0) return <span className="text-white/30">—</span>;
  return (
    <div className="space-y-0.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="text-white/30">•</span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

export default function TelemetryDiagnosticsDrawer({ metric, onClose }) {
  const { openRepairWorkflow } = useRepairWorkflow();
  const [showNotes, setShowNotes] = useState(false);

  if (!metric) return null;

  const config = TELEMETRY_STATE_CONFIG[metric.state] || TELEMETRY_STATE_CONFIG.waiting;

  const handleRepair = () => {
    openRepairWorkflow({
      id: `telemetry-${metric.id}`,
      title: `${metric.label} — ${config.label}`,
      description: metric.engineeringNotes,
      evidence: [metric.sublabel, metric.value],
      sourceFile: metric.source,
      deepLink: metric.deepLink,
      owner: "Engineering Team",
      priority: metric.state === "waiting" ? "P1" : "P2",
      repairAction: metric.repairAction || `Review ${metric.label} telemetry configuration in the Diagnostics page.`,
      category: "Platform Telemetry",
    }, { source: "Platform Telemetry Service™" });
  };

  const handleExport = () => {
    const report = {
      metric: metric.label,
      state: config.label,
      value: metric.value,
      sublabel: metric.sublabel,
      source: metric.source,
      lastUpdated: metric.lastUpdated,
      dependencies: metric.dependencies,
      engineeringNotes: metric.engineeringNotes,
      expectedTelemetry: metric.expectedTelemetry,
      relatedComponents: metric.relatedComponents,
      repairAction: metric.repairAction,
      deepLink: metric.deepLink,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `telemetry-${metric.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0d0d14] border-l border-white/10 flex flex-col animate-fade-in">
        {/* Header */}
        <div className="shrink-0 border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-8 h-8 rounded-lg ${config.bg} border ${config.border} flex items-center justify-center shrink-0`}>
              <Activity size={14} style={{ color: config.color }} />
            </div>
            <div className="min-w-0">
              <div className="text-[9px] text-white/30 uppercase tracking-wider">Telemetry Diagnostics</div>
              <h3 className="text-sm font-bold text-white truncate">{metric.label}</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors shrink-0">
            <X size={14} />
          </button>
        </div>

        {/* Status Banner */}
        <div className={`shrink-0 ${config.bg} border-b ${config.border} px-4 py-2.5 flex items-center gap-2`}>
          <span className={`w-2 h-2 rounded-full ${config.dotClass} ${metric.state === "live" ? "animate-pulse" : ""}`} />
          <span className={`text-xs font-bold ${config.text}`}>{config.label}</span>
          <span className="text-[10px] text-white/40 ml-auto">{config.description}</span>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <DiagnosticsField icon={Activity} label="Current Value">
            <div className="font-mono">{metric.value}</div>
            {metric.sublabel && <div className="text-[10px] text-white/40 mt-0.5">{metric.sublabel}</div>}
          </DiagnosticsField>

          <DiagnosticsField icon={FileText} label="Source">
            {metric.source}
          </DiagnosticsField>

          <DiagnosticsField icon={Clock} label="Last Updated">
            {metric.lastUpdated || "—"}
          </DiagnosticsField>

          <DiagnosticsField icon={GitBranch} label="Dependencies">
            <ArrayList items={metric.dependencies} />
          </DiagnosticsField>

          <DiagnosticsField icon={AlertCircle} label="Engineering Notes">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="text-left text-xs text-white/60 hover:text-white/80 transition-colors flex items-start gap-1"
            >
              <ChevronDown size={10} className={`mt-0.5 transition-transform shrink-0 ${showNotes ? "rotate-180" : ""}`} />
              <span>{showNotes ? metric.engineeringNotes : `${metric.engineeringNotes.slice(0, 80)}${metric.engineeringNotes.length > 80 ? "..." : ""}`}</span>
            </button>
          </DiagnosticsField>

          <DiagnosticsField icon={CheckCircle2} label="Expected Telemetry">
            <ArrayList items={metric.expectedTelemetry} />
          </DiagnosticsField>

          <DiagnosticsField icon={GitBranch} label="Related Components">
            <ArrayList items={metric.relatedComponents} />
          </DiagnosticsField>

          {metric.repairAction && (
            <DiagnosticsField icon={Wrench} label="Repair Action">
              {metric.repairAction}
            </DiagnosticsField>
          )}
        </div>

        {/* Footer Actions */}
        <div className="shrink-0 border-t border-white/10 p-3 space-y-2">
          {metric.repairAction && (
            <button
              onClick={handleRepair}
              className="flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-colors w-full"
            >
              <Wrench size={12} /> Repair
            </button>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5 text-white/60 hover:bg-white/[0.05] hover:text-white/80 transition-colors flex-1"
            >
              <Download size={12} /> Export
            </button>
            {metric.deepLink && (
              <a
                href={metric.deepLink}
                className="flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg bg-violet-500/5 border border-violet-500/15 text-violet-400 hover:bg-violet-500/10 transition-colors flex-1"
              >
                <ExternalLink size={12} /> Open
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}