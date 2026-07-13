import React, { useState } from "react";
import {
  Wrench, Zap, Code, BookOpen, UserPlus, ShieldCheck,
  RotateCcw, FileJson, FileSpreadsheet, FileText, Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  executeAutoRepair, generatePatch, verifyRepair, rollbackRepair,
  assignOwner, exportJSON, exportCSV, exportPDF, downloadFile,
} from "@/lib/repairWorkflowEngine";

export default function RepairActionBar({ finding, repairState, user, onStateChange }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(null);
  const [showPatch, setShowPatch] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [ownerInput, setOwnerInput] = useState(repairState.owner || finding.owner || "");

  const wrap = async (id, fn, successMsg) => {
    setLoading(id);
    try {
      const result = await fn();
      toast({ title: id === "auto_repair" ? "Auto Repair™" : id.replace(/_/g, " "), description: result.message || successMsg });
      onStateChange();
      if (id === "generate_patch") setShowPatch(true);
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const status = repairState.status;

  const Btn = ({ id, label, icon: Icon, onClick, disabled, color = "text-white/70 border-white/10 bg-white/[0.02] hover:bg-white/[0.05]" }) => (
    <button
      onClick={onClick}
      disabled={!!loading || disabled}
      className={`flex items-center justify-center gap-1.5 text-[10px] px-3 py-2 rounded-lg border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${color}`}
    >
      {loading === id ? <Loader2 size={11} className="animate-spin" /> : <Icon size={11} />}
      {label}
    </button>
  );

  return (
    <div className="space-y-3">
      {/* Primary Actions */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
        <div className="text-[9px] text-white/30 uppercase tracking-wider mb-2">Actions</div>
        <div className="grid grid-cols-2 gap-2">
          {finding.autoRepairable && (
            <Btn id="auto_repair" label="Auto Repair™" icon={Wrench} color="text-emerald-400 border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20"
              disabled={status === "verified" || status === "applied"}
              onClick={() => wrap("auto_repair", () => executeAutoRepair(finding, user))} />
          )}
          <Btn id="generate_patch" label="Generate Patch™" icon={Zap} color="text-violet-400 border-violet-500/20 bg-violet-500/10 hover:bg-violet-500/20"
            onClick={() => wrap("generate_patch", () => generatePatch(finding))} />
          <Btn id="open_source" label="Open Source™" icon={Code}
            onClick={() => {
              if (finding.deepLink) window.open(finding.deepLink, "_blank");
              else if (finding.sourceFiles.length > 0) toast({ title: "Source files", description: finding.sourceFiles.join("\n") });
            }} />
          <Btn id="manual" label="Manual Instructions" icon={BookOpen}
            onClick={() => setShowInstructions(!showInstructions)} />
          <Btn id="assign_owner" label="Assign Owner" icon={UserPlus}
            onClick={() => setShowAssign(!showAssign)} />
          <Btn id="verify" label="Verify" icon={ShieldCheck} color="text-blue-400 border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20"
            disabled={status === "open" || status === "verified"}
            onClick={() => wrap("verify", () => verifyRepair(finding))} />
          <Btn id="rollback" label="Rollback" icon={RotateCcw} color="text-amber-400 border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20"
            disabled={status === "open" || status === "rolled_back"}
            onClick={() => { rollbackRepair(finding); onStateChange(); toast({ title: "Rolled back", description: `Reverted from ${status}` }); }} />
        </div>

        {/* Assign Owner Input */}
        {showAssign && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
            <input
              value={ownerInput}
              onChange={(e) => setOwnerInput(e.target.value)}
              placeholder="Owner name..."
              className="flex-1 bg-white/[0.02] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/70 focus:outline-none focus:border-violet-500/40"
            />
            <button
              onClick={() => { assignOwner(finding.id, ownerInput); onStateChange(); setShowAssign(false); toast({ title: "Owner assigned", description: ownerInput }); }}
              className="text-[10px] px-3 py-1.5 rounded-lg bg-violet-500/20 text-violet-300 border border-violet-500/20 hover:bg-violet-500/30"
            >Assign</button>
          </div>
        )}

        {/* Manual Repair Instructions */}
        {showInstructions && (
          <div className="mt-2 pt-2 border-t border-white/5 space-y-1.5">
            <div className="text-[10px] text-white/50 font-medium">Manual Repair Instructions:</div>
            <div className="bg-[#0a0a0f] border border-white/5 rounded-lg p-2.5 text-[10px] text-white/60 font-mono">
              {finding.repairAction}
            </div>
            <div className="text-[10px] text-white/40">Verification: {finding.verificationEngine}</div>
          </div>
        )}

        {/* Generated Patch */}
        {showPatch && repairState.patch && (
          <div className="mt-2 pt-2 border-t border-white/5 space-y-2">
            <div className="text-[10px] text-violet-400 font-medium flex items-center gap-1">
              <Zap size={10} /> Generated Patch
            </div>
            <div className="bg-[#0a0a0f] border border-white/5 rounded-lg p-2.5">
              <div className="text-[9px] text-white/30 mb-1">// BEFORE</div>
              <pre className="text-[10px] text-red-400/80 font-mono whitespace-pre-wrap">{repairState.patch.before}</pre>
            </div>
            <div className="bg-[#0a0a0f] border border-white/5 rounded-lg p-2.5">
              <div className="text-[9px] text-white/30 mb-1">// AFTER</div>
              <pre className="text-[10px] text-emerald-400/80 font-mono whitespace-pre-wrap">{repairState.patch.after}</pre>
            </div>
            {repairState.patch.verificationSteps && (
              <div className="text-[10px] text-white/40 space-y-0.5">
                <div className="font-medium text-white/50">Verification Steps:</div>
                {repairState.patch.verificationSteps.map((s, i) => (
                  <div key={i}>{i + 1}. {s}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Export & Reporting */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
        <div className="text-[9px] text-white/30 uppercase tracking-wider mb-2">Reporting</div>
        <div className="grid grid-cols-4 gap-2">
          <Btn id="pdf" label="PDF" icon={FileText}
            onClick={() => exportPDF(finding)} />
          <Btn id="json" label="JSON" icon={FileJson}
            onClick={() => downloadFile(exportJSON(finding), `repair-${finding.id}.json`, "application/json")} />
          <Btn id="csv" label="CSV" icon={FileSpreadsheet}
            onClick={() => downloadFile(exportCSV(finding), `repair-${finding.id}.csv`, "text/csv")} />
          <Btn id="history" label="History" icon={FileText}
            onClick={() => downloadFile(JSON.stringify(repairState.history || [], null, 2), `repair-history-${finding.id}.json`, "application/json")} />
        </div>
      </div>
    </div>
  );
}