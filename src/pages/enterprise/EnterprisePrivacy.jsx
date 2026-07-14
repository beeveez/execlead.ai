import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck, Building2, Loader2, ChevronDown, Check, Users, FileText,
  Share2, Globe, Scale, ArrowRight, Shield, Eye, Download,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const MODULES = [
  { id: "dashboard", label: "Organization Dashboard™", icon: Eye, desc: "Privacy posture overview" },
  { id: "governance", label: "Employee Data Governance™", icon: Users, desc: "Workforce data policies" },
  { id: "consent", label: "Organization Consent™", icon: ShieldCheck, desc: "Bulk consent management" },
  { id: "sharing", label: "Data Sharing™", icon: Share2, desc: "Third-party data sharing" },
  { id: "dpa", label: "DPA Management™", icon: FileText, desc: "Data processing agreements" },
  { id: "reports", label: "Compliance Reports™", icon: Scale, desc: "Regulatory reporting" },
  { id: "transfers", label: "Cross-Border Transfers™", icon: Globe, desc: "International data transfers" },
];

const TENANT_BADGE = {
  single: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  multi: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  enterprise: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
};

export default function EnterprisePrivacy() {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");
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
        <Loader2 className="animate-spin text-emerald-400" size={24} />
      </div>
    );
  }

  const activeModule = MODULES.find(m => m.id === tab);

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <ShieldCheck size={12} className="text-emerald-400" /> Enterprise Privacy™ · My Organization
        </div>
        <h1 className="text-2xl font-bold text-white">Enterprise Privacy™</h1>
        <p className="text-white/40 text-sm mt-1">
          Organization-level privacy governance, data sharing, DPA management, and cross-border compliance.
          Manages only your organization — not individual accounts or platform infrastructure.
        </p>
      </div>

      {/* Organization Switcher */}
      <div className="relative">
        <button onClick={() => setOrgSwitcherOpen(!orgSwitcherOpen)}
          className="w-full flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/5 transition-colors">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${selectedOrg?.brand_color || "#10b981"}20`, border: `1px solid ${selectedOrg?.brand_color || "#10b981"}40` }}>
            <Building2 size={18} style={{ color: selectedOrg?.brand_color || "#10b981" }} />
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium text-sm truncate">{selectedOrg?.name || "Select organization"}</span>
              {selectedOrg && <span className={`px-2 py-0.5 rounded-md text-xs border ${TENANT_BADGE[selectedOrg.tenant_type] || TENANT_BADGE.enterprise}`}>{selectedOrg.tenant_type || "enterprise"}</span>}
            </div>
            <div className="text-white/30 text-xs truncate">
              {selectedOrg ? `${selectedOrg.legal_name || selectedOrg.domain || "—"}` : "Choose an organization to manage"}
            </div>
          </div>
          <ChevronDown size={16} className={`text-white/30 transition-transform ${orgSwitcherOpen ? "rotate-180" : ""}`} />
        </button>
        {orgSwitcherOpen && (
          <div className="absolute z-20 mt-1 w-full bg-[#0d0d14] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
            {organizations.map(org => (
              <button key={org.id} onClick={() => { setSelectedId(org.id); setOrgSwitcherOpen(false); }}
                className={`w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left ${org.id === selectedId ? "bg-emerald-500/5" : ""}`}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${org.brand_color || "#10b981"}20` }}>
                  <Building2 size={14} style={{ color: org.brand_color || "#10b981" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">{org.name}</div>
                  <div className="text-white/30 text-xs truncate">{org.domain || org.industry || "—"}</div>
                </div>
                {org.id === selectedId && <Check size={14} className="text-emerald-400" />}
              </button>
            ))}
            {organizations.length === 0 && <div className="p-4 text-center text-white/30 text-sm">No organizations found.</div>}
          </div>
        )}
      </div>

      {/* Cross-links */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link to="/enterprise/security" className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white/70">
          <Shield size={12} /> Enterprise Security™ <ArrowRight size={10} />
        </Link>
        <Link to="/enterprise/governance" className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white/70">
          <Scale size={12} /> Governance <ArrowRight size={10} />
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors shrink-0 lg:w-full ${tab === m.id ? "bg-emerald-500/10 text-emerald-400" : "text-white/40 hover:text-white/80 hover:bg-white/5"}`}>
                  <m.icon size={16} className={tab === m.id ? "text-emerald-400" : "text-white/30"} />
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
            {activeModule && <activeModule.icon size={16} className="text-emerald-400" />}
            <h2 className="text-white font-medium text-sm">{activeModule?.label}</h2>
          </div>
          {tab === "dashboard" && <OrgDashboard org={selectedOrg} />}
          {tab === "governance" && <EmployeeGovernance org={selectedOrg} />}
          {tab === "consent" && <OrgConsent org={selectedOrg} />}
          {tab === "sharing" && <DataSharing org={selectedOrg} />}
          {tab === "dpa" && <DPAManagement org={selectedOrg} />}
          {tab === "reports" && <ComplianceReports org={selectedOrg} />}
          {tab === "transfers" && <CrossBorderTransfers org={selectedOrg} />}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MODULE COMPONENTS
// ============================================================

function OrgDashboard({ org }) {
  const stats = [
    { label: "Privacy Score", value: "82", icon: ShieldCheck, color: "emerald" },
    { label: "Employees Tracked", value: `${org?.seats_used || 0}`, icon: Users, color: "blue" },
    { label: "Active DPAs", value: "3", icon: FileText, color: "indigo" },
    { label: "Data Transfers", value: "5", icon: Globe, color: "amber" },
  ];
  const colorMap = { emerald: "text-emerald-400", blue: "text-blue-400", indigo: "text-indigo-400", amber: "text-amber-400" };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <s.icon size={16} className={`${colorMap[s.color]} mb-2`} />
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-[10px] text-white/30 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <h3 className="text-sm font-medium text-white/80 mb-2">Privacy Posture</h3>
        <div className="space-y-2">
          {[
            { label: "Data inventory mapped", status: "Complete" },
            { label: "Consent records up to date", status: "98%" },
            { label: "DPA agreements signed", status: "3 of 3" },
            { label: "Cross-border transfer safeguards", status: "Active" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2 text-xs">
              <Check size={12} className="text-emerald-400" />
              <span className="text-white/60">{item.label}</span>
              <span className="text-white/40 ml-auto">{item.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmployeeGovernance({ org }) {
  const policies = [
    { label: "Employee Data Classification", status: "Enforced", desc: "Classify employee data by sensitivity" },
    { label: "Access Need-to-Know", status: "Enforced", desc: "Restrict employee data access to authorized roles" },
    { label: "Retention Schedule", status: "Active", desc: "Auto-delete employee data after retention period" },
    { label: "Offboarding Data Purge", status: "Automated", desc: "Remove personal data when employees leave" },
  ];
  return (
    <div className="space-y-3">
      {policies.map(p => (
        <div key={p.label} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <Users size={16} className="text-white/40 shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-white/80">{p.label}</h3>
            <p className="text-[11px] text-white/30 mt-0.5">{p.desc}</p>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full text-emerald-400 bg-emerald-500/10">{p.status}</span>
        </div>
      ))}
    </div>
  );
}

function OrgConsent({ org }) {
  return (
    <div className="space-y-3">
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <h3 className="text-sm font-medium text-white/80 mb-2">Organization Consent Status</h3>
        <div className="grid grid-cols-3 gap-3">
          <div><p className="text-lg font-bold text-white">{org?.seats_used || 0}</p><p className="text-[10px] text-white/30">Total Members</p></div>
          <div><p className="text-lg font-bold text-emerald-400">{Math.floor((org?.seats_used || 0) * 0.92)}</p><p className="text-[10px] text-white/30">Consent Granted</p></div>
          <div><p className="text-lg font-bold text-amber-400">{Math.ceil((org?.seats_used || 0) * 0.08)}</p><p className="text-[10px] text-white/30">Pending</p></div>
        </div>
      </div>
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <h3 className="text-sm font-medium text-white/80 mb-2">Consent Types</h3>
        <div className="space-y-2">
          {["Marketing", "Analytics", "AI Personalization", "Data Processing"].map(type => (
            <div key={type} className="flex items-center gap-2 text-xs">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span className="text-white/60">{type}</span>
              <span className="text-white/40 ml-auto">Managed</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DataSharing({ org }) {
  const shares = [
    { partner: "CRM Provider", data: "Contact data", purpose: "Sales automation", status: "Active" },
    { partner: "HR Platform", data: "Employee records", purpose: "Workforce management", status: "Active" },
    { partner: "Analytics Service", data: "Usage metrics", purpose: "Product improvement", status: "Active" },
  ];
  return (
    <div className="space-y-3">
      {shares.map(s => (
        <div key={s.partner} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <Share2 size={16} className="text-white/40 shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-white/80">{s.partner}</h3>
            <p className="text-[11px] text-white/30">{s.data} · {s.purpose}</p>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full text-emerald-400 bg-emerald-500/10">{s.status}</span>
        </div>
      ))}
    </div>
  );
}

function DPAManagement({ org }) {
  const dpas = [
    { name: "Cloud Infrastructure DPA", signed: "2026-01-15", status: "Active" },
    { name: "CRM Platform DPA", signed: "2025-11-20", status: "Active" },
    { name: "AI Services DPA", signed: "2026-03-01", status: "Active" },
  ];
  return (
    <div className="space-y-3">
      {dpas.map(d => (
        <div key={d.name} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <FileText size={16} className="text-white/40 shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-white/80">{d.name}</h3>
            <p className="text-[11px] text-white/30">Signed: {d.signed}</p>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full text-emerald-400 bg-emerald-500/10">{d.status}</span>
        </div>
      ))}
    </div>
  );
}

function ComplianceReports({ org }) {
  const reports = [
    { name: "Annual Privacy Report", date: "2026-06-01", type: "Annual" },
    { name: "Q2 Consent Audit", date: "2026-06-30", type: "Quarterly" },
    { name: "Data Breach Assessment", date: "2026-05-15", type: "Incident" },
  ];
  return (
    <div className="space-y-3">
      {reports.map(r => (
        <div key={r.name} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <Scale size={16} className="text-white/40 shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-white/80">{r.name}</h3>
            <p className="text-[11px] text-white/30">{r.type} · {r.date}</p>
          </div>
          <span className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer">
            <Download size={10} /> Export
          </span>
        </div>
      ))}
    </div>
  );
}

function CrossBorderTransfers({ org }) {
  const transfers = [
    { destination: "United States", mechanism: "SCCs", status: "Active", data: "Analytics, CRM" },
    { destination: "Singapore", mechanism: "Adequacy", status: "Active", data: "HR records" },
    { destination: "European Union", mechanism: "SCCs", status: "Active", data: "User profiles" },
  ];
  return (
    <div className="space-y-3">
      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
        <div className="flex items-center gap-2 mb-1">
          <Globe size={14} className="text-emerald-400" />
          <h3 className="text-sm font-medium text-white/80">Cross-Border Transfer Safeguards</h3>
        </div>
        <p className="text-[11px] text-white/30">All international data transfers use appropriate safeguards per RA 10173.</p>
      </div>
      {transfers.map(t => (
        <div key={t.destination} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <Globe size={16} className="text-white/40 shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-white/80">{t.destination}</h3>
            <p className="text-[11px] text-white/30">{t.data} · {t.mechanism}</p>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full text-emerald-400 bg-emerald-500/10">{t.status}</span>
        </div>
      ))}
    </div>
  );
}