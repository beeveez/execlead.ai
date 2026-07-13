import React, { useState } from "react";
import { Building2, Save, Loader2, Palette, Globe, Clock, MapPin, Lock, Cpu, Bell } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

export default function OrganizationSettings({ organization, onUpdate }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    legal_name: organization?.legal_name || "",
    logo_url: organization?.logo_url || "",
    brand_color: organization?.brand_color || "#6366f1",
    domain: organization?.domain || "",
    timezone: organization?.timezone || "UTC",
    country: organization?.country || "",
    region: organization?.region || "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await base44.entities.Organization.update(organization.id, form);
      toast({ title: "Settings saved", description: "Organization settings updated." });
      onUpdate?.();
    } catch (e) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const policies = [
    { icon: Lock, title: "Password Policy", desc: "Minimum 12 characters, mixed case, numbers, symbols. MFA required for admin roles.", editable: false },
    { icon: Cpu, title: "AI Policies", desc: "AI usage logged and audited. Executive simulations rate-limited per plan tier.", editable: false },
    { icon: Building2, title: "Default Workspace", desc: "New members default to the Executive workspace on first sign-in.", editable: false },
    { icon: Bell, title: "Notification Policies", desc: "Admin alerts delivered via in-app + email for security events and license thresholds.", editable: false },
  ];

  return (
    <div className="space-y-4">
      {/* Branding & Profile */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Palette size={14} className="text-indigo-400" />
          <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Branding & Profile</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Legal Name" icon={Building2}>
            <input value={form.legal_name} onChange={(e) => set("legal_name", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Logo URL" icon={Building2}>
            <input value={form.logo_url} onChange={(e) => set("logo_url", e.target.value)} placeholder="https://..." className={inputCls} />
          </Field>
          <Field label="Brand Color" icon={Palette}>
            <div className="flex items-center gap-2">
              <input type="color" value={form.brand_color} onChange={(e) => set("brand_color", e.target.value)} className="w-10 h-9 rounded-lg bg-transparent border border-white/10 cursor-pointer" />
              <input value={form.brand_color} onChange={(e) => set("brand_color", e.target.value)} className={inputCls} />
            </div>
          </Field>
          <Field label="Domain" icon={Globe}>
            <input value={form.domain} onChange={(e) => set("domain", e.target.value)} placeholder="acme.com" className={inputCls} />
          </Field>
        </div>
      </div>

      {/* Localization */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={14} className="text-blue-400" />
          <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Localization</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Time Zone" icon={Clock}>
            <input value={form.timezone} onChange={(e) => set("timezone", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Country" icon={MapPin}>
            <input value={form.country} onChange={(e) => set("country", e.target.value)} className={inputCls} />
          </Field>
          <Field label="Region" icon={MapPin}>
            <input value={form.region} onChange={(e) => set("region", e.target.value)} className={inputCls} />
          </Field>
        </div>
      </div>

      {/* Security & AI Policies */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={14} className="text-amber-400" />
          <h3 className="text-white/80 text-sm font-semibold uppercase tracking-wider">Security & AI Policies</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {policies.map((p) => (
            <div key={p.title} className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <p.icon size={13} className="text-white/40" />
                <span className="text-white/70 text-sm font-medium">{p.title}</span>
              </div>
              <p className="text-white/40 text-xs">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={save} disabled={saving} className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium flex items-center gap-2">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Settings
        </button>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500";

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-white/40 text-xs uppercase tracking-wider mb-1.5"><Icon size={11} /> {label}</label>
      {children}
    </div>
  );
}