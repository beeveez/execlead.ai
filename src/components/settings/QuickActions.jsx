import React from "react";
import { Link } from "react-router-dom";
import { KeyRound, Monitor, ShieldCheck, Download, CreditCard } from "lucide-react";

const ACTIONS = [
  { label: "Change Password", desc: "Secure reset via email", to: "/forgot-password", icon: KeyRound },
  { label: "Manage Sessions", desc: "View & revoke sessions", to: "/security", icon: Monitor },
  { label: "Security Center", desc: "Threats & devices", to: "/security", icon: ShieldCheck },
  { label: "Download My Data", desc: "Export profile data", to: "/privacy-compliance", icon: Download },
  { label: "Manage Billing", desc: "Plan & invoices", to: "/billing", icon: CreditCard },
];

export default function QuickActions() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="text-[11px] text-white/40 uppercase tracking-wider font-medium">Quick Actions</div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {ACTIONS.map(action => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              to={action.to}
              className="group flex flex-col items-start gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-indigo-500/20 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                <Icon size={14} className="text-indigo-400" />
              </div>
              <div>
                <div className="text-xs font-medium text-white/80 group-hover:text-white transition-colors">{action.label}</div>
                <div className="text-[10px] text-white/30 mt-0.5 leading-tight">{action.desc}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}