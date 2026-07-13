import React, { useState, useEffect } from "react";
import {
  Shield, Building2, Loader2, ChevronDown, Check, LayoutDashboard, Users, Ticket,
  Boxes, KeyRound, Settings, FileText, ShieldCheck, Sparkles, AlertTriangle,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useGuardian } from "@/lib/GuardianContext";
import AdminDashboard from "@/components/enterprise/admin/AdminDashboard";
import UserLifecycle from "@/components/enterprise/admin/UserLifecycle";
import LicenseManagement from "@/components/enterprise/admin/LicenseManagement";
import WorkspaceAdministration from "@/components/enterprise/admin/WorkspaceAdministration";
import RoleAdministration from "@/components/enterprise/admin/RoleAdministration";
import OrganizationSettings from "@/components/enterprise/admin/OrganizationSettings";
import AuditCenter from "@/components/enterprise/admin/AuditCenter";
import DelegatedAdministration from "@/components/enterprise/admin/DelegatedAdministration";
import ExecEnterpriseAdmin from "@/components/enterprise/admin/ExecEnterpriseAdmin";
import ReportEngine from "@/components/enterprise/admin/ReportEngine";
import GuardianPanel from "@/components/enterprise/admin/GuardianPanel";

const MODULES = [
  { id: "dashboard", label: "Admin Dashboard™", icon: LayoutDashboard, desc: "Platform-wide KPIs & health" },
  { id: "users", label: "User Lifecycle™", icon: Users, desc: "Invite, suspend, transfer, assign" },
  { id: "licenses", label: "License Management™", icon: Ticket, desc: "Purchased, assigned, forecast" },
  { id: "workspaces", label: "Workspace Administration™", icon: Boxes, desc: "Enable, disable, monitor" },
  { id: "roles", label: "Role Administration™", icon: KeyRound, desc: "RBAC, permissions, inheritance" },
  { id: "settings", label: "Organization Settings™", icon: Settings, desc: "Branding, policies, localization" },
  { id: "audit", label: "Audit Center™", icon: FileText, desc: "Search, filter, export" },
  { id: "delegated", label: "Delegated Administration™", icon: Shield, desc: "Scope, permissions, audit trail" },
  { id: "exec", label: "EXEC™ Enterprise Admin", icon: Sparkles, desc: "AI enterprise assistant" },
  { id: "reports", label: "Enterprise Report Engine™", icon: FileText, desc: "Generate admin reports" },
  { id: "guardian", label: "Guardian™", icon: ShieldCheck, desc: "Monitoring & recommended actions" },
];

const TENANT_BADGE = {
  single: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  multi: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  enterprise: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  education: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  government: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  partner: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
};

export default function EnterpriseAdmin() {
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
    } catch (e) {
      console.error("Failed to load organizations:", e);
    } finally {
      setLoading(false);
    }
  };

  const computeStats = async (orgs) => {
    try {
      const [depts, teams, mems] = await Promise.all([
        base44.entities.Department.list("-created_date", 500),
        base44.entities.Team.list("-created_date", 500),
        base44.entities.OrgMembership.list("-created_date", 1000),
      ]);
      const activeUsers = mems.filter((m) => m.status === "active");
      const inactiveUsers = mems.filter((m) => m.status === "suspended" || m.status === "deactivated");
      const managers = activeUsers.filter((m) => ["manager", "team_lead"].includes(m.role));
      setStats({
        organizations: orgs.length, departments: depts.length, teams: teams.length,
        members: mems.length, activeUsers: activeUsers.length, inactiveUsers: inactiveUsers.length,
        managers: managers.length, licensesAssigned: orgs.reduce((s, o) => s + (o.seats_used || 0), 0),
        licensesTotal: orgs.reduce((s, o) => s + (o.seats_total || 0), 0),
      });
    } catch {}
  };

  const selectedOrg = organizations.find((o) => o.id === selectedId);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-indigo-400" size={24} />
      </div>
    );
  }

  const renderModule = () => {
    switch (tab) {
      case "dashboard": return <AdminDashboard />;
      case "users": return <UserLifecycle organization={selectedOrg} />;
      case "licenses": return <LicenseManagement organization={selectedOrg} />;
      case "workspaces": return <WorkspaceAdministration organization={selectedOrg} onUpdate={loadOrganizations} />;
      case "roles": return <RoleAdministration organization={selectedOrg} />;
      case "settings": return <OrganizationSettings organization={selectedOrg} onUpdate={loadOrganizations} />;
      case "audit": return <AuditCenter organization={selectedOrg} />;
      case "delegated": return <DelegatedAdministration organization={selectedOrg} />;
      case "exec": return <ExecEnterpriseAdmin organization={selectedOrg} stats={stats} />;
      case "reports": return <ReportEngine user={user} />;
      case "guardian": return <GuardianPanel />;
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
            <Shield size={12} className="text-indigo-400" /> Enterprise Administration™
          </div>
          <h1 className="text-2xl font-bold text-white">Enterprise Administration™</h1>
          <p className="text-white/40 text-sm mt-1">Command center for managing organizations, users, licensing, billing, workspaces, and platform governance.</p>
        </div>
        {(pending?.length || 0) > 0 && (
          <button onClick={() => setTab("guardian")} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm hover:bg-amber-500/20 transition-colors">
            <AlertTriangle size={14} /> {pending.length} Guardian™ alert{pending.length !== 1 ? "s" : ""}
          </button>
        )}
      </div>

      {/* Organization Switcher */}
      <div className="relative">
        <button onClick={() => setOrgSwitcherOpen(!orgSwitcherOpen)}
          className="w-full flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/5 transition-colors">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${selectedOrg?.brand_color || "#6366f1"}20`, border: `1px solid ${selectedOrg?.brand_color || "#6366f1"}40` }}>
            <Building2 size={18} style={{ color: selectedOrg?.brand_color || "#6366f1" }} />
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium text-sm truncate">{selectedOrg?.name || "Select organization"}</span>
              {selectedOrg && <span className={`px-2 py-0.5 rounded-md text-xs border ${TENANT_BADGE[selectedOrg.tenant_type] || TENANT_BADGE.enterprise}`}>{selectedOrg.tenant_type || "enterprise"}</span>}
            </div>
            <div className="text-white/30 text-xs truncate">
              {selectedOrg ? `${selectedOrg.legal_name || selectedOrg.domain || "—"} · ${selectedOrg.seats_used || 0}/${selectedOrg.seats_total || 0} seats` : "Choose an organization to manage"}
            </div>
          </div>
          <ChevronDown size={16} className={`text-white/30 transition-transform ${orgSwitcherOpen ? "rotate-180" : ""}`} />
        </button>
        {orgSwitcherOpen && (
          <div className="absolute z-20 mt-1 w-full bg-[#0d0d14] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
            {organizations.map((org) => (
              <button key={org.id} onClick={() => { setSelectedId(org.id); setOrgSwitcherOpen(false); }}
                className={`w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left ${org.id === selectedId ? "bg-indigo-500/5" : ""}`}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${org.brand_color || "#6366f1"}20` }}>
                  <Building2 size={14} style={{ color: org.brand_color || "#6366f1" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{org.name}</div>
                  <div className="text-white/30 text-xs truncate">{org.domain || org.industry || "—"}</div>
                </div>
                {org.id === selectedId && <Check size={14} className="text-indigo-400" />}
              </button>
            ))}
            {organizations.length === 0 && <div className="p-4 text-center text-white/30 text-sm">No organizations found.</div>}
          </div>
        )}
      </div>

      {/* Command center: left rail + content */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Module rail */}
        <div className="lg:w-64 shrink-0">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2 lg:sticky lg:top-4">
            <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
              {MODULES.map((m) => (
                <button key={m.id} onClick={() => setTab(m.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors shrink-0 lg:w-full ${tab === m.id ? "bg-indigo-500/10 text-indigo-400" : "text-white/40 hover:text-white/80 hover:bg-white/5"}`}>
                  <m.icon size={16} className={tab === m.id ? "text-indigo-400" : "text-white/30"} />
                  <div className="hidden lg:block min-w-0">
                    <div className="text-xs font-medium truncate">{m.label}</div>
                    <div className="text-white/20 text-[10px] truncate">{m.desc}</div>
                  </div>
                  <span className="lg:hidden text-xs whitespace-nowrap">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Module content */}
        <div className="flex-1 min-w-0">
          <div className="mb-3 flex items-center gap-2">
            {activeModule && <activeModule.icon size={16} className="text-indigo-400" />}
            <h2 className="text-white font-medium text-sm">{activeModule?.label}</h2>
          </div>
          {renderModule()}
        </div>
      </div>
    </div>
  );
}