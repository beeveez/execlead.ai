import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Shield, Building2, Loader2, ChevronDown, Check, FileText, Lock, Cloud,
  RefreshCw, AlertTriangle, ShieldCheck, ArrowRight, Users, Scale,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import ComplianceCenter from "@/components/security/ComplianceCenter";
import RiskIntelligence from "@/components/security/RiskIntelligence";
import SecurityPolicies from "@/components/security/SecurityPolicies";
import IdentitySecurity from "@/components/enterprise/identity/IdentitySecurity";

const MODULES = [
  { id: "policies", label: "Organization Policies™", icon: Shield, desc: "Security policies for your organization" },
  { id: "sso", label: "SSO & Conditional Access™", icon: Cloud, desc: "SAML, OIDC, MFA enforcement, access rules" },
  { id: "scim", label: "SCIM & Provisioning™", icon: RefreshCw, desc: "Automated user lifecycle management" },
  { id: "governance", label: "Identity Governance™", icon: Users, desc: "MFA status, failed logins, risk signals" },
  { id: "risk", label: "Organization Risk™", icon: AlertTriangle, desc: "Threat intelligence and risk scoring" },
  { id: "compliance", label: "Compliance Center™", icon: Scale, desc: "Regulatory compliance and audit readiness" },
];

const TENANT_BADGE = {
  single: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  multi: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  enterprise: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

export default function EnterpriseSecurity() {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("policies");
  const [orgSwitcherOpen, setOrgSwitcherOpen] = useState(false);

  useEffect(() => { loadOrganizations(); }, []);

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Organization.list("-created_date", 200);
      setOrganizations(data);
      if (data.length > 0 && !selectedId) setSelectedId(data[0].id);
    } catch (e) {
      console.error("Failed to load organizations:", e);
    } finally {
      setLoading(false);
    }
  };

  const selectedOrg = organizations.find(o => o.id === selectedId);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-indigo-400" size={24} />
      </div>
    );
  }

  const activeModule = MODULES.find(m => m.id === tab);

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Shield size={12} className="text-indigo-400" /> Enterprise Security™ · My Organization
        </div>
        <h1 className="text-2xl font-bold text-white">Enterprise Security™</h1>
        <p className="text-white/40 text-sm mt-1">
          Organization-level security policies, identity governance, risk management, and compliance.
          Manages only your organization — not individual accounts or platform infrastructure.
        </p>
      </div>

      {/* Organization Switcher */}
      <div className="relative">
        <button onClick={() => setOrgSwitcherOpen(!orgSwitcherOpen)}
          className="w-full flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/5 transition-colors">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${selectedOrg?.brand_color || "#6366f1"}20`, border: `1px solid ${selectedOrg?.brand_color || "#6366f1"}40` }}>
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
            {organizations.map(org => (
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

      {/* Cross-links to related security areas */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link to="/enterprise/identity" className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white/70">
          <Lock size={12} /> Identity Providers™ <ArrowRight size={10} />
        </Link>
        <Link to="/sso" className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white/70">
          <Cloud size={12} /> SSO Configuration <ArrowRight size={10} />
        </Link>
        <Link to="/trust-center" className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white/70">
          <ShieldCheck size={12} /> Trust Center <ArrowRight size={10} />
        </Link>
      </div>

      {/* Module rail + content */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-64 shrink-0">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2 lg:sticky lg:top-4">
            <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
              {MODULES.map(m => (
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

        <div className="flex-1 min-w-0">
          <div className="mb-3 flex items-center gap-2">
            {activeModule && <activeModule.icon size={16} className="text-indigo-400" />}
            <h2 className="text-white font-medium text-sm">{activeModule?.label}</h2>
          </div>
          {tab === "policies" && <SecurityPolicies />}
          {tab === "sso" && <SSOConditionalAccess org={selectedOrg} />}
          {tab === "scim" && <SCIMProvisioningInfo org={selectedOrg} />}
          {tab === "governance" && <IdentitySecurity />}
          {tab === "risk" && <RiskIntelligence />}
          {tab === "compliance" && <ComplianceCenter />}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SIMPLE MODULES
// ============================================================

function SSOConditionalAccess({ org }) {
  return (
    <div className="space-y-3">
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white/80">Single Sign-On (SSO)</h3>
          <Link to="/enterprise/identity" className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            Configure <ArrowRight size={10} />
          </Link>
        </div>
        <p className="text-[11px] text-white/30">SAML 2.0 and OIDC identity provider configuration for your organization.</p>
      </div>
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <h3 className="text-sm font-medium text-white/80 mb-3">Conditional Access Rules</h3>
        <div className="space-y-2">
          {[
            { rule: "Require MFA for admin actions", enabled: true },
            { rule: "Block logins from unrecognized countries", enabled: true },
            { rule: "Require trusted device for sensitive data", enabled: false },
            { rule: "Session timeout after 8 hours", enabled: true },
          ].map(r => (
            <div key={r.rule} className="flex items-center gap-2 text-xs">
              <span className={`w-2 h-2 rounded-full ${r.enabled ? "bg-emerald-400" : "bg-white/20"}`} />
              <span className={r.enabled ? "text-white/60" : "text-white/30"}>{r.rule}</span>
              <span className="ml-auto text-[10px] text-white/20">{r.enabled ? "Active" : "Disabled"}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SCIMProvisioningInfo({ org }) {
  return (
    <div className="space-y-3">
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white/80">SCIM Endpoint</h3>
          <Link to="/enterprise/identity" className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            Manage <ArrowRight size={10} />
          </Link>
        </div>
        <p className="text-[11px] text-white/30 mb-2">Automated user provisioning via SCIM 2.0 protocol.</p>
        <div className="flex items-center gap-2 text-[10px] text-white/30 font-mono bg-black/20 rounded-lg px-3 py-2">
          <RefreshCw size={10} className="text-emerald-400" />
          /api/scim/v2/Users
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <p className="text-[10px] text-white/30 uppercase tracking-wider">Auto-Provisioned</p>
          <p className="text-lg font-bold text-white/80">{org?.seats_used || 0}</p>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <p className="text-[10px] text-white/30 uppercase tracking-wider">Sync Status</p>
          <p className="text-sm font-medium text-emerald-400">Healthy</p>
        </div>
      </div>
    </div>
  );
}