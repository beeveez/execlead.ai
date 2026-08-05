import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, CheckCircle2, XCircle } from "lucide-react";

export default function ArchitectureValidation({ validation }) {
  const v = validation || { consumers: [], violations: [], passed: true };
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${v.passed ? "bg-emerald-500/10" : "bg-rose-500/10"}`}>
          <ShieldCheck size={14} className={v.passed ? "text-emerald-400" : "text-rose-400"} />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-white/30">Sprint 2.2</div>
          <h3 className="text-sm font-semibold text-white">Architecture Validation</h3>
        </div>
        <span className={`ml-auto text-[10px] px-2 py-1 rounded-full font-semibold ${v.passed ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : "bg-rose-500/15 text-rose-400 border border-rose-500/25"}`}>
          {v.passed ? "PASS" : "VIOLATIONS"}
        </span>
      </div>
      <div className="space-y-2">
        {v.consumers.map((c) => (
          <div key={c.name} className="rounded-xl bg-white/[0.02] border border-white/8 p-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-[12px] font-semibold text-white">{c.name}</div>
                <div className="text-[10px] text-white/30 font-mono">{c.file}</div>
              </div>
              {c.status === "pass" ? <CheckCircle2 size={16} className="text-emerald-400" /> : <XCircle size={16} className="text-rose-400" />}
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {c.uses.map((u) => (
                <span key={u} className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">{u}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {Object.entries(c.checks).map(([k, val]) => (
                <span key={k} className={`text-[10px] ${val === 0 ? "text-emerald-400/70" : "text-rose-400"}`}>{k}: {val}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      {v.violations?.length > 0 && (
        <div className="mt-3 text-[11px] text-rose-400">{v.violations.length} violation(s) detected.</div>
      )}
    </motion.div>
  );
}