import React, { useState, useEffect } from "react";
import { Building2, Network, Users, Shield, Layers, Loader2, ChevronDown, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import OrgProfileTab from "@/components/enterprise/OrgProfileTab";
import OrgHierarchyTab from "@/components/enterprise/OrgHierarchyTab";
import DepartmentManagement from "@/components/enterprise/DepartmentManagement";
import TeamManagement from "@/components/enterprise/TeamManagement";
import RoleHierarchyTab from "@/components/enterprise/RoleHierarchyTab";
import WorkspaceManagementTab from "@/components/enterprise/WorkspaceManagementTab";

const TABS = [
  { id: "profile", label: "Organization Profile", icon: Building2 },
  { id: "hierarchy", label: "Organization Hierarchy", icon: Network },
  { id: "departments", label: "Departments", icon: Layers },
  { id: "teams", label: "Teams", icon: Users },
  { id: "roles", label: "Role Hierarchy™", icon: Shield },
  { id: "workspaces", label: "Workspace Management", icon: Building2 },
];

const TENANT_BADGE = {
  single: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  multi: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  enterprise: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  education: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  government: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  partner: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
};

export default function OrganizationManagement() {
  const [organizations, setOrganizations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("profile");
  const [orgSwitcherOpen, setOrgSwitcherOpen] = useState(false);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Organization.list("-created_date", 100);
      setOrganizations(data);
      if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
    } catch (e) {
      console.error("Failed to load organizations:", e);
    } finally {
      setLoading(false);
    }
  };

  const selectedOrg = organizations.find((o) => o.id === selectedId);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-indigo-400" size={24} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Building2 size={12} className="text-indigo-400" /> Enterprise Readiness Program™
        </div>
        <h1 className="text-2xl font-bold text-white">Organization Management™</h1>
        <p className="text-white/40 text-sm mt-1">Multi-tenant organization platform — organizations, departments, teams, RBAC, and workspace management.</p>
      </div>

      {/* Organization Switcher */}
      <div className="relative">
        <button
          onClick={() => setOrgSwitcherOpen(!orgSwitcherOpen)}
          className="w-full flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/5 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${selectedOrg?.brand_color || "#6366f1"}20`, border: `1px solid ${selectedOrg?.brand_color || "#6366f1"}40` }}>
            <Building2 size={18} style={{ color: selectedOrg?.brand_color || "#6366f1" }} />
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium text-sm truncate">{selectedOrg?.name || "Select organization"}</span>
              {selectedOrg && (
                <span className={`px-2 py-0.5 rounded-md text-xs border ${TENANT_BADGE[selectedOrg.tenant_type] || TENANT_BADGE.enterprise}`}>
                  {selectedOrg.tenant_type || "enterprise"}
                </span>
              )}
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
              <button
                key={org.id}
                onClick={() => { setSelectedId(org.id); setOrgSwitcherOpen(false); }}
                className={`w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left ${org.id === selectedId ? "bg-indigo-500/5" : ""}`}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${org.brand_color || "#6366f1"}20` }}>
                  <Building2 size={14} style={{ color: org.brand_color || "#6366f1" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{org.name}</div>
                  <div className="text-white/30 text-xs truncate">{org.domain || org.industry || "—"}</div>
                </div>
                {org.id === selectedId && <Check size={14} className="text-indigo-400" />}
                <span className={`px-2 py-0.5 rounded-md text-xs border ${TENANT_BADGE[org.tenant_type] || TENANT_BADGE.enterprise}`}>
                  {org.tenant_type || "enterprise"}
                </span>
              </button>
            ))}
            {organizations.length === 0 && (
              <div className="p-4 text-center text-white/30 text-sm">No organizations found.</div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/5 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              tab === t.id ? "border-indigo-500 text-white" : "border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {!selectedOrg ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
          <Building2 size={32} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">Select an organization above to begin managing it.</p>
        </div>
      ) : (
        <>
          {tab === "profile" && <OrgProfileTab organization={selectedOrg} onUpdate={loadOrganizations} />}
          {tab === "hierarchy" && <OrgHierarchyTab organization={selectedOrg} />}
          {tab === "departments" && <DepartmentManagement organization={selectedOrg} />}
          {tab === "teams" && <TeamManagement organization={selectedOrg} />}
          {tab === "roles" && <RoleHierarchyTab />}
          {tab === "workspaces" && <WorkspaceManagementTab organization={selectedOrg} />}
        </>
      )}
    </div>
  );
}