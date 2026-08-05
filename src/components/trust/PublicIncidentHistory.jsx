import React from "react";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

// Public Incident History — high-level incident disclosure for enterprise
// buyers. Internal engineering event logs remain in the authenticated
// Platform Governance Center™.
export default function PublicIncidentHistory() {
  return (
    <div className="space-y-4">
      <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-5 flex items-start gap-3">
        <ShieldCheck size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-white mb-1">No incidents in the last 90 days</h3>
          <p className="text-[11px] text-white/50 leading-relaxed">
            All customer-facing services have remained available through the current reporting period.
            When incidents occur, a high-level summary will be published here with impact, duration, and resolution.
          </p>
        </div>
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="text-[10px] text-white/30 uppercase tracking-wider mb-3">Incident Disclosure Commitment</div>
        <ul className="space-y-2">
          {[
            "High-level incident summaries published for any customer-impacting event.",
            "Disclosures include impact scope, duration, and resolution — not internal engineering detail.",
            "Security-relevant disclosures follow our responsible disclosure process.",
          ].map((t, i) => (
            <li key={i} className="flex items-start gap-2 text-[11px] text-white/50">
              <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="text-[10px] text-white/30">
        Detailed operational event logs are available to authorized users inside the Platform Governance Center™.
      </p>
    </div>
  );
}