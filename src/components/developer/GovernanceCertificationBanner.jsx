import React from "react";
import { AlertTriangle, RefreshCw, Award } from "lucide-react";

export default function GovernanceCertificationBanner({ certificate, pipelineRunning, onRefresh }) {
  if (pipelineRunning && !certificate) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl border bg-indigo-500/5 border-indigo-500/10">
        <RefreshCw size={20} className="text-indigo-400 animate-spin" />
        <div>
          <div className="text-white font-semibold text-sm">Running Governance Pipeline™…</div>
          <div className="text-white/40 text-xs">Validating 16 stages across 14 registries</div>
        </div>
      </div>
    );
  }

  if (!certificate) return null;

  const certified = certificate.certified;
  const Icon = certified ? Award : AlertTriangle;
  const colorClass = certified
    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
    : "bg-amber-500/10 border-amber-500/20 text-amber-400";

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border ${colorClass}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${certified ? "bg-emerald-500/10" : "bg-amber-500/10"}`}>
        <Icon size={24} className={certified ? "text-emerald-400" : "text-amber-400"} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={`text-lg font-bold ${certified ? "text-emerald-400" : "text-amber-400"}`}>
            {certified ? "Platform Certified" : "Platform Requires Attention"}
          </h3>
          {pipelineRunning && (
            <RefreshCw size={12} className="text-white/40 animate-spin" />
          )}
        </div>
        <div className="text-white/50 text-xs mt-0.5">
          Governance Score: {certificate.overallGovernanceScore}/100 ·
          {" "}{certificate.failures} failure(s) · {certificate.warnings} warning(s) ·
          {" "}Certified {new Date(certificate.timestamp).toLocaleTimeString()}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-right">
          <div className="text-[10px] text-white/30 uppercase tracking-wider">Trigger</div>
          <div className="text-xs text-white/60 font-medium">{certificate.trigger}</div>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={pipelineRunning}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40"
            title="Re-run Governance Pipeline"
          >
            <RefreshCw size={14} className={pipelineRunning ? "animate-spin" : ""} />
          </button>
        )}
      </div>
    </div>
  );
}