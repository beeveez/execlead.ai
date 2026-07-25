import React from "react";
import { CheckCircle, AlertTriangle, Gauge, Zap, Activity } from "lucide-react";
import { RELEASE_GATE_CHECKS, RELEASE_GATE_MIN_SCORE, computePerformanceScore, getPerformanceGateStatus } from "@/lib/performanceExecutionEngine";

export default function PerformanceReleaseGate() {
  const currentScore = computePerformanceScore();
  const gate = getPerformanceGateStatus();

  return (
    <div className="space-y-4">
      <div className={`rounded-xl p-6 border ${gate.pass ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20"}`}>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${gate.pass ? "bg-emerald-500/10" : "bg-amber-500/10"}`}>
            {gate.pass ? <CheckCircle size={32} className="text-emerald-400" /> : <AlertTriangle size={32} className="text-amber-400" />}
          </div>
          <div className="flex-1">
            <h2 className={`text-lg font-bold ${gate.pass ? "text-emerald-400" : "text-amber-400"}`}>
              {gate.pass ? "PERFORMANCE GATE: PASSED — Deployment Authorized" : "PERFORMANCE GATE: WARNING — Score Below Threshold"}
            </h2>
            <p className="text-xs text-white/40 mt-1">
              {gate.pass ? "All performance checks passed. Production deployment is authorized." : `${gate.passCount}/${RELEASE_GATE_CHECKS.length} checks passed. Performance score (${gate.currentScore}%) is below the minimum threshold of ${gate.minScore}%. Fix the warning to authorize deployment.`}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Gauge size={14} className="text-indigo-400" /> Minimum Production Performance Score</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">Threshold:</span>
            <span className="text-sm font-bold text-white">{gate.minScore}%</span>
            <span className="text-xs text-white/40">Current:</span>
            <span className={`text-sm font-bold ${gate.thresholdMet ? "text-emerald-400" : "text-amber-400"}`}>{gate.currentScore}%</span>
          </div>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full flex">
            <div className="h-full bg-amber-500/30" style={{ width: `${gate.minScore}%` }} />
            <div className="h-full bg-emerald-500/30" style={{ width: `${100 - gate.minScore}%` }} />
          </div>
        </div>
        <div className="flex justify-between mt-1 text-[9px] text-white/30">
          <span>0%</span><span className="text-amber-400">{gate.minScore}% threshold</span><span>100%</span>
        </div>
        <div className="mt-2 relative">
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${gate.thresholdMet ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${gate.currentScore}%` }} />
          </div>
          <div className="absolute top-0 h-3 w-px bg-white/40" style={{ left: `${gate.minScore}%` }} />
        </div>
        <p className="text-[10px] text-white/30 mt-1">Current score ({gate.currentScore}%) — Minimum threshold ({gate.minScore}%)</p>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-3">Release Gate Checks ({gate.passCount}/{RELEASE_GATE_CHECKS.length} passed)</h3>
        <div className="space-y-2">
          {RELEASE_GATE_CHECKS.map((check) => (
            <div key={check.id} className={`flex items-center gap-3 p-3 rounded-lg border ${check.status === "pass" ? "bg-emerald-500/5 border-emerald-500/10" : "bg-amber-500/5 border-amber-500/10"}`}>
              {check.status === "pass" ? <CheckCircle size={18} className="text-emerald-400 shrink-0" /> : <AlertTriangle size={18} className="text-amber-400 shrink-0" />}
              <div className="flex-1">
                <div className="text-xs text-white/80">{check.name}</div>
                <div className="text-[10px] text-white/40">{check.detail}</div>
              </div>
              <span className={`text-[9px] px-2 py-1 rounded-full font-medium uppercase ${check.status === "pass" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}>
                {check.status === "pass" ? "Pass" : "Warning"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-4 flex items-start gap-3">
        <Activity size={16} className="text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-indigo-400">Production Deployment is Blocked If:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 mt-2 text-[10px] text-white/40">
            <span>Page Load exceeds 2 seconds</span>
            <span>API Response exceeds 300ms</span>
            <span>Error Rate exceeds 1%</span>
            <span>AI Queue Saturated</span>
            <span>Database Health Critical</span>
            <span>Cache Health Critical</span>
            <span>Performance Score below {RELEASE_GATE_MIN_SCORE}%</span>
            <span>Performance Regression exceeds 10%</span>
          </div>
        </div>
      </div>
    </div>
  );
}