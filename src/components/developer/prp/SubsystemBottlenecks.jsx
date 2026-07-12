import React from "react";
import { AlertTriangle } from "lucide-react";
import { SUBSYSTEM_BOTTLENECKS } from "@/lib/performanceResilienceEngine";

export default function SubsystemBottlenecks() {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={16} className="text-amber-400" />
        <h3 className="text-sm font-bold text-white">Subsystem Bottleneck Analysis</h3>
        <span className="text-[10px] text-white/30 ml-auto">{SUBSYSTEM_BOTTLENECKS.length} subsystems</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SUBSYSTEM_BOTTLENECKS.map((s) => (
          <div key={s.subsystem} className="rounded-lg bg-white/[0.02] border border-white/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold text-white">{s.subsystem}</span>
            </div>
            <div className="space-y-1.5">
              <Field label="Current Capacity" value={s.currentCapacity} />
              <Field label="Breaking Point" value={s.breakingPoint} accent="amber" />
              <Field label="Failure Symptoms" value={s.failureSymptoms} />
              <Field label="Root Cause" value={s.rootCause} />
              <Field label="User Impact" value={s.userImpact} accent="red" />
              <Field label="Mitigation" value={s.mitigationStrategy} accent="emerald" />
              <Field label="Auto Recovery" value={s.autoRecovery} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value, accent }) {
  const color = accent === "amber" ? "text-amber-400/80" : accent === "red" ? "text-red-400/80" : accent === "emerald" ? "text-emerald-400/80" : "text-white/60";
  return (
    <div className="flex items-start gap-2">
      <span className="text-[10px] text-white/30 uppercase tracking-wider w-28 flex-shrink-0 mt-0.5">{label}</span>
      <span className={`text-[11px] flex-1 ${color}`}>{value}</span>
    </div>
  );
}