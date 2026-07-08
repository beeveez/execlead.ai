import React, { useState } from "react";
import { Users, Shield, Check, X, Search, Lock } from "lucide-react";
import { PERMISSIONS, SECURITY_ROLES, ROLE_PERMISSION_MATRIX } from "@/lib/securityPermissions";

export default function RBACManager() {
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("security_admin");

  const filteredRoles = SECURITY_ROLES.filter(r =>
    r.label.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase())
  );

  const role = SECURITY_ROLES.find(r => r.id === selectedRole);
  const rolePerms = ROLE_PERMISSION_MATRIX[selectedRole] || [];

  return (
    <div className="space-y-4">
      {/* Principle banner */}
      <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 flex items-start gap-3">
        <Lock size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-white/80 text-sm font-medium">Roles are independent of subscriptions</div>
          <div className="text-white/40 text-xs mt-1">
            Subscription plans unlock product features. Roles govern access scope and authority.
            Permissions are never granted based on subscription tier.
          </div>
        </div>
      </div>

      {/* Role selector */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-violet-400 text-xs font-medium uppercase tracking-wider">
            <Users size={14} /> Role Directory
          </div>
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roles..."
              className="bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white/70 w-48"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {filteredRoles.map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedRole(r.id)}
              className={`text-left p-3 rounded-lg border transition-all ${
                selectedRole === r.id
                  ? "bg-violet-500/10 border-violet-500/30"
                  : "bg-white/[0.02] border-white/5 hover:border-white/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80 font-medium">{r.label}</span>
                <span className="text-[10px] text-white/30">T{r.tier}</span>
              </div>
              <div className="text-[11px] text-white/40 mt-0.5 line-clamp-1">{r.description}</div>
              <div className="text-[10px] text-violet-400/60 mt-1">{ROLE_PERMISSION_MATRIX[r.id]?.length || 0} permissions</div>
            </button>
          ))}
        </div>
      </div>

      {/* Permission matrix for selected role */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 text-violet-400 text-xs font-medium uppercase tracking-wider mb-1">
          <Shield size={14} /> Permission Matrix — {role?.label}
        </div>
        <p className="text-white/40 text-xs mb-4">{role?.description}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {PERMISSIONS.map(perm => {
            const granted = rolePerms.includes(perm.id);
            return (
              <div
                key={perm.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  granted ? "bg-emerald-500/5 border-emerald-500/15" : "bg-white/[0.01] border-white/5"
                }`}
              >
                <div className="min-w-0">
                  <div className="text-sm text-white/70 font-medium">{perm.label}</div>
                  <div className="text-[11px] text-white/30">{perm.description}</div>
                </div>
                {granted ? (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 flex-shrink-0 ml-2">
                    <Check size={13} /> Granted
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] text-white/20 flex-shrink-0 ml-2">
                    <X size={13} /> Denied
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Full matrix overview */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 overflow-x-auto">
        <div className="flex items-center gap-2 text-violet-400 text-xs font-medium uppercase tracking-wider mb-4">
          <Shield size={14} /> Complete Permission Matrix
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left py-2 pr-3 text-white/40 font-medium">Role</th>
              {PERMISSIONS.map(p => (
                <th key={p.id} className="text-center py-2 px-1 text-white/40 font-medium" title={p.label}>
                  <span className="block w-6 mx-auto">{p.label.charAt(0)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SECURITY_ROLES.map(r => (
              <tr key={r.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                <td className="py-2 pr-3 text-white/70 font-medium whitespace-nowrap">{r.label}</td>
                {PERMISSIONS.map(p => {
                  const granted = (ROLE_PERMISSION_MATRIX[r.id] || []).includes(p.id);
                  return (
                    <td key={p.id} className="text-center py-2 px-1">
                      {granted
                        ? <Check size={12} className="text-emerald-400 mx-auto" />
                        : <X size={12} className="text-white/15 mx-auto" />}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}