import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Shield, Activity, Database, Layers, GitBranch } from "lucide-react";

const STATUS_META = {
  synced: { label: "Healthy", color: "#10b981", icon: CheckCircle2 },
  needs_attention: { label: "Warning", color: "#f59e0b", icon: Activity },
  critical: { label: "Critical", color: "#ef4444", icon: Activity },
};

export default function SyncSuccessPanel({ result }) {
  if (!result) return null;
  const meta = STATUS_META[result.status] || STATUS_META.critical;
  const components = result.knowledgeHealth?.components || [];
  const guardianPassed = result.platformStateUpdate?.guardianStatus === "passed";

  const componentIcons = {
    "Knowledge Registry": Database,
    "Knowledge Packs": Layers,
    "Capability Graph": GitBranch,
    "Evidence Engine": Shield,
    "Reasoning Engine": Activity,
    "Platform Graph": Layers,
    "Guardian Validation": Shield,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-emerald-500/10 via-white/[0.02] to-transparent border border-emerald-500/15 rounded-2xl p-6 space-y-5"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10">
          <CheckCircle2 size={20} className="text-emerald-400" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Synchronization Complete</h3>
          <p className="text-white/40 text-xs">EXEC™ knowledge has been refreshed and platform state updated.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
          <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Knowledge Health</div>
          <div className="text-2xl font-bold" style={{ color: meta.color }}>{result.health}%</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
          <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Status</div>
          <div className="text-sm font-semibold flex items-center gap-1" style={{ color: meta.color }}>
            <meta.icon size={14} /> {meta.label}
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
          <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Last Sync</div>
          <div className="text-xs text-white/70">{new Date(result.lastSync).toLocaleTimeString()}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
          <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Duration</div>
          <div className="text-sm font-semibold text-white flex items-center gap-1">
            <Clock size={12} className="text-white/40" /> {result.duration}ms
          </div>
        </div>
      </div>

      {components.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] text-white/30 uppercase tracking-wider">Component Health</div>
          {components.map((c) => {
            const Icon = componentIcons[c.name] || Activity;
            const healthy = c.score >= 90;
            return (
              <div key={c.name} className="flex items-center gap-2.5 text-sm bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
                <Icon size={12} className={healthy ? "text-emerald-400" : "text-amber-400"} />
                <span className="text-white/70 flex-1">{c.name}</span>
                <span className="text-white/30 text-[10px]">{c.weight}</span>
                <span className={healthy ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>{c.score}%</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs">
        <Shield size={12} className={guardianPassed ? "text-emerald-400" : "text-amber-400"} />
        <span className="text-white/40">Guardian™:</span>
        <span className={guardianPassed ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"}>
          {guardianPassed ? "Passed" : "Warnings Detected"}
        </span>
      </div>
    </motion.div>
  );
}