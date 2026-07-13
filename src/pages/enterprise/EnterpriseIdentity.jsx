import React, { useState, useEffect } from "react";
import {
  Fingerprint, Building2, Loader2, ChevronDown, Check, LayoutDashboard, Cloud, Shield, RefreshCw,
  Network, Lock, Zap, Sparkles, FileText, ShieldCheck, AlertTriangle,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useGuardian } from "@/lib/GuardianContext";
import IdentityDashboard from "@/components/enterprise/identity/IdentityDashboard";
import IdentityProviders from "@/components/enterprise/identity/IdentityProviders";
import SSOConfiguration from "@/components/enterprise/identity/SSOConfiguration";
import SCIMProvisioning from "@/components/enterprise/identity/SCIMProvisioning";
import GroupSync from "@/components/enterprise/identity/GroupSync";
import IdentitySecurity from "@/components/enterprise/identity/IdentitySecurity";
import LicenseAutomation from "@/components/enterprise/identity/LicenseAutomation";
import ExecIdentityCopilot from "@/components/enterprise/identity/ExecIdentityCopilot";
import IdentityGuardian from "@/components/enterprise/identity/IdentityGuardian";
import IdentityReporting from "@/components/enterprise/identity/IdentityReporting";

const MODULES = [
  { id: "dashboard", label: "Identity Dashboard™", icon: LayoutDashboard, desc: "Health, sync stats, provisioning queue" },
  { id: "providers", label: "Identity Providers™", icon: Cloud, desc: "Connect Entra ID, Okta, Google, Auth0" },
  { id: "sso", label: "SSO Configuration™", icon: Shield, desc: "SAML, OIDC, MFA, conditional access" },
  { id: "scim", label: "SCIM Provisioning™", icon: RefreshCw, desc: "Auto create, update, disable, delete" },
  { id: "groups", label: "Group Synchronization™", icon: Network, desc: "Departments, teams, managers, BUs" },
  { id: "security", label: "Identity Security™", icon: Lock, desc: "MFA, failed logins, risk, suspicious" },
  { id: "licenses", label: "License Automation™", icon: Zap, desc: "Auto-assign workspaces, credits, roles" },
  { id: "exec", label: "EXEC™ Identity Copilot", icon: Sparkles, desc: "AI identity assistant" },
  { id: "guardian", label: "Guardian™", icon: ShieldCheck, desc: "Drift, failed syncs, conflicts" },
  { id: "reports", label: "Reporting", icon: FileText, desc: "Identity, SSO, SCIM, security reports" },
];

const TENANT_BADGE = {
  single: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  multi: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  enterprise: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  education: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  government: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  partner: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
};

export default function EnterpriseIdentity() {
  const { user } = useAuth();
  const { pending } = useGuardian() || {};
  const [organizations, setOrganizations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const [orgSwitcherOpen, setOrgSwitcherOpen] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => { loadOrganizations(); }, []);

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Organization.list("-created_date", 200);
      setOrganizations(data);
      if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
      computeStats(data);
    } catch (e) { console.error("Failed to load organizations:", e); }
    finally { setLoading(false); }
  };

  const computeStats = async (orgs) => {
    try {
      const provs = await base44.entities.IdentityProvider.list("-created_date", 200);
      const connected = provs.filter((p) => p.status === "connected");
      setStats({
        providers: provs.length, connected: connected.length,
        usersSynced: provs.reduce((s, p) => s + (p.users_synced || 0), 0),
        groupsSynced: provs.reduce((s, p) => s + (p.groups_synced || 0), 0),
        syncErrors: provs.reduce((s, p) => s + (p.sync_errors || 0), 0),
        organizations: orgs.length,
      });
    } catch {}
  };

  const selectedOrg = organizations.find((o) => o.id === selectedId);

  if (loading) {
    return <div className="max-w-7xl mx-auto flex items-center justify-center py-20"><Loader2 className="animate-spin text-indigo-400" size={24} /></div>;
  }

  const renderModule = () => {
    switch (tab) {
      case "dashboard": return <IdentityDashboard organization={selectedOrg} />;
      case "providers": return <IdentityProviders organization={selectedOrg} />;
      case "sso": return <SSOConfiguration organization={selectedOrg} />;
      case "scim": return <SCIMProvisioning organization={selectedOrg} />;
      case "groups": return <GroupSync organization={selectedOrg} />;
      case "security": return <IdentitySecurity organization={selectedOrg} />;
      case "licenses": return <LicenseAutomation organization={selectedOrg} />;
      case "exec": return <ExecIdentityCopilot organization={selectedOrg} stats={stats} />;
      case "guardian": return <IdentityGuardian organization={selectedOrg} />;
      case "reports": return <IdentityReporting user={user} />;
      default: return null;
    }
  };

  const activeModule = MODULES.find((m) => m.id === tab);

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <Fingerprint size={12} className="text-indigo-400" /> Enterprise Identity™
          </div>
          <h1 className="text-2xl font-bold text-white">Enterprise Identity™</h1>
          <p className="text-white/40 text-sm mt-1">Identity, authentication, provisioning, synchronization, and access management — comparable to Microsoft Entra ID and Okta.</p>
        </div>
        {(pending?.length || 0) > 0 && (
          <button onClick={() => setTab("guardian")} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm hover:bg-amber-500/20 transition-colors">
            <AlertTriangle size={14} /> {pending.length} Guardian™ alert{pending.length !== 1 ? "s" : ""}
          </button>
        )}
      </div>

      {/* Organization Switcher */}
      <div className="relative">
        <button onClick={() => setOrgSwitcherOpen(!orgSwitcherOpen)} className="w-full flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/5 transition-colors">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${selectedOrg?.brand_color || "#6366f1"}20`, border: `1px solid ${selectedOrg?.brand_color || "#6366f1"}40` }}>
            <Building2 size={18} style={{ color: selectedOrg?.brand_color || "#6366f1" }} />
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium text-sm truncate">{selectedOrg?.name || "Select organization"}</span>
              {selectedOrg && <span className={`px-2 py-0.5 rounded-md text-xs border ${TENANT_BADGE[selectedOrg.tenant_type] || TENANT_BADGE.enterprise}`}>{selectedOrg.tenant_type || "enterprise"}</span>}
            </div>
            <div className="text-white/30 text-xs truncate">{selectedOrg ? `${selectedOrg.legal_name || selectedOrg.domain || "—"} · ${selectedOrg.seats_used || 0}/${selectedOrg.seats_total || 0} seats` : "Choose an organization to manage"}</div>
          </div>
          <ChevronDown size={16} className={`text-white/30 transition-transform ${orgSwitcherOpen ? "rotate-180" : ""}`} />
        </button>
        {orgSwitcherOpen && (
          <div className="absolute z-20 mt-1 w-full bg-[#0d0d14] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
            {organizations.map((org) => (
              <button key={org.id} onClick={() => { setSelectedId(org.id); setOrgSwitcherOpen(false); }} className={`w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left ${org.id === selectedId ? "bg-indigo-500/5" : ""}`}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${org.brand_color || "#6366f1"}20` }}><Building2 size={14} style={{ color: org.brand_color || "#6366f1" }} /></div>
                <div className="flex-1 min-w-0"><div className="text-white text-sm font-medium truncate">{org.name}</div><div className="text-white/30 text-xs truncate">{org.domain || org.industry || "—"}</div></div>
                {org.id === selectedId && <Check size={14} className="text-indigo-400" />}
              </button>
            ))}
            {organizations.length === 0 && <div className="p-4 text-center text-white/30 text-sm">No organizations found.</div>}
          </div>
        )}
      </div>

      {/* Command center: left rail + content */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-64 shrink-0">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2 lg:sticky lg:top-4">
            <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
              {MODULES.map((m) => (
                <button key={m.id} onClick={() => setTab(m.id)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors shrink-0 lg:w-full ${tab === m.id ? "bg-indigo-500/10 text-indigo-400" : "text-white/40 hover:text-white/80 hover:bg-white/5"}`}>
                  <m.icon size={16} className={tab === m.id ? "text-indigo-400" : "text-white/30"} />
                  <div className="hidden lg:block min-w-0"><div className="text-xs font-medium truncate">{m.label}</div><div className="text-white/20 text-[10px] truncate">{m.desc}</div></div>
                  <span className="lg:hidden text-xs whitespace-nowrap">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="mb-3 flex items-center gap-2">{activeModule && <activeModule.icon size={16} className="text-indigo-400" />}<h2 className="text-white font-medium text-sm">{activeModule?.label}</h2></div>
          {renderModule()}
        </div>
      </div>
    </div>
  );
}