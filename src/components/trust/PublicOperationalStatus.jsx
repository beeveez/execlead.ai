import React from "react";
import { CheckCircle2 } from "lucide-react";

// Public Operational Status — customer-facing service availability.
// Internal operational dashboards and engineering metrics remain in the
// authenticated Platform Governance Center™.
const SERVICES = [
  { name: "Web Application", status: "Operational" },
  { name: "Authentication", status: "Operational" },
  { name: "AI Guidance", status: "Operational" },
  { name: "Data Storage", status: "Operational" },
  { name: "File Storage", status: "Operational" },
  { name: "Email Delivery", status: "Operational" },
  { name: "Payment Processing", status: "Operational" },
];

export default function PublicOperationalStatus() {
  return (
    <div className="space-y-4">
      <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4 flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <div>
          <div className="text-sm font-bold text-white">All Systems Operational</div>
          <p className="text-[11px] text-white/40">All customer-facing services are available and operating normally.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {SERVICES.map((s) => (
          <div key={s.name} className="bg-white/[0.02] border border-white/5 rounded-lg px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-white/70">{s.name}</span>
            <span className="flex items-center gap-1.5 text-[11px] text-emerald-400">
              <CheckCircle2 size={12} /> {s.status}
            </span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-white/30">
        Status reflects the current production environment. High-level incident history is disclosed in the Incident History section.
      </p>
    </div>
  );
}