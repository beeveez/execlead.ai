import React from "react";
import { CheckCircle, XCircle, AlertTriangle, ShieldCheck, ShieldX, Lock } from "lucide-react";
import { RELEASE_GATE_CHECKS, RELEASE_GATE_MIN_SCORE, computePostureScore, getGateStatus } from "@/lib/securityExecutionEngine";

export default function ReleaseGate() {
  const currentScore = computePostureScore();
  const gate = getGateStatus();

  return (
    <div className="space-y-4">
      {/* Gate status banner */}
      <div className={`rounded-xl p-6 border ${gate.pass ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"}`}>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${gate.pass ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
            {gate.pass ? <ShieldCheck size={32} className="text-emerald-400" /> : <ShieldX size={32} className="text-red-400" />}
          </div>
          <div className="flex-1">
            <h2 className={`text-lg font-bold ${gate.pass ? "text-emerald-400" : "text-red-400"}`}>
              {gate.pass ? "RELEASE GATE: PASSED — Deployment Authorized" : "RELEASE GATE: BLOCKED — Deployment Not Permitted"}
            </h2>
            <p className="text-xs text-white/40 mt-1">
              {gate.pass ? "All security checks passed. Production deployment is authorized." : `${gate.failCount === 0 ? "No blocking failures — " : `${gate.failCount} blocking failure(s) — `}Security posture score (${gate.currentScore}%) is ${gate.thresholdMet ? "above" : "below"} the minimum threshold of ${gate.minScore}%.`}
            </p>
          </div>
        </div>
      </div>

      {/* Score threshold */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Lock size={14} className="text-indigo-400" /> Minimum Production Security Score</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">Threshold:</span>
            <span className="text-sm font-bold text-white">{gate.minScore}%</span>
            <span className="text-xs text-white/40">Current:</span>
            <span className={`text-sm font-bold ${gate.meetsThreshold ? "text-emerald-400" : "text-red-400"}`}>{gate.currentScore}%</span>
          </div>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full flex">
            <div className="h-full bg-red-500/30" style={{ width: `${gate.minScore}%` }} />
            <div className="h-full bg-emerald-500/30" style={{ width: `${100 - gate.minScore}%` }} />
          </div>
        </div>
        <div className="flex justify-between mt-1 text-[9px] text-white/30">
          <span>0%</span><span className="text-red-400">{gate.minScore}% threshold</span><span>100%</span>
        </div>
        <div className="mt-2 relative">
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${gate.meetsThreshold ? "bg-emerald-500" : "bg-red-500"}`} style={{ width: `${gate.currentScore}%` }} />
          </div>
          <div className="absolute top-0 h-3 w-px bg-white/40" style={{ left: `${gate.minScore}%` }} />
        </div>
        <p className="text-[10px] text-white/30 mt-1">← Current posture score ({gate.currentScore}%) — Minimum threshold ({gate.minScore}%) →</p>
      </div>

      {/* Gate checks */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Release Gate Checks ({gate.passCount}/{RELEASE_GATE_CHECKS.length} passed)</h3>
        <div className="space-y-2">
          {RELEASE_GATE_CHECKS.map((check) => (
            <div key={check.id} className={`flex items-center gap-3 p-3 rounded-lg border ${check.status === "pass" ? "bg-emerald-500/5 border-emerald-500/10" : check.status === "warn" ? "bg-amber-500/5 border-amber-500/10" : "bg-red-500/5 border-red-500/10"}`}>
              {check.status === "pass" ? <CheckCircle size={18} className="text-emerald-400 shrink-0" /> : check.status === "warn" ? <AlertTriangle size={18} className="text-amber-400 shrink-0" /> : <XCircle size={18} className="text-red-400 shrink-0" />}
              <div className="flex-1">
                <div className="text-xs text-white/80">{check.name}</div>
                <div className="text-[10px] text-white/40">{check.detail}</div>
              </div>
              <span className={`text-[9px] px-2 py-1 rounded-full font-medium ${check.status === "pass" ? "bg-emerald-500/15 text-emerald-400" : check.status === "warn" ? "bg-amber-500/15 text-amber-400" : "bg-red-500/15 text-red-400"} uppercase`}>
                {check.status === "pass" ? "Pass" : check.status === "warn" ? "Warning" : "Block"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck size={16} className="text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-indigo-400">Production Deployment is Blocked If:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mt-2 text-[10px] text-white/40">
            <span>✗ Critical vulnerabilities exist</span>
            <span>✗ Security tests failed</span>
            <span>✗ Backup validation failed</span>
            <span>✗ Authentication is broken</span>
            <span>✗ Authorization checks failed</span>
            <span>✗ Audit logs are missing</span>
            <span>✗ Secret exposure detected</span>
            <span>✗ Posture score below {RELEASE_GATE_MIN_SCORE}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}