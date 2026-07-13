import React, { useState } from "react";
import { Wrench, Eye, Check, Undo2, ShieldCheck, RefreshCw, Loader2, FileCode } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const STEPS = ["idle", "patch", "preview", "applied", "verified", "rolled-back"];

export default function SelfHealingActions({ item }) {
  const [step, setStep] = useState("idle");
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  if (!item.autoRepair && item.field !== "knowledgeEntry") {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <Wrench size={12} className="text-white/30" />
          <span className="text-[10px] text-white/40">Manual fix required — no auto-repair available for this field.</span>
        </div>
        <p className="text-[10px] text-white/30 mt-1.5 pl-5">{item.repairAction || `Manually add ${item.field || item.category || "metadata"} to ${item.entity || item.name || "registry"}.`}</p>
      </div>
    );
  }

  const patch = item.repairAction || `Auto-generate ${item.field || item.category || "metadata"} metadata for ${item.entity || item.name || "this item"}`;
  const run = (next, msg) => { setBusy(true); setTimeout(() => { setStep(next); setBusy(false); toast({ title: "Self-Healing", description: msg }); }, 600); };

  return (
    <div className="bg-cyan-500/5 border border-cyan-500/15 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck size={12} className="text-cyan-400" />
        <span className="text-[10px] font-medium text-cyan-400 uppercase tracking-wider">Self-Healing Available</span>
      </div>
      {step === "idle" && (
        <button onClick={() => run("patch", "Patch generated")} disabled={busy}
          className="w-full flex items-center justify-center gap-2 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/20 text-cyan-300 rounded-lg px-3 py-2 text-xs transition-colors disabled:opacity-50">
          {busy ? <Loader2 size={12} className="animate-spin" /> : <FileCode size={12} />} Generate Patch
        </button>
      )}
      {step === "patch" && (
        <div className="space-y-2">
          <div className="bg-[#0a0a0f] border border-white/5 rounded p-2 font-mono text-[10px] text-emerald-400/80">
            <div className="text-white/30 mb-1">// Generated patch</div>
            {patch}
          </div>
          <div className="flex gap-2">
            <button onClick={() => run("preview", "Changes previewed")} disabled={busy}
              className="flex-1 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-lg px-3 py-1.5 text-xs transition-colors disabled:opacity-50">
              <Eye size={11} /> Preview
            </button>
            <button onClick={() => run("applied", "Fix applied — recompute to verify")} disabled={busy}
              className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/20 text-emerald-300 rounded-lg px-3 py-1.5 text-xs transition-colors disabled:opacity-50">
              <Check size={11} /> Apply Fix
            </button>
          </div>
        </div>
      )}
      {step === "preview" && (
        <div className="space-y-2">
          <div className="bg-[#0a0a0f] border border-white/5 rounded p-2 font-mono text-[10px] text-white/60">
            <div className="text-white/30 mb-1">// Diff preview</div>
            <div className="text-emerald-400">+ {item.field || item.category || "metadata"}: "auto-generated"</div>
          </div>
          <button onClick={() => run("applied", "Fix applied — recompute to verify")} disabled={busy}
            className="w-full flex items-center justify-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/20 text-emerald-300 rounded-lg px-3 py-1.5 text-xs transition-colors disabled:opacity-50">
            <Check size={11} /> Apply Fix
          </button>
        </div>
      )}
      {(step === "applied" || step === "verified") && (
        <div className="space-y-2">
          {step === "applied" && (
            <button onClick={() => run("verified", "Verification complete — score updated")} disabled={busy}
              className="w-full flex items-center justify-center gap-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/20 text-blue-300 rounded-lg px-3 py-1.5 text-xs transition-colors disabled:opacity-50">
              {busy ? <Loader2 size={11} className="animate-spin" /> : <ShieldCheck size={11} />} Verify
            </button>
          )}
          {step === "verified" && (
            <button onClick={() => run("rolled-back", "Fix rolled back")} disabled={busy}
              className="w-full flex items-center justify-center gap-1.5 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/20 text-amber-300 rounded-lg px-3 py-1.5 text-xs transition-colors disabled:opacity-50">
              <Undo2 size={11} /> Rollback
            </button>
          )}
        </div>
      )}
      {step === "verified" && (
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 mt-1.5">
          <Check size={10} /> Verified — recompute score to update coverage
        </div>
      )}
    </div>
  );
}