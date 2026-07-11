import React from "react";
import {
  ShieldCheck, ShieldAlert, Lock, CheckCircle2, XCircle,
} from "lucide-react";

/**
 * EXEC™ Cognitive Engine™ Release Gate
 * Replaces the generic Architectural Gate™ with a formal release gate.
 * Sprint 2 is BLOCKED until this gate shows CERTIFIED.
 */
export default function CognitiveEngineReleaseGate({ cert }) {
  const { releaseGate } = cert;
  const certified = releaseGate.foundationCertified;

  return (
    <div
      className={`rounded-xl border p-5 ${
        certified ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        {certified ? (
          <ShieldCheck size={18} className="text-emerald-400" />
        ) : (
          <ShieldAlert size={18} className="text-red-400" />
        )}
        <h3 className="text-sm font-bold text-white">EXEC™ Cognitive Engine™ Release Gate</h3>
        <span
          className={`ml-auto text-xs font-bold px-3 py-1 rounded-full ${
            certified ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
          }`}
        >
          {releaseGate.status}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <GateMetric
          label="Foundation Certified"
          value={certified ? "YES" : "NO"}
          passed={certified}
        />
        <GateMetric
          label="Certification Score"
          value={`${releaseGate.certificationScore}%`}
          sub={`Required: ${releaseGate.requiredThreshold}%`}
          passed={releaseGate.certificationScore >= releaseGate.requiredThreshold}
        />
        <GateMetric
          label="Remaining Tasks"
          value={releaseGate.remainingTasks}
          passed={releaseGate.remainingTasks === 0}
        />
        <GateMetric
          label="Est. Completion"
          value={releaseGate.estimatedCompletion}
          passed={certified}
        />
      </div>

      {releaseGate.blockingDomains.length > 0 && (
        <div className="mt-4">
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">
            Blocking Domains
          </div>
          <div className="flex flex-wrap gap-2">
            {releaseGate.blockingDomains.map((d) => (
              <span
                key={d}
                className="text-xs px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400"
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2 text-xs">
          {certified ? (
            <>
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span className="text-emerald-400">
                Sprint 2 (EXEC™ Cognitive Engine™) is authorized to begin.
              </span>
            </>
          ) : (
            <>
              <Lock size={14} className="text-red-400" />
              <span className="text-red-400">
                Sprint 2 (EXEC™ Cognitive Engine™) is BLOCKED until the foundation is certified.
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function GateMetric({ label, value, sub, passed }) {
  return (
    <div
      className={`rounded-lg p-3 border ${
        passed
          ? "bg-emerald-500/5 border-emerald-500/10"
          : "bg-red-500/5 border-red-500/10"
      }`}
    >
      <div className="text-[9px] text-white/40 uppercase tracking-wider mb-1">{label}</div>
      <div
        className={`text-sm font-bold ${passed ? "text-emerald-400" : "text-red-400"}`}
      >
        {value}
      </div>
      {sub && <div className="text-[9px] text-white/30 mt-0.5">{sub}</div>}
    </div>
  );
}