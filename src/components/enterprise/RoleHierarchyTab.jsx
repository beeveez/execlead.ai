import React, { useState } from "react";
import { Shield, ChevronDown, ChevronRight, Check, Users, Lock, Eye, Key } from "lucide-react";
import { ENTERPRISE_ROLES, getInheritedRoles } from "@/lib/enterpriseRoles";

const TIER_ICON = {
  platform: Shield,
  organization: Key,
  department: Users,
  team: Users,
  specialist: Eye,
  base: Lock,
  external: Eye,
};

export default function RoleHierarchyTab() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><Shield size={14} className="text-indigo-400" /><span className="text-white/40 text-xs uppercase tracking-wider">Total Roles</span></div>
          <div className="text-white text-2xl font-bold">{ENTERPRISE_ROLES.length}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><Key size={14} className="text-orange-400" /><span className="text-white/40 text-xs uppercase tracking-wider">Platform Tiers</span></div>
          <div className="text-white text-2xl font-bold">{ENTERPRISE_ROLES.filter((r) => r.tier === "platform").length}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><Users size={14} className="text-blue-400" /><span className="text-white/40 text-xs uppercase tracking-wider">Org Tiers</span></div>
          <div className="text-white text-2xl font-bold">{ENTERPRISE_ROLES.filter((r) => r.tier === "organization" || r.tier === "department" || r.tier === "team").length}</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><Eye size={14} className="text-yellow-400" /><span className="text-white/40 text-xs uppercase tracking-wider">External</span></div>
          <div className="text-white text-2xl font-bold">{ENTERPRISE_ROLES.filter((r) => r.tier === "external").length}</div>
        </div>
      </div>

      {/* Role list */}
      <div className="space-y-1.5">
        {ENTERPRISE_ROLES.map((role) => {
          const isExpanded = expanded === role.id;
          const inherited = getInheritedRoles(role.id);
          const TierIcon = TIER_ICON[role.tier] || Shield;
          return (
            <div key={role.id} className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
              <button onClick={() => setExpanded(isExpanded ? null : role.id)} className="w-full flex items-center gap-3 p-4 hover:bg-white/[0.02] transition-colors text-left">
                {isExpanded ? <ChevronDown size={14} className="text-white/30" /> : <ChevronRight size={14} className="text-white/30" />}
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${role.color}`}>
                  <TierIcon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium">{role.name}</span>
                    <span className="text-white/20 text-xs">L{role.level}</span>
                  </div>
                  <div className="text-white/40 text-xs truncate">{role.description}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-white/30 text-xs">{role.capabilities.length} caps</span>
                  <span className="text-white/30 text-xs">·</span>
                  <span className="text-white/30 text-xs">{role.workspaces.length} ws</span>
                  {inherited.length > 0 && <span className="text-indigo-400 text-xs">· {inherited.length} inherited</span>}
                </div>
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Capabilities</div>
                      <div className="space-y-1">
                        {role.capabilities.map((c) => (
                          <div key={c} className="flex items-center gap-2 text-white/60 text-sm">
                            <Check size={12} className="text-emerald-400" /> {c}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Accessible Workspaces</div>
                      <div className="flex flex-wrap gap-1.5">
                        {role.workspaces.length > 0 ? role.workspaces.map((w) => (
                          <span key={w} className="px-2 py-0.5 rounded-md bg-white/5 text-white/60 text-xs border border-white/10">{w}</span>
                        )) : <span className="text-white/30 text-xs">No workspace access</span>}
                      </div>
                      {inherited.length > 0 && (
                        <>
                          <div className="text-white/40 text-xs uppercase tracking-wider mb-2 mt-4">Inherits From</div>
                          <div className="flex flex-wrap gap-1.5">
                            {inherited.map((r) => (
                              <span key={r.id} className={`px-2 py-0.5 rounded-md text-xs border ${r.color}`}>{r.name}</span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}