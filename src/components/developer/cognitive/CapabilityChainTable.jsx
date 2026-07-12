import React from "react";
import { GitBranch, CheckCircle2, AlertCircle, Link2 } from "lucide-react";

export default function CapabilityChainTable({ capabilities = [] }) {
  const complete = capabilities.filter((c) => c.complete).length;
  const broken = capabilities.length - complete;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch size={14} className="text-emerald-400" />
          <span className="text-sm font-bold text-white">Capability Chain Audit</span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="text-emerald-400">{complete} Complete</span>
          {broken > 0 && <span className="text-red-400">{broken} Broken</span>}
        </div>
      </div>
      <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
        {capabilities.map((cap, idx) => (
          <div key={idx} className="px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-white/80">{cap.capability}</span>
              {cap.complete ? (
                <CheckCircle2 size={12} className="text-emerald-400" />
              ) : (
                <AlertCircle size={12} className="text-red-400" />
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap text-[9px]">
              <ChainLink label={cap.knowledgePack || "Missing Pack"} ok={!!cap.knowledgePack} />
              <Link2 size={8} className="text-white/20" />
              <ChainLink label={cap.framework || "Missing Framework"} ok={!!cap.framework} />
              <Link2 size={8} className="text-white/20" />
              <ChainLink label={cap.evidence || "Missing Evidence"} ok={!!cap.evidence} />
              <Link2 size={8} className="text-white/20" />
              <ChainLink label={cap.persona || "Missing Persona"} ok={!!cap.persona} />
            </div>
            {cap.brokenAt && (
              <div className="text-[9px] text-red-400/70 mt-1">Broken at: {cap.brokenAt}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChainLink({ label, ok }) {
  return (
    <span className={`px-1.5 py-0.5 rounded font-medium ${
      ok ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
    }`}>
      {label}
    </span>
  );
}