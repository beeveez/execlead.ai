import React from "react";
import { SECURITY_ROLES } from "@/lib/securityArchitecture";

const TIER_COLORS = {
  0: "text-white/30",
  10: "text-white/50",
  20: "text-blue-400",
  25: "text-blue-400",
  28: "text-cyan-400",
  30: "text-cyan-400",
  35: "text-cyan-400",
  40: "text-amber-400",
  45: "text-amber-400",
  50: "text-amber-400",
  55: "text-amber-400",
  90: "text-red-400",
  95: "text-red-400",
  100: "text-red-400",
};

export default function RoleMatrix() {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 text-violet-400 text-xs font-medium uppercase tracking-wider mb-1">
        Role-Based Access Control
      </div>
      <p className="text-white/40 text-xs mb-4">
        17 roles with explicit permissions. Platform Admin and Developer functionality is never exposed to customers. Each role governs access scope and navigation visibility independently of subscription plans.
      </p>
      <div className="overflow-x-auto -mx-2">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-2 text-[10px] uppercase tracking-wider text-white/30 font-medium">Role</th>
              <th className="text-left p-2 text-[10px] uppercase tracking-wider text-white/30 font-medium">Tier</th>
              <th className="text-left p-2 text-[10px] uppercase tracking-wider text-white/30 font-medium">Scope</th>
              <th className="text-left p-2 text-[10px] uppercase tracking-wider text-white/30 font-medium">Access Level</th>
            </tr>
          </thead>
          <tbody>
            {SECURITY_ROLES.map((r, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="p-2 text-sm text-white/80 font-medium">{r.role}</td>
                <td className={`p-2 text-sm font-mono ${TIER_COLORS[r.tier] || "text-white/50"}`}>{r.tier}</td>
                <td className="p-2 text-xs text-white/50">{r.scope}</td>
                <td className="p-2 text-xs text-white/50">{r.access}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-4 mt-3 text-[10px] text-white/30">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> Enterprise</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Functional</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Platform Admin</span>
      </div>
    </div>
  );
}