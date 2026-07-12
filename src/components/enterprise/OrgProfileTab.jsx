import React, { useState, useEffect } from "react";
import { Loader2, Building2, Save } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const TENANT_TYPES = [
  { value: "single", label: "Single Organization" },
  { value: "multi", label: "Multi Organization" },
  { value: "enterprise", label: "Enterprise Tenant" },
  { value: "education", label: "Education Tenant" },
  { value: "government", label: "Government Tenant" },
  { value: "partner", label: "Partner Tenant" },
];

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1001-5000", "5001-10000", "10000+"];

const FIELD_CLASS = "w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50";
const LABEL_CLASS = "text-white/40 text-xs uppercase tracking-wider mb-1.5 block";

export default function OrgProfileTab({ organization, onUpdate }) {
  const { toast } = useToast();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(organization ? { ...organization } : null);
  }, [organization]);

  if (!form) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-400" size={24} /></div>;
  }

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.Organization.update(form.id, {
        name: form.name,
        legal_name: form.legal_name,
        industry: form.industry,
        country: form.country,
        region: form.region,
        timezone: form.timezone,
        company_size: form.company_size,
        employee_count: form.employee_count,
        domain: form.domain,
        brand_color: form.brand_color,
        tenant_type: form.tenant_type,
        organization_status: form.organization_status,
        description: form.description,
      });
      toast({ title: "Organization updated", description: "Profile saved successfully." });
      if (onUpdate) onUpdate();
    } catch (e) {
      toast({ title: "Update failed", description: e?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${form.brand_color || "#6366f1"}20`, border: `1px solid ${form.brand_color || "#6366f1"}40` }}>
            <Building2 size={20} style={{ color: form.brand_color || "#6366f1" }} />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">{form.name || "Unnamed Organization"}</h2>
            <p className="text-white/40 text-xs">{form.legal_name || form.domain || "—"}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-500">
          {saving ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Save size={14} className="mr-1.5" />}
          Save Changes
        </Button>
      </div>

      {/* Form grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>Organization Name</label>
          <input className={FIELD_CLASS} value={form.name || ""} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Legal Name</label>
          <input className={FIELD_CLASS} value={form.legal_name || ""} onChange={(e) => set("legal_name", e.target.value)} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Industry</label>
          <input className={FIELD_CLASS} value={form.industry || ""} onChange={(e) => set("industry", e.target.value)} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Domain</label>
          <input className={FIELD_CLASS} value={form.domain || ""} onChange={(e) => set("domain", e.target.value)} placeholder="acme.com" />
        </div>
        <div>
          <label className={LABEL_CLASS}>Country</label>
          <input className={FIELD_CLASS} value={form.country || ""} onChange={(e) => set("country", e.target.value)} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Region</label>
          <input className={FIELD_CLASS} value={form.region || ""} onChange={(e) => set("region", e.target.value)} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Time Zone</label>
          <input className={FIELD_CLASS} value={form.timezone || ""} onChange={(e) => set("timezone", e.target.value)} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Employee Count</label>
          <input type="number" className={FIELD_CLASS} value={form.employee_count || 0} onChange={(e) => set("employee_count", parseInt(e.target.value) || 0)} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Company Size</label>
          <select className={FIELD_CLASS} value={form.company_size || ""} onChange={(e) => set("company_size", e.target.value)}>
            <option value="">Select size band</option>
            {COMPANY_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS}>Tenant Type</label>
          <select className={FIELD_CLASS} value={form.tenant_type || "enterprise"} onChange={(e) => set("tenant_type", e.target.value)}>
            {TENANT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS}>Organization Status</label>
          <select className={FIELD_CLASS} value={form.organization_status || "pending"} onChange={(e) => set("organization_status", e.target.value)}>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS}>Brand Color</label>
          <div className="flex items-center gap-2">
            <input type="color" value={form.brand_color || "#6366f1"} onChange={(e) => set("brand_color", e.target.value)} className="w-10 h-9 rounded-md bg-transparent border border-white/10 cursor-pointer" />
            <input className={FIELD_CLASS} value={form.brand_color || ""} onChange={(e) => set("brand_color", e.target.value)} />
          </div>
        </div>
      </div>

      <div>
        <label className={LABEL_CLASS}>Description</label>
        <textarea className={`${FIELD_CLASS} resize-y`} rows={3} value={form.description || ""} onChange={(e) => set("description", e.target.value)} />
      </div>
    </div>
  );
}