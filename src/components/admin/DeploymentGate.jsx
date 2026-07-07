import React from "react";
import { ShieldAlert, ShieldCheck, Rocket, Ban } from "lucide-react";

export default function DeploymentGate({ report }) {
  const blocked = report.deploymentBlocked;
  return (
    <div className={`rounded-2xl border p-5 ${blocked ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20"}`}>
      <div className="flex items-start gap-4">
        {blocked ? <ShieldAlert size={28} className="text-red-400 shrink-0" /> : <ShieldCheck size={28} className="text-emerald-400 shrink-0" />}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold">Deployment Validation</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${blocked ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"}`}>
              {blocked ? "BLOCKED" : "CLEAR"}
            </span>
          </div>
          <p className="text-sm text-white/50 mt-1">
            {blocked
              ? "Production deployment is blocked until critical issues are resolved."
              : "No critical issues detected. This configuration is safe to deploy."}
          </p>
          {blocked && (
            <div className="mt-3 space-y-1.5">
              {report.deployBlockers.slice(0, 8).map((b, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-red-300/80">
                  <Ban size={11} className="shrink-0" /> {b}
                </div>
              ))}
              {report.deployBlockers.length > 8 && <div className="text-xs text-white/30 pl-5">+{report.deployBlockers.length - 8} more…</div>}
            </div>
          )}
          {!blocked && (
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-300/80">
              <Rocket size={12} /> Ready for production deployment
            </div>
          )}
        </div>
      </div>
    </div>
  );
}