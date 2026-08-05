import React from "react";
import { motion } from "framer-motion";
import { Activity, Database, Sparkles, AlertTriangle, AlertCircle, RefreshCw } from "lucide-react";

export default function ServiceObservability({ observability, consumerCount, onRefresh }) {
  const o = observability || {};
  const services = o.byService || {};
  const serviceList = Object.entries(services).sort((a, b) => b[1] - a[1]);
  const metrics = [
    { icon: Activity, label: "Consumer Count", value: consumerCount ?? 0, accent: "text-indigo-400" },
    { icon: Database, label: "Repository Calls", value: o.repositoryCalls || 0, accent: "text-cyan-400" },
    { icon: Sparkles, label: "AI Calls", value: o.aiCalls || 0, accent: "text-amber-400" },
    { icon: Activity, label: "Avg Response Time", value: `${o.avgResponseTimeMs || 0}ms`, accent: "text-emerald-400" },
    { icon: AlertCircle, label: "Errors", value: o.errors || 0, accent: (o.errors || 0) > 0 ? "text-rose-400" : "text-white/60" },
    { icon: AlertTriangle, label: "Warnings", value: o.warnings || 0, accent: (o.warnings || 0) > 0 ? "text-amber-400" : "text-white/60" },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Activity size={14} className="text-emerald-400" /></div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/30">Sprint 2.2</div>
            <h3 className="text-sm font-semibold text-white">Service Observability™</h3>
          </div>
        </div>
        <button onClick={onRefresh} className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/70 transition-colors">
          <RefreshCw size={11} /> Refresh
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl bg-white/[0.03] border border-white/8 p-3">
            <m.icon size={13} className={`${m.accent} mb-1.5`} />
            <div className={`text-lg font-bold ${m.accent}`}>{m.value}</div>
            <div className="text-[9px] text-white/40 uppercase tracking-wider leading-tight">{m.label}</div>
          </div>
        ))}
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Service Health</div>
        {serviceList.length === 0 ? (
          <div className="text-[11px] text-white/40">No service calls recorded yet. Interact with migrated consumers (Executive Coach™, Resume Builder™) to populate live metrics.</div>
        ) : (
          <div className="space-y-1.5">
            {serviceList.map(([name, count]) => (
              <div key={name} className="flex items-center justify-between text-[11px]">
                <span className="text-white/70">{name}</span>
                <span className="text-white/40">{count} calls · <span className="text-emerald-400">operational</span></span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}