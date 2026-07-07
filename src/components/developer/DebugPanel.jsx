import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import { useDeveloper } from "@/lib/DeveloperContext";
import {
  getRoleInfo, normalizeRole, getEffectiveRole, getNavGroups,
  canAccessDeveloperWorkspace, DEVELOPER_WORKSPACE_NAV, isEnterpriseAdmin, isSuperAdmin,
} from "@/lib/roles";
import { Bug, ChevronDown, ChevronUp, Shield, Crown, Building2, Code2 } from "lucide-react";

export default function DebugPanel() {
  const { user } = useAuth();
  const { profile, subscription } = useSubscription();
  const { developerMode, simulatedPlan, impersonation, sandbox, featureOverrides, getEffectivePlan, getEffectiveRole: getDevEffectiveRole, isSuperAdmin: devIsSuperAdmin, canAccessDeveloper } = useDeveloper();
  const [expanded, setExpanded] = useState(false);

  // Visible to developers AND super_admins (not just super_admin)
  if (!canAccessDeveloper) return null;

  const baseRole = normalizeRole(user?.role);
  const effectiveRole = getEffectiveRole(user?.role, profile);
  const roleInfo = getRoleInfo(effectiveRole);
  const effectivePlan = getEffectivePlan(profile?.subscription_plan || "free");
  const overrideCount = Object.keys(featureOverrides).length;

  // Compute visible navigation groups
  const showWorkspace = canAccessDeveloper && developerMode;
  const visibleGroups = showWorkspace
    ? [...getNavGroups("customer"), ...DEVELOPER_WORKSPACE_NAV]
    : getNavGroups(effectiveRole);

  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      {expanded ? (
        <div className="bg-[#0d0d14] border border-white/10 rounded-xl shadow-2xl w-96 max-h-[80vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-indigo-500/5">
            <div className="flex items-center gap-2">
              <Bug size={14} className="text-indigo-400" />
              <span className="text-white font-medium text-sm">Debug Panel</span>
              {developerMode && <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-400 font-medium">DEV</span>}
              {sandbox && <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-400 font-medium">SANDBOX</span>}
            </div>
            <button onClick={() => setExpanded(false)} className="text-white/30 hover:text-white/60">
              <ChevronDown size={16} />
            </button>
          </div>

          <div className="p-4 space-y-3 text-xs overflow-y-auto">
            {/* Identity */}
            <Section title="Identity" icon={Crown}>
              <Row label="Current User" value={user?.full_name || "—"} />
              <Row label="User ID" value={user?.id ? `${user.id.slice(0, 12)}...` : "—"} />
              <Row label="Email" value={user?.email || "—"} />
              <Row label="Base Role" value={getRoleInfo(baseRole).label} color="text-white/70" />
              <Row label="Effective Role" value={roleInfo.label} color="text-indigo-400" />
            </Section>

            {/* Organization */}
            <Section title="Organization" icon={Building2}>
              <Row label="Organization" value={profile?.organization_id ? "Linked" : "None"} color={profile?.organization_id ? "text-emerald-400" : "text-white/40"} />
              <Row label="Custom Role" value={profile?.custom_role || "None"} />
              <Row label="Department" value={profile?.department || "None"} />
              <Row label="Enterprise Admin" value={isEnterpriseAdmin(effectiveRole) ? "Yes" : "No"} color={isEnterpriseAdmin(effectiveRole) ? "text-emerald-400" : "text-white/40"} />
            </Section>

            {/* Subscription */}
            <Section title="Subscription" icon={Shield}>
              <Row label="Plan" value={effectivePlan} color="text-cyan-400" />
              <Row label="Status" value={profile?.subscription_status || "active"} />
              <Row label="Billing Cycle" value={profile?.subscription_cycle || "monthly"} />
              <Row label="Simulated Plan" value={simulatedPlan || "None"} color={simulatedPlan ? "text-amber-400" : "text-white/40"} />
              <Row label="Impersonation" value={impersonation ? impersonation.role : "None"} color={impersonation ? "text-cyan-400" : "text-white/40"} />
            </Section>

            {/* Permissions */}
            <Section title="Permissions" icon={Code2}>
              <Row label="Developer Mode" value={developerMode ? "ON" : "OFF"} color={developerMode ? "text-indigo-400" : "text-white/40"} />
              <Row label="Can Access Dev Workspace" value={canAccessDeveloper ? "Yes" : "No"} color={canAccessDeveloper ? "text-emerald-400" : "text-white/40"} />
              <Row label="Is Super Admin" value={devIsSuperAdmin ? "Yes" : "No"} color={devIsSuperAdmin ? "text-emerald-400" : "text-white/40"} />
              <Row label="Is Enterprise Admin" value={isEnterpriseAdmin(effectiveRole) ? "Yes" : "No"} color={isEnterpriseAdmin(effectiveRole) ? "text-emerald-400" : "text-white/40"} />
              <Row label="Sandbox" value={sandbox ? "ON" : "OFF"} color={sandbox ? "text-amber-400" : "text-white/40"} />
              <Row label="Feature Overrides" value={overrideCount > 0 ? `${overrideCount} active` : "None"} color={overrideCount > 0 ? "text-amber-400" : "text-white/40"} />
            </Section>

            {/* Navigation Groups */}
            <Section title={`Visible Navigation (${visibleGroups.length} groups)`} icon={Bug}>
              <div className="flex flex-wrap gap-1 mt-1">
                {visibleGroups.map((g) => (
                  <span key={g.label} className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 text-white/50 border border-white/5">
                    {g.label}
                  </span>
                ))}
              </div>
            </Section>

            {/* System */}
            <Section title="System" icon={Shield}>
              <Row label="DB Status" value="Connected" color="text-emerald-400" />
              <Row label="Auth Provider" value="Base44 Auth" />
            </Section>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          className="bg-[#0d0d14] border border-white/10 rounded-full px-3 py-2 flex items-center gap-2 shadow-lg hover:border-indigo-500/30 transition-colors"
        >
          <Bug size={14} className="text-indigo-400" />
          <span className="text-white/60 text-xs font-medium">Debug</span>
          {developerMode && <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />}
          <ChevronUp size={12} className="text-white/30" />
        </button>
      )}
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5 text-white/30 uppercase tracking-wider text-[10px] font-semibold">
        <Icon size={10} />
        {title}
      </div>
      <div className="space-y-1 pl-1">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, color = "text-white/70" }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-white/40">{label}</span>
      <span className={`font-medium ${color} truncate max-w-[200px]`}>{value}</span>
    </div>
  );
}