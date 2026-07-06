import React from "react";
import { useDeveloper } from "@/lib/DeveloperContext";
import { ROLE_LIST, getRoleInfo } from "@/lib/roles";
import { UserCheck, X } from "lucide-react";

export default function ImpersonationPanel() {
  const { impersonation, setImpersonation, stopImpersonation } = useDeveloper();

  if (impersonation) {
    const roleInfo = getRoleInfo(impersonation.role);
    return (
      <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <UserCheck size={18} className="text-cyan-400" />
            </div>
            <div>
              <div className="text-white font-medium text-sm">Impersonating: {roleInfo.label}</div>
              <div className="text-white/30 text-xs">Plan: {impersonation.plan} · {roleInfo.description}</div>
            </div>
          </div>
          <button
            onClick={stopImpersonation}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-sm font-medium transition-colors"
          >
            <X size={14} /> Return to Super Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
      <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-1">Impersonation</h2>
      <p className="text-white/30 text-xs mb-4">View the application exactly as any user role. Click "Return to Super Admin" to exit.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {ROLE_LIST.map((role) => (
          <button
            key={role.id}
            onClick={() => setImpersonation(role.id, role.plan, role.label)}
            className="flex items-center gap-3 p-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-cyan-500/20 rounded-lg transition-all text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-xs font-bold">
              {role.label.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white/70 text-sm font-medium">{role.label}</div>
              <div className="text-white/30 text-xs capitalize">{role.plan} plan</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}