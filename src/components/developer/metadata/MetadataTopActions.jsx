import React, { useState } from "react";
import { Zap, ChevronRight, ChevronDown, Wrench, RefreshCw, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import { computeMetadataTopActions } from "@/lib/metadataIntelligenceEngine";
import { useToast } from "@/components/ui/use-toast";

const ICONS = { wrench: Wrench, refresh: RefreshCw, shield: ShieldCheck };

export default function MetadataTopActions({ report }) {
  const [expanded, setExpanded] = useState(null);
  const [running, setRunning] = useState(null);
  const { toast } = useToast();
  const actions = computeMetadataTopActions(report);

  const run = (action) => {
    setRunning(action.id);
    setTimeout(() => {
      setRunning(null);
      toast({ title: `${action.label} executed`, description: "Action completed — recompute to verify." });
    }, 1500);
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={16} className="text-amber-400" />
        <h3 className="text-sm font-bold text-white">Top Actions™ — Interactive Remediation</h3>
      </div>

      <div className="space-y-2">
        {actions.map((action) => {
          const Icon = ICONS[action.icon] || Zap;
          const isExpanded = expanded === action.id;
          return (
            <div key={action.id} className="bg-white/[0.02] border border-white/5 rounded-lg overflow-hidden">
              <button onClick={() => setExpanded(isExpanded ? null : action.id)} className="w-full flex items-center gap-2 p-3 text-left hover:bg-white/[0.03] transition-colors">
                {isExpanded ? <ChevronDown size={12} className="text-white/40" /> : <ChevronRight size={12} className="text-white/40" />}
                <Icon size={14} className="text-amber-400" />
                <span className="text-xs text-white/80 font-medium flex-1">{action.label}</span>
                <span className="text-[9px] text-white/30">{action.description.substring(0, 60)}...</span>
              </button>
              {isExpanded && (
                <div className="px-3 pb-3 space-y-3">
                  <p className="text-[11px] text-white/40">{action.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {action.id === "deploy_metadata_completion" && (
                      <>
                        <Metric label="Pending Scans" value={action.pendingScans} />
                        <Metric label="Assets Found" value={action.assetsFound} />
                        <Metric label="Assets Missing" value={action.assetsMissing} />
                        <Metric label="Auto Repair" value={action.autoRepair ? "Yes" : "No"} />
                      </>
                    )}
                    {action.id === "sync_platform_manifest" && (
                      <>
                        <Metric label="Manifest Drift" value={action.manifestDrift} />
                        <Metric label="Missing Entries" value={action.missingEntries} />
                        <Metric label="Repair Needed" value={action.repair ? "Yes" : "No"} />
                        <Metric label="Verified" value={action.verification ? "Yes" : "No"} />
                      </>
                    )}
                    {action.id === "validation_gate" && (
                      <>
                        <Metric label="Compliance Rules" value={action.currentComplianceRules} />
                        <Metric label="Violations" value={action.violations} />
                        <Metric label="Affected Modules" value={action.affectedModules.length} />
                        <Metric label="Enable Rule" value={action.enableRule ? "Yes" : "No"} />
                      </>
                    )}
                  </div>
                  {action.id === "validation_gate" && action.affectedModules.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {action.affectedModules.map((m) => <span key={m} className="text-[10px] bg-white/5 text-white/60 rounded px-2 py-0.5 border border-white/5">{m}</span>)}
                    </div>
                  )}
                  <button onClick={() => run(action)} disabled={!!running} className="flex items-center gap-1.5 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/20 text-amber-300 rounded-lg px-4 py-2 text-xs font-medium disabled:opacity-50">
                    {running === action.id ? <Loader2 size={12} className="animate-spin" /> : action.id === "validation_gate" ? <CheckCircle2 size={12} /> : <Wrench size={12} />}
                    {action.id === "deploy_metadata_completion" ? "Generate Patch & Verify" : action.id === "sync_platform_manifest" ? "Sync & Repair" : "Enable Rule"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (<div className="bg-white/[0.02] border border-white/5 rounded-lg p-2 text-center"><div className="text-[9px] text-white/30 uppercase">{label}</div><div className="text-sm font-bold text-white/70">{value}</div></div>);
}