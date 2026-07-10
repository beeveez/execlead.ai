import React from "react";
import { Briefcase, Shield, Star, Users, DollarSign, Handshake, Award, Check } from "lucide-react";

const TYPE_CONFIG = {
  employee: { label: "Employee", icon: Briefcase, color: "text-blue-400" },
  board_member: { label: "Board Member", icon: Shield, color: "text-purple-400" },
  advisor: { label: "Advisor", icon: Star, color: "text-amber-400" },
  mentor: { label: "Mentor", icon: Users, color: "text-emerald-400" },
  investor: { label: "Investor", icon: DollarSign, color: "text-green-400" },
  consultant: { label: "Consultant", icon: Briefcase, color: "text-cyan-400" },
  partner: { label: "Partner", icon: Handshake, color: "text-indigo-400" },
  fellow: { label: "Fellow", icon: Award, color: "text-rose-400" },
};

/**
 * MultiOrgCard — shown in the Identity Transfer Wizard step 1.
 * Displays the executive's OTHER affiliations that remain intact
 * after leaving the current organization.
 */
export default function MultiOrgCard({ affiliations }) {
  if (!affiliations || affiliations.length === 0) return null;

  return (
    <div className="mt-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <Check size={14} className="text-emerald-400" />
        <h4 className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Your Other Affiliations Remain</h4>
      </div>
      <p className="text-white/40 text-xs mb-3">These affiliations are not affected by this transition.</p>
      <div className="space-y-1.5">
        {affiliations.map((aff) => {
          const config = TYPE_CONFIG[aff.affiliation_type] || TYPE_CONFIG.employee;
          const Icon = config.icon;
          return (
            <div key={aff.id} className="flex items-center gap-2 bg-white/[0.02] rounded-lg p-2">
              <Icon size={12} className={config.color} />
              <span className="text-white/70 text-xs font-medium">{aff.organization_name}</span>
              <span className="text-white/30 text-[10px]">{config.label}</span>
              {aff.role_title && <span className="text-white/20 text-[10px]">· {aff.role_title}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}