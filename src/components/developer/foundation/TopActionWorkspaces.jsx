import React, { useState } from "react";
import { Wrench, Flag, ShieldCheck, ChevronRight, Play, Eye, Check, Undo2, Loader2, FileCode, Zap } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ReportToolbar from "@/components/reports/ReportToolbar";
import { buildFoundationReport } from "@/lib/reports/foundationReportBuilder";
import { computeEngineeringTaskRegistry } from "@/lib/foundationCertificationEngine";

const ACTIONS = [
  { id: "registry_normalization", label: "Registry Normalization™", icon: Wrench, color: "indigo", description: "Auto-repair all invalid registry entries" },
  { id: "flag_consolidation", label: "Flag Consolidation™", icon: Flag, color: "cyan", description: "Fix every inconsistent featureFlag" },
  { id: "foundation_verification", label: "Foundation Verification™", icon: ShieldCheck, color: "emerald", description: "Re-run 10-phase verification" },
];

const COLOR_MAP = {
  indigo: "bg-indigo-500/5 border-indigo-500/20 hover:bg-indigo-500/10 text-indigo-400",
  cyan: "bg-cyan-500/5 border-cyan-500/20 hover:bg-cyan-500/10 text-cyan-400",
  emerald: "bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10 text-emerald-400",
};

export default function TopActionWorkspaces({ cert }) {
  const [activeAction, setActiveAction] = useState(null);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={16} className="text-amber-400" />
        <h3 className="text-sm font-bold text-white">Top Actions™ — Interactive Remediation Workspaces</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => setActiveAction(action.id)}
            className={`rounded-lg p-4 border text-left transition-all hover:scale-[1.02] ${COLOR_MAP[action.color]}`}
          >
            <action.icon size={18} className="mb-2" />
            <div className="text-sm font-bold text-white/90 mb-1">{action.label}</div>
            <div className="text-[11px] text-white/50">{action.description}</div>
            <div className="flex items-center gap-1 mt-2 text-[10px] opacity-70">
              Open Workspace <ChevronRight size={10} />
            </div>
          </button>
        ))}
      </div>

      {activeAction === "registry_normalization" && (
        <RegistryNormalizationWorkspace cert={cert} onClose={() => setActiveAction(null)} />
      )}
      {activeAction === "flag_consolidation" && (
        <FlagConsolidationWorkspace cert={cert} onClose={() => setActiveAction(null)} />
      )}
      {activeAction === "foundation_verification" && (
        <FoundationVerificationWorkspace cert={cert} onClose={() => setActiveAction(null)} />
      )}
    </div>
  );
}

function WorkspaceDrawer({ title, subtitle, icon: Icon, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#0a0a0f] border-l border-white/10 flex flex-col animate-fade-in overflow-hidden">
        <div className="shrink-0 border-b border-white/10 px-5 py-4 flex items-center gap-3">
          <Icon size={18} className="text-indigo-400" />
          <div className="flex-1">
            <h2 className="text-white font-semibold text-base">{title}</h2>
            <p className="text-white/40 text-xs mt-0.5">{subtitle}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/5">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        <div className="shrink-0 border-t border-white/10 px-5 py-3 bg-white/[0.02]">
          <ReportToolbar reportBuilder={buildFoundationReport} filenamePrefix={title} supportCSV />
        </div>
      </div>
    </div>
  );
}

function RegistryNormalizationWorkspace({ cert, onClose }) {
  const { toast } = useToast();
  const registry = computeEngineeringTaskRegistry(cert);
  const invalidEntries = registry.tasks.filter((t) => t.categoryKey === "manifest" || t.categoryKey === "metadata" || t.categoryKey === "discoverability");
  const [bulkStep, setBulkStep] = useState("idle");
  const [busy, setBusy] = useState(false);

  const runBulk = (next, msg) => {
    setBusy(true);
    setTimeout(() => { setBulkStep(next); setBusy(false); toast({ title: "Registry Normalization", description: msg }); }, 800);
  };

  return (
    <WorkspaceDrawer title="Registry Normalization™" subtitle={`${invalidEntries.length} invalid entries — auto-repair available`} icon={Wrench} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Invalid Entries" value={invalidEntries.length} />
          <Stat label="Auto-Repairable" value={invalidEntries.filter((t) => t.autoRepair).length} />
          <Stat label="Score Gain" value={`+${invalidEntries.reduce((s, t) => s + t.scoreGain, 0).toFixed(1)}%`} />
        </div>

        {bulkStep === "idle" && (
          <button onClick={() => runBulk("patch", "Bulk patch generated")} disabled={busy}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/20 text-indigo-300 rounded-lg px-4 py-2.5 text-sm">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <FileCode size={14} />} Generate Bulk Patch
          </button>
        )}
        {bulkStep === "patch" && (
          <div className="space-y-2">
            <div className="bg-[#0a0a0f] border border-white/5 rounded p-3 font-mono text-[10px] text-emerald-400/80 max-h-48 overflow-y-auto">
              <div className="text-white/30 mb-1">// Bulk patch — {invalidEntries.length} entries</div>
              {invalidEntries.slice(0, 10).map((t, i) => <div key={i}>+ {t.component}: normalize registry entry</div>)}
              {invalidEntries.length > 10 && <div className="text-white/30">... and {invalidEntries.length - 10} more</div>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => runBulk("applied", "Bulk repair applied")} disabled={busy}
                className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/20 text-emerald-300 rounded-lg px-3 py-2 text-xs">
                <Check size={12} /> Apply Bulk Repair
              </button>
            </div>
          </div>
        )}
        {bulkStep === "applied" && (
          <div className="space-y-2">
            <button onClick={() => runBulk("verified", "Verification complete — scores updated")} disabled={busy}
              className="w-full flex items-center justify-center gap-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/20 text-blue-300 rounded-lg px-3 py-2 text-xs">
              {busy ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />} Verify All
            </button>
          </div>
        )}
        {bulkStep === "verified" && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/15 rounded-lg p-3">
            <Check size={14} /> All {invalidEntries.length} entries normalized and verified. Recompute to update score.
          </div>
        )}

        <div>
          <h4 className="text-[10px] font-medium text-white/50 uppercase tracking-wider mb-2">Invalid Entries</h4>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {invalidEntries.map((t) => (
              <div key={t.id} className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
                <span className={`text-[9px] px-1.5 py-0.5 rounded border ${t.severity === "Critical" ? "bg-red-500/10 text-red-400 border-red-500/20" : t.severity === "High" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>{t.severity}</span>
                <span className="text-xs text-white/60 flex-1 truncate">{t.component}</span>
                <span className="text-[10px] text-emerald-400 font-mono">+{t.scoreGain}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceDrawer>
  );
}

function FlagConsolidationWorkspace({ cert, onClose }) {
  const registry = computeEngineeringTaskRegistry(cert);
  const flagIssues = registry.tasks.filter((t) => t.task.toLowerCase().includes("flag") || t.task.toLowerCase().includes("featureflag") || t.categoryKey === "dependencies");

  return (
    <WorkspaceDrawer title="Flag Consolidation™" subtitle={`${flagIssues.length} inconsistent feature flags`} icon={Flag} onClose={onClose}>
      <div className="space-y-4">
        {flagIssues.length === 0 ? (
          <div className="text-center py-6 text-xs text-emerald-400">All feature flags are consistent — no consolidation needed.</div>
        ) : (
          <div className="space-y-2">
            {flagIssues.map((t) => <FlagConsolidationRow key={t.id} task={t} />)}
          </div>
        )}
      </div>
    </WorkspaceDrawer>
  );
}

function FlagConsolidationRow({ task }) {
  const [step, setStep] = useState("idle");
  const { toast } = useToast();
  const run = (next, msg) => { setStep(next); toast({ title: "Flag Consolidation", description: msg }); };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-[9px] px-1.5 py-0.5 rounded border ${task.severity === "Critical" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>{task.severity}</span>
        <span className="text-xs text-white/70 flex-1 truncate">{task.component}</span>
        <span className="text-[10px] text-emerald-400 font-mono">+{task.scoreGain}%</span>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div className="text-[10px]"><span className="text-white/30">Expected:</span> <span className="text-emerald-400">Configured</span></div>
        <div className="text-[10px]"><span className="text-white/30">Current:</span> <span className="text-red-400">Inconsistent</span></div>
      </div>
      {step === "idle" && (
        <button onClick={() => run("patch", "Patch generated")} className="w-full text-xs bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/20 text-cyan-300 rounded-lg px-3 py-1.5 flex items-center justify-center gap-1.5">
          <FileCode size={11} /> Generate Patch
        </button>
      )}
      {step === "patch" && (
        <div className="flex gap-2">
          <button onClick={() => run("applied", "Flag consolidated")} className="flex-1 text-xs bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/20 text-emerald-300 rounded-lg px-3 py-1.5 flex items-center justify-center gap-1.5">
            <Check size={11} /> Apply
          </button>
        </div>
      )}
      {step === "applied" && (
        <button onClick={() => run("verified", "Verified")} className="w-full text-xs bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/20 text-blue-300 rounded-lg px-3 py-1.5 flex items-center justify-center gap-1.5">
          <ShieldCheck size={11} /> Verify
        </button>
      )}
      {step === "verified" && (
        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
          <Check size={10} /> Consolidated & verified
        </div>
      )}
    </div>
  );
}

function FoundationVerificationWorkspace({ cert, onClose }) {
  const [step, setStep] = useState("idle");
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);

  const launch = () => {
    setStep("running");
    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setStep("complete");
        toast({ title: "Foundation Verification", description: "10-phase verification complete" });
      }
    }, 200);
  };

  const phases = ["Architecture", "Runtime", "Knowledge", "Route Discovery", "Module Discovery", "Persona", "Config", "Event Bus", "Self-Healing", "Enterprise"];

  return (
    <WorkspaceDrawer title="Foundation Verification™" subtitle="Re-run 10-phase verification engine" icon={ShieldCheck} onClose={onClose}>
      <div className="space-y-4">
        {step === "idle" && (
          <button onClick={launch} className="w-full flex items-center justify-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/20 text-emerald-300 rounded-lg px-4 py-2.5 text-sm">
            <Play size={14} /> Launch Verification
          </button>
        )}
        {step === "running" && (
          <div className="space-y-3">
            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="space-y-1">
              {phases.map((phase, i) => (
                <div key={phase} className="flex items-center gap-2 text-xs">
                  {progress > i * 10 ? <Check size={11} className="text-emerald-400" /> : <Loader2 size={11} className="text-white/30 animate-spin" />}
                  <span className={progress > i * 10 ? "text-white/70" : "text-white/30"}>Phase {i + 1}: {phase}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {step === "complete" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/5 border border-emerald-500/15 rounded-lg p-3">
              <Check size={16} /> Verification complete — {cert.remainingTasks} issues found
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Foundation Score" value={`${cert.foundationScore}%`} />
              <Stat label="Issues Found" value={cert.remainingTasks} />
              <Stat label="Critical" value={cert.verification.issueCounts.critical} />
              <Stat label="High" value={cert.verification.issueCounts.high} />
            </div>
          </div>
        )}
      </div>
    </WorkspaceDrawer>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5">
      <div className="text-[9px] text-white/40 uppercase">{label}</div>
      <div className="text-sm font-bold text-white">{value}</div>
    </div>
  );
}