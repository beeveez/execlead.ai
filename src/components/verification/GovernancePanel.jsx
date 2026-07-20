import React from "react";
import { Network, Link2, ShieldCheck, Lock } from "lucide-react";
import { CAPABILITY_DEPENDENCIES, INTEGRATION_REGISTRY } from "@/lib/verificationCapabilityRegistry";

export default function GovernancePanel() {
  return (
    <div className="space-y-4">
      {/* Capability Dependencies */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Network size={16} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white/80">Capability Dependencies™</h3>
          <span className="text-[9px] text-white/20 uppercase tracking-wider ml-auto">{CAPABILITY_DEPENDENCIES.lifecycle}</span>
        </div>
        <div className="text-xs text-white/40 mb-3">{CAPABILITY_DEPENDENCIES.description || CAPABILITY_DEPENDENCIES.name}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {CAPABILITY_DEPENDENCIES.depends_on.map((dep) => (
            <div key={dep.id} className="flex items-center gap-2.5 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                dep.status === "operational" ? "bg-emerald-500/10" : "bg-white/5"
              }`}>
                <ShieldCheck size={14} className={dep.status === "operational" ? "text-emerald-400" : "text-white/20"} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-white/70">{dep.name}</span>
                  {dep.critical && <span className="text-[8px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">CRITICAL</span>}
                </div>
                <div className="text-[10px] text-white/30 capitalize mt-0.5">{dep.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integration Registry */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Link2 size={16} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white/80">Integration Registry™</h3>
          <span className="text-[9px] text-white/20 uppercase tracking-wider ml-auto">{INTEGRATION_REGISTRY.length} Registered</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {INTEGRATION_REGISTRY.map((integration) => (
            <div key={integration.id} className="flex items-start gap-2.5 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                <Lock size={12} className="text-white/20" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white/60">{integration.name}</div>
                <div className="text-[10px] text-white/30 mt-0.5 leading-relaxed">{integration.desc}</div>
                <div className="text-[9px] text-white/20 mt-1">
                  <span className="text-amber-400/60">Dormant</span> · Trigger: {integration.activation_trigger}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}