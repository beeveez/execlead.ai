import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Shield, Activity, Database, Layers, GitBranch } from "lucide-react";
import MetricRow from "@/components/metric-intelligence/MetricRow";
import { openMetricDrawer } from "@/lib/metricDrawerStore";

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

  const COMPONENT_METRIC_IDS = {
    "Knowledge Registry": "knowledge_registry",
    "Knowledge Packs": "knowledge_packs",
    "Capability Graph": "capability_graph",
    "Evidence Engine": "evidence_engine",
    "Reasoning Engine": "reasoning_engine",
    "Platform Graph": "platform_graph",
    "Guardian Validation": "guardian_validation",
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
          <div className="text-[10px] text-white/30 uppercase tracking-wider">Component Health — Click any row for details</div>
          {components.map((c) => {
            const Icon = componentIcons[c.name] || Activity;
            const metricId = COMPONENT_METRIC_IDS[c.name];
            return (
              <MetricRow
                key={c.name}
                metricId={metricId}
                score={c.score}
                label={c.name}
                icon={Icon}
                weight={c.weight}
              />
            );
          })}
        </div>
      )}

      <button
        onClick={() => openMetricDrawer("guardian_validation", guardianPassed ? 100 : 58, null, "Guardian Validation")}
        className="flex items-center gap-2 text-xs bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2 w-full hover:border-white/15 hover:bg-white/[0.04] transition-all cursor-pointer"
      >
        <Shield size={12} className={guardianPassed ? "text-emerald-400" : "text-amber-400"} />
        <span className="text-white/40">Guardian™:</span>
        <span className={guardianPassed ? "text-emerald-400 font-medium" : "text-amber-400 font-medium"}>
          {guardianPassed ? "Passed" : "Warnings Detected"}
        </span>
        <span className="ml-auto text-white/20 text-[10px]">Click for details →</span>
      </button>
    </motion.div>
  );
}