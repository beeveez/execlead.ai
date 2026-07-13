import React, { useState, useEffect, useMemo } from "react";
import { Building2, LayoutDashboard, List, UserPlus, ShieldAlert, Plus, Loader2, X, ChevronDown, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import VendorDashboard from "@/components/vendor/VendorDashboard";
import VendorDirectory from "@/components/vendor/VendorDirectory";
import VendorDetail from "@/components/vendor/VendorDetail";
import {
  computeVendorMetrics, computeRiskDistribution, computeOnboardingPipeline,
  getStatusBadge, getRiskBadge, formatCurrency,
  VENDOR_TYPES, VENDOR_CATEGORIES, ONBOARDING_STEPS, RISK_LEVELS, COMPLIANCE_STATUS, SECURITY_ASSESSMENT_STATUS,
} from "@/lib/vendorEngine";
import DashboardKPI from "@/components/enterprise/DashboardKPI";

const MODULES = [
  { id: "dashboard", label: "Vendor Dashboard™", icon: LayoutDashboard, desc: "KPIs & overview" },
  { id: "directory", label: "Vendor Directory™", icon: List, desc: "All vendors" },
  { id: "onboarding", label: "Onboarding Pipeline™", icon: UserPlus, desc: "Vendor onboarding" },
  { id: "risk", label: "Risk & Compliance™", icon: ShieldAlert, desc: "Risk management" },
];

export default function VendorManagement() {
  const { user } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const [showForm, setShowForm] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [orgSwitcherOpen, setOrgSwitcherOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const vends = await base44.entities.Vendor.list("-created_date", 500);
      setVendors(Array.isArray(vends) ? vends : []);
    } catch (e) { console.error("Vendor load failed:", e); }
    try {
      const orgs = await base44.entities.Organization.list("-created_date", 200);
      const orgArr = Array.isArray(orgs) ? orgs : [];
      setOrganizations(orgArr);
      if (orgArr.length > 0) setSelectedOrgId(orgArr[0].id);
    } catch (e) { console.error("Organizations load failed:", e); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const selectedOrg = organizations.find((o) => o.id === selectedOrgId);
  const filteredVendors = useMemo(() => {
    if (!selectedOrgId) return vendors;
    return (vendors || []).filter((v) => v.organization_id === selectedOrgId);
  }, [vendors, selectedOrgId]);

  const handleCreateVendor = async (formData) => {
    try {
      const payload = {
        ...formData,
        organization_id: selectedOrgId || formData.organization_id,
        organization_name: selectedOrg?.name || formData.organization_name,
        status: "onboarding",
        onboarding_status: "in_progress",
        onboarding_date: new Date().toISOString().split("T")[0],
        risk_level: formData.risk_level || "medium",
        performance_score: 0,
        performance_tier: "approved",
        total_spend: 0,
        active_contracts: 0,
        total_contracts: 0,
        scorecard_json: JSON.stringify({ quality: 0, delivery: 0, cost: 0, service: 0, innovation: 0 }),
        risk_flags_json: "[]",
      };
      const created = await base44.entities.Vendor.create(payload);
      setVendors((prev) => [created, ...prev]);
      setShowForm(false);
    } catch (e) { console.error("Failed to create vendor:", e); }
  };

  const handleUpdateVendor = async (vendor, updates) => {
    try {
      const updated = await base44.entities.Vendor.update(vendor.id, updates);
      setVendors((prev) => prev.map((v) => (v.id === vendor.id ? { ...v, ...updated } : v)));
      setSelectedVendor(null);
    } catch (e) { console.error("Failed to update vendor:", e); }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-indigo-400" size={24} />
      </div>
    );
  }

  const activeModule = MODULES.find((m) => m.id === tab);

  const renderModule = () => {
    switch (tab) {
      case "dashboard":
        return <VendorDashboard vendors={filteredVendors} onNewVendor={() => setShowForm(true)} onSelectVendor={setSelectedVendor} />;
      case "directory":
        return <VendorDirectory vendors={filteredVendors} onNewVendor={() => setShowForm(true)} onSelectVendor={setSelectedVendor} />;
      case "onboarding":
        return <OnboardingPipeline vendors={filteredVendors} onSelectVendor={setSelectedVendor} />;
      case "risk":
        return <RiskCompliance vendors={filteredVendors} onSelectVendor={setSelectedVendor} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <Building2 size={12} className="text-indigo-400" /> Enterprise Commercial Platform™
          </div>
          <h1 className="text-2xl font-bold text-white">Vendor Management™</h1>
          <p className="text-white/40 text-sm mt-1">Vendor portal, onboarding, risk management, compliance, and performance scorecards.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
          <Plus size={16} /> Add Vendor
        </button>
      </div>

      {organizations.length > 0 && (
        <div className="relative">
          <button onClick={() => setOrgSwitcherOpen(!orgSwitcherOpen)} className="w-full flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/5 transition-colors">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-indigo-500/10 border border-indigo-500/20">
              <Building2 size={18} className="text-indigo-400" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <span className="text-white font-medium text-sm">{selectedOrg?.name || "Select organization"}</span>
              <div className="text-white/30 text-xs truncate">{selectedOrg?.domain || selectedOrg?.industry || "—"}</div>
            </div>
            <ChevronDown size={16} className={`text-white/30 transition-transform ${orgSwitcherOpen ? "rotate-180" : ""}`} />
          </button>
          {orgSwitcherOpen && (
            <div className="absolute z-20 mt-1 w-full bg-[#0d0d14] border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto">
              {organizations.map((org) => (
                <button key={org.id} onClick={() => { setSelectedOrgId(org.id); setOrgSwitcherOpen(false); }} className={`w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left ${org.id === selectedOrgId ? "bg-indigo-500/5" : ""}`}>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{org.name}</div>
                    <div className="text-white/30 text-xs truncate">{org.domain || org.industry || "—"}</div>
                  </div>
                  {org.id === selectedOrgId && <Check size={14} className="text-indigo-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-64 shrink-0">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2 lg:sticky lg:top-4">
            <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
              {MODULES.map((m) => (
                <button key={m.id} onClick={() => setTab(m.id)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors shrink-0 lg:w-full ${tab === m.id ? "bg-indigo-500/10 text-indigo-400" : "text-white/40 hover:text-white/80 hover:bg-white/5"}`}>
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
          {renderModule()}
        </div>
      </div>

      {showForm && (
        <VendorFormModal organizations={organizations} selectedOrgId={selectedOrgId} onClose={() => setShowForm(false)} onSubmit={handleCreateVendor} />
      )}

      <VendorDetail vendor={selectedVendor} onClose={() => setSelectedVendor(null)} onUpdate={handleUpdateVendor} />
    </div>
  );
}

function OnboardingPipeline({ vendors, onSelectVendor }) {
  const pipeline = useMemo(() => computeOnboardingPipeline(vendors), [vendors]);
  const onboardingVendors = (vendors || []).filter((v) => v.status === "onboarding");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {ONBOARDING_STEPS.map((step) => {
          const count = pipeline.find((p) => p.id === step.id)?.count || 0;
          return (
            <div key={step.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
              <div className={`text-2xl font-bold ${count > 0 ? "text-indigo-400" : "text-white/20"}`}>{count}</div>
              <div className="text-[9px] text-white/40 uppercase tracking-wider mt-1">{step.label}</div>
            </div>
          );
        })}
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-3">Vendors in Onboarding</h3>
        {onboardingVendors.length > 0 ? (
          <div className="space-y-2">
            {onboardingVendors.map((v) => {
              const status = getStatusBadge(v.status);
              return (
                <button key={v.id} onClick={() => onSelectVendor(v)} className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/5 transition-colors text-left">
                  <Building2 size={14} className="text-indigo-400 shrink-0" />
                  <span className="text-sm text-white/80 truncate flex-1">{v.vendor_name}</span>
                  <span className="text-[10px] text-white/40">{v.onboarding_status?.replace(/_/g, " ")}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full border ${status.badge}`}>{status.label}</span>
                </button>
              );
            })}
          </div>
        ) : <div className="text-center py-8 text-white/30 text-sm">No vendors currently in onboarding.</div>}
      </div>
    </div>
  );
}

function RiskCompliance({ vendors, onSelectVendor }) {
  const metrics = useMemo(() => computeVendorMetrics(vendors), [vendors]);
  const riskDist = useMemo(() => computeRiskDistribution(vendors), [vendors]);
  const atRisk = (vendors || []).filter((v) => v.risk_level === "high" || v.risk_level === "critical");
  const nonCompliant = (vendors || []).filter((v) => v.compliance_status === "non_compliant" || v.compliance_status === "pending");
  const securityPending = (vendors || []).filter((v) => v.security_assessment_status === "pending" || v.security_assessment_status === "expired" || v.security_assessment_status === "failed");

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashboardKPI icon={ShieldAlert} label="At Risk" value={metrics.atRisk} color="red" />
        <DashboardKPI icon={Check} label="Compliance Rate" value={`${metrics.complianceRate}%`} color={metrics.complianceRate >= 90 ? "emerald" : "amber"} />
        <DashboardKPI icon={ShieldAlert} label="Security Passed" value={`${metrics.securityRate}%`} color={metrics.securityRate >= 90 ? "emerald" : "amber"} />
        <DashboardKPI icon={Building2} label="Non-Compliant" value={nonCompliant.length} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RiskList title="High / Critical Risk Vendors" vendors={atRisk} onSelectVendor={onSelectVendor} emptyText="No high-risk vendors." />
        <RiskList title="Compliance & Security Pending" vendors={nonCompliant} onSelectVendor={onSelectVendor} emptyText="All vendors compliant." />
      </div>

      <RiskList title="Security Assessment Required" vendors={securityPending} onSelectVendor={onSelectVendor} emptyText="All security assessments passed." />
    </div>
  );
}

function RiskList({ title, vendors, onSelectVendor, emptyText }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-3">{title}</h3>
      {vendors.length > 0 ? (
        <div className="space-y-2">
          {vendors.map((v) => {
            const risk = getRiskBadge(v.risk_level);
            return (
              <button key={v.id} onClick={() => onSelectVendor(v)} className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/5 transition-colors text-left">
                <Building2 size={14} className="text-white/30 shrink-0" />
                <span className="text-sm text-white/80 truncate flex-1">{v.vendor_name}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full border ${risk.badge}`}>{risk.label}</span>
              </button>
            );
          })}
        </div>
      ) : <div className="text-center py-6 text-white/30 text-sm">{emptyText}</div>}
    </div>
  );
}

function VendorFormModal({ organizations, selectedOrgId, onClose, onSubmit }) {
  const [form, setForm] = useState({
    vendor_name: "",
    vendor_type: "supplier",
    category: "software",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    website: "",
    address: "",
    payment_terms: "Net 30",
    contract_value: 0,
    risk_level: "medium",
    compliance_status: "pending",
    security_assessment_status: "pending",
    notes: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.vendor_name) return;
    onSubmit(form);
  };

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full max-w-lg bg-[#0d0d14] border border-white/10 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0d0d14] border-b border-white/5 px-5 py-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-white">Add Vendor</h3>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white/80"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-3">
          <Field label="Vendor Name *">
            <input value={form.vendor_name} onChange={(e) => set("vendor_name", e.target.value)} placeholder="Acme Corp" className="form-input" required />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <select value={form.vendor_type} onChange={(e) => set("vendor_type", e.target.value)} className="form-input">
                {VENDOR_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="Category">
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className="form-input">
                {VENDOR_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Contact Name">
              <input value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} placeholder="Jane Doe" className="form-input" />
            </Field>
            <Field label="Contact Email">
              <input value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} placeholder="jane@acme.com" className="form-input" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phone">
              <input value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} placeholder="+1 555-0100" className="form-input" />
            </Field>
            <Field label="Website">
              <input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://acme.com" className="form-input" />
            </Field>
          </div>
          <Field label="Address">
            <input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="123 Main St, City, Country" className="form-input" />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Contract Value">
              <input type="number" value={form.contract_value} onChange={(e) => set("contract_value", parseFloat(e.target.value) || 0)} className="form-input" />
            </Field>
            <Field label="Payment Terms">
              <input value={form.payment_terms} onChange={(e) => set("payment_terms", e.target.value)} className="form-input" />
            </Field>
            <Field label="Risk Level">
              <select value={form.risk_level} onChange={(e) => set("risk_level", e.target.value)} className="form-input">
                {RISK_LEVELS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Compliance">
              <select value={form.compliance_status} onChange={(e) => set("compliance_status", e.target.value)} className="form-input">
                {COMPLIANCE_STATUS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Security Assessment">
              <select value={form.security_assessment_status} onChange={(e) => set("security_assessment_status", e.target.value)} className="form-input">
                {SECURITY_ASSESSMENT_STATUS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Notes">
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} className="form-input" />
          </Field>
        </div>
        <div className="sticky bottom-0 bg-[#0d0d14] border-t border-white/5 px-5 py-3 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm transition-colors">Cancel</button>
          <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">Create Vendor</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">{label}</label>
      {children}
    </div>
  );
}