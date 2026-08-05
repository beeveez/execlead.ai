import React from "react";
import { motion } from "framer-motion";
import { Boxes, Activity } from "lucide-react";

export default function PlatformServicesAdoption({ adoption, services }) {
  const metrics = [
    { label: "Total Services", value: adoption.totalServices, accent: "text-indigo-400" },
    { label: "Consumers", value: adoption.consumers, accent: "text-white" },
    { label: "Direct Base44 Calls Remaining", value: adoption.directBase44CallsRemaining, accent: adoption.directBase44CallsRemaining > 0 ? "text-rose-400" : "text-emerald-400" },
    { label: "Service Coverage", value: `${adoption.serviceCoverage}%`, accent: "text-indigo-400" },
    { label: "Repository Coverage", value: `${adoption.repositoryCoverage}%`, accent: "text-cyan-400" },
    { label: "AIService Adoption", value: `${adoption.aiServiceAdoption}%`, accent: "text-amber-400" },
    { label: "Prompt Registry Adoption", value: `${adoption.promptRegistryAdoption}%`, accent: "text-emerald-400" },
    { label: "Configuration Registry Adoption", value: `${adoption.configurationRegistryAdoption}%`, accent: "text-sky-400" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center"><Boxes size={14} className="text-indigo-400" /></div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-white/30">Sprint 2.1</div>
          <h3 className="text-sm font-semibold text-white">Platform Services Adoption™</h3>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl bg-white/[0.03] border border-white/8 p-3">
            <div className={`text-xl font-bold ${m.accent}`}>{m.value}</div>
            <div className="text-[9px] text-white/40 uppercase tracking-wider leading-tight mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2 flex items-center gap-1.5"><Activity size={11} /> PlatformServiceRegistry™</div>
        <div className="flex flex-wrap gap-1.5">
          {services.map((s) => (
            <span key={s.name} className={`text-[10px] px-2 py-1 rounded-lg border ${s.kind === 'service' ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-300" : "bg-white/[0.04] border-white/8 text-white/55"}`}>
              {s.name}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}