import React from "react";
import { Shield, CheckCircle2, Clock, AlertOctagon } from "lucide-react";
import { RESILIENCE_FAILURE_SIMS } from "@/lib/performanceResilienceEngine";

const STATUS_STYLES = {
  verified: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  pending: { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
};

export default function ResilienceEngineering() {
  const verified = RESILIENCE_FAILURE_SIMS.filter((s) => s.status === "verified").length;

  return (
    <div className="space-y-4">
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={18} className="text-cyan-400" />
          <h3 className="text-sm font-bold text-white">Resilience Engineering</h3>
          <span className="text-[10px] text-white/30 ml-auto">{verified}/{RESILIENCE_FAILURE_SIMS.length} verified</span>
        </div>
        <p className="text-[11px] text-white/50 leading-relaxed">
          Simulated failures across 10 platform components. Each verifies graceful degradation, automatic recovery,
          self-healing, alert generation, and audit logging.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {RESILIENCE_FAILURE_SIMS.map((s) => {
          const style = STATUS_STYLES[s.status] || STATUS_STYLES.pending;
          const StatusIcon = style.icon;
          return (
            <div key={s.component} className="rounded-lg bg-white/[0.02] border border-white/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertOctagon size={12} className="text-white/30" />
                <span className="text-sm font-bold text-white flex-1">{s.component}</span>
                <span className={`text-[9px] px-2 py-1 rounded border flex items-center gap-1 ${style.bg} ${style.color}`}>
                  <StatusIcon size={9} /> {s.status}
                </span>
              </div>
              <div className="text-[11px] text-amber-400/80 mb-2">{s.failureType}</div>
              <div className="space-y-1">
                <Field label="Degradation" value={s.gracefulDegradation} accent="emerald" />
                <Field label="Auto Recovery" value={s.automaticRecovery} />
                <Field label="Self-Healing" value={s.selfHealing} />
              </div>
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/5">
                <Badge label="Alert" active={s.alertGenerated} />
                <Badge label="Audit" active={s.auditLogged} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field({ label, value, accent }) {
  const color = accent === "emerald" ? "text-emerald-400/80" : "text-white/60";
  return (
    <div className="flex items-start gap-2">
      <span className="text-[10px] text-white/30 uppercase tracking-wider w-24 flex-shrink-0 mt-0.5">{label}</span>
      <span className={`text-[11px] flex-1 ${color}`}>{value}</span>
    </div>
  );
}

function Badge({ label, active }) {
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded ${active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
      {label}: {active ? "✓" : "✗"}
    </span>
  );
}