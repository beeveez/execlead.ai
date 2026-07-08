import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { X, Loader2, Building2 } from "lucide-react";
import {
  CATEGORIES, PARTNER_TYPES, WORK_MODELS, EXECUTIVE_LEVELS,
  STARTUP_STAGES, LISTING_TIERS, LISTING_STATUSES,
} from "@/lib/partnershipMarketplace";
import { toast } from "@/components/ui/use-toast";

const EMPTY = {
  title: "", category: "advisory_roles", description: "",
  partner_organization_name: "", partner_type: "enterprise", organization_logo: "",
  is_verified_partner: false, industry: "", country: "", location: "",
  work_model: "remote", compensation: "", equity_percent: 0, retainer: "",
  hourly_rate: 0, revenue_share_percent: 0, duration: "",
  required_experience_years: 0, executive_level: "director",
  required_skills: [], leadership_competencies: "", benefits: "",
  application_deadline: "", contact_person: "", apply_url: "",
  status: "draft", listing_tier: "basic", investment_size: "", startup_stage: "seed",
  is_featured: false, is_sponsored: false, is_urgent: false, is_executive_pick: false,
};

export default function CreateListingModal({ existing, onClose, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [skillsInput, setSkillsInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setForm({ ...EMPTY, ...existing });
      setSkillsInput((existing.required_skills || []).join(", "));
    }
  }, [existing]);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast({ title: "Title required", variant: "error" });
      return;
    }
    if (!form.category) {
      toast({ title: "Category required", variant: "error" });
      return;
    }

    setSaving(true);
    try {
      const skills = skillsInput.split(",").map(s => s.trim()).filter(Boolean);
      const data = {
        ...form,
        required_skills: skills,
        equity_percent: Number(form.equity_percent) || 0,
        hourly_rate: Number(form.hourly_rate) || 0,
        revenue_share_percent: Number(form.revenue_share_percent) || 0,
        required_experience_years: Number(form.required_experience_years) || 0,
        is_featured: form.listing_tier === "featured" || form.is_featured,
        is_sponsored: form.listing_tier === "sponsored" || form.is_sponsored,
        is_urgent: form.listing_tier === "urgent" || form.is_urgent,
      };

      const action = existing ? "update_listing" : "create_listing";
      const payload = existing
        ? { action, listing_id: existing.id, updates: data }
        : { action, listing: data };

      const res = await base44.functions.invoke("partnershipOps", payload);
      if (res.data.success) {
        toast({
          title: existing ? "Listing updated" : "Listing created",
          description: existing ? "Your changes have been saved." : "Your opportunity is now live.",
          variant: "success",
        });
        onSaved?.();
        onClose();
      }
    } catch (e) {
      toast({ title: "Error", description: e.response?.data?.error || e.message, variant: "error" });
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#0d0d14] border border-white/10 rounded-2xl overflow-hidden flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
          <h2 className="text-white font-bold text-lg">{existing ? "Edit Listing" : "Create Partnership Listing"}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/80 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">
          {/* Basic Info */}
          <Section title="Basic Information">
            <Field label="Title" required>
              <input value={form.title} onChange={e => update("title", e.target.value)}
                placeholder="e.g. Fractional CTO for AI Startup"
                className={inputCls} />
            </Field>
            <Field label="Category" required>
              <select value={form.category} onChange={e => update("category", e.target.value)} className={inputCls}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Description" full>
              <textarea value={form.description} onChange={e => update("description", e.target.value)}
                rows={4} placeholder="Describe the opportunity..."
                className={`${inputCls} resize-none`} />
            </Field>
          </Section>

          {/* Organization */}
          <Section title="Organization">
            <Field label="Organization Name">
              <input value={form.partner_organization_name} onChange={e => update("partner_organization_name", e.target.value)}
                placeholder="e.g. Acme Corp" className={inputCls} />
            </Field>
            <Field label="Partner Type">
              <select value={form.partner_type} onChange={e => update("partner_type", e.target.value)} className={inputCls}>
                {PARTNER_TYPES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </Field>
            <Field label="Organization Logo URL">
              <input value={form.organization_logo} onChange={e => update("organization_logo", e.target.value)}
                placeholder="https://..." className={inputCls} />
            </Field>
            <Field label="Verified Partner">
              <label className="flex items-center gap-2 mt-2">
                <input type="checkbox" checked={form.is_verified_partner} onChange={e => update("is_verified_partner", e.target.checked)}
                  className="w-4 h-4 rounded accent-indigo-500" />
                <span className="text-sm text-white/60">Display verification badge</span>
              </label>
            </Field>
          </Section>

          {/* Location */}
          <Section title="Location & Work Model">
            <Field label="Country">
              <input value={form.country} onChange={e => update("country", e.target.value)}
                placeholder="e.g. United States" className={inputCls} />
            </Field>
            <Field label="City/Location">
              <input value={form.location} onChange={e => update("location", e.target.value)}
                placeholder="e.g. San Francisco, CA" className={inputCls} />
            </Field>
            <Field label="Work Model">
              <select value={form.work_model} onChange={e => update("work_model", e.target.value)} className={inputCls}>
                {WORK_MODELS.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}
              </select>
            </Field>
          </Section>

          {/* Compensation */}
          <Section title="Compensation">
            <Field label="Compensation Summary">
              <input value={form.compensation} onChange={e => update("compensation", e.target.value)}
                placeholder="e.g. $150K-$200K base" className={inputCls} />
            </Field>
            <Field label="Equity %">
              <input type="number" value={form.equity_percent} onChange={e => update("equity_percent", e.target.value)}
                className={inputCls} />
            </Field>
            <Field label="Retainer">
              <input value={form.retainer} onChange={e => update("retainer", e.target.value)}
                placeholder="e.g. $5K/month" className={inputCls} />
            </Field>
            <Field label="Hourly Rate ($)">
              <input type="number" value={form.hourly_rate} onChange={e => update("hourly_rate", e.target.value)}
                className={inputCls} />
            </Field>
            <Field label="Revenue Share %">
              <input type="number" value={form.revenue_share_percent} onChange={e => update("revenue_share_percent", e.target.value)}
                className={inputCls} />
            </Field>
          </Section>

          {/* Requirements */}
          <Section title="Requirements">
            <Field label="Required Experience (years)">
              <input type="number" value={form.required_experience_years} onChange={e => update("required_experience_years", e.target.value)}
                className={inputCls} />
            </Field>
            <Field label="Executive Level">
              <select value={form.executive_level} onChange={e => update("executive_level", e.target.value)} className={inputCls}>
                {EXECUTIVE_LEVELS.map(el => <option key={el.id} value={el.id}>{el.label}</option>)}
              </select>
            </Field>
            <Field label="Required Skills (comma-separated)" full>
              <input value={skillsInput} onChange={e => setSkillsInput(e.target.value)}
                placeholder="e.g. AI Strategy, Board Governance, Fundraising" className={inputCls} />
            </Field>
            <Field label="Leadership Competencies" full>
              <textarea value={form.leadership_competencies} onChange={e => update("leadership_competencies", e.target.value)}
                rows={2} placeholder="e.g. Strategic thinking, team building, change management" className={`${inputCls} resize-none`} />
            </Field>
          </Section>

          {/* Additional */}
          <Section title="Additional Details">
            <Field label="Duration">
              <input value={form.duration} onChange={e => update("duration", e.target.value)}
                placeholder="e.g. 6 months" className={inputCls} />
            </Field>
            <Field label="Application Deadline">
              <input type="date" value={form.application_deadline ? form.application_deadline.split("T")[0] : ""}
                onChange={e => update("application_deadline", e.target.value ? new Date(e.target.value).toISOString() : "")}
                className={inputCls} />
            </Field>
            <Field label="Contact Person">
              <input value={form.contact_person} onChange={e => update("contact_person", e.target.value)}
                placeholder="e.g. Jane Doe" className={inputCls} />
            </Field>
            <Field label="Apply URL">
              <input value={form.apply_url} onChange={e => update("apply_url", e.target.value)}
                placeholder="https://..." className={inputCls} />
            </Field>
            <Field label="Investment Size" condition={form.category === "investment_opportunities" || form.category === "venture_capital"}>
              <input value={form.investment_size} onChange={e => update("investment_size", e.target.value)}
                placeholder="e.g. $500K-$2M" className={inputCls} />
            </Field>
            <Field label="Startup Stage" condition={form.partner_type === "startup" || form.category === "startup_cofounder"}>
              <select value={form.startup_stage} onChange={e => update("startup_stage", e.target.value)} className={inputCls}>
                {STARTUP_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Benefits" full>
              <textarea value={form.benefits} onChange={e => update("benefits", e.target.value)}
                rows={2} placeholder="e.g. Equity, flexible hours, remote-first..." className={`${inputCls} resize-none`} />
            </Field>
          </Section>

          {/* Listing Tier & Status */}
          <Section title="Listing Tier & Status">
            <Field label="Listing Tier">
              <select value={form.listing_tier} onChange={e => update("listing_tier", e.target.value)} className={inputCls}>
                {LISTING_TIERS.map(t => <option key={t.id} value={t.id}>{t.label} — ${t.price}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={e => update("status", e.target.value)} className={inputCls}>
                {LISTING_STATUSES.filter(s => s.id === "draft" || s.id === "open").map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
          </Section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/5 shrink-0">
          <button onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/5 text-white/60 text-sm hover:bg-white/10 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-sm font-medium transition-colors">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Building2 size={14} />}
            {saving ? "Saving..." : existing ? "Save Changes" : "Create Listing"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50";

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-white/50 text-xs font-medium uppercase tracking-wide mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function Field({ label, required, full, condition = true, children }) {
  if (condition === false) return null;
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="text-xs text-white/40 mb-1 block">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}