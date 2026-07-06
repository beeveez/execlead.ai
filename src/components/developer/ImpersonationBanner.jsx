import React from "react";
import { useDeveloper } from "@/lib/DeveloperContext";
import { getRoleInfo } from "@/lib/roles";
import { UserCheck, X, FlaskConical } from "lucide-react";

export default function ImpersonationBanner() {
  const { impersonation, sandbox, stopImpersonation } = useDeveloper();
  if (!impersonation && !sandbox) return null;

  return (
    <div className={`${impersonation ? "bg-cyan-500/10 border-cyan-500/20" : "bg-amber-500/10 border-amber-500/20"} border-b px-4 py-2`}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          {impersonation && (
            <div className="flex items-center gap-2">
              <UserCheck size={14} className="text-cyan-400" />
              <span className="text-cyan-400 text-xs font-medium">
                Impersonating: {getRoleInfo(impersonation.role).label} ({impersonation.plan} plan)
              </span>
            </div>
          )}
          {sandbox && (
            <div className="flex items-center gap-2">
              <FlaskConical size={14} className="text-amber-400" />
              <span className="text-amber-400 text-xs font-medium">Sandbox Mode — test data only</span>
            </div>
          )}
        </div>
        {impersonation && (
          <button
            onClick={stopImpersonation}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-medium transition-colors"
          >
            <X size={12} /> Return to Super Admin
          </button>
        )}
      </div>
    </div>
  );
}