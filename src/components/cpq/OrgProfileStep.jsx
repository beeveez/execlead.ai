import React from "react";
import { Building2, Mail, Globe, Users, Calendar, Server, Briefcase } from "lucide-react";

const INDUSTRIES = ["Technology", "Financial Services", "Healthcare", "Manufacturing", "Retail", "Government", "Education", "Telecommunications", "Energy", "Consulting", "Other"];
const COMPANY_SIZES = ["100-250", "250-500", "500-1000", "1000-5000", "5000-10000", "10000+"];
const REVENUE_RANGES = ["", "Under $10M", "$10M-$50M", "$50M-$100M", "$100M-$500M", "$500M-$1B", "$1B+"];
const TIMELINES = ["Immediate (0-3 months)", "3-6 months", "6-12 months", "12+ months", "Just exploring"];

const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50";

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 flex items-center gap-1">
        {Icon && <Icon size={10} />} {label}
      </label>
      {children}
    </div>
  );
}

export default function OrgProfileStep({ profile, onChange }) {
  const update = (field, value) => onChange({ ...profile, [field]: value });

  return (
    <div className="space-y-5">
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-4">
        <h3 className="text-white/40 text-xs uppercase tracking-wider">Organization Profile</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Organization Name *" icon={Building2}>
            <input type="text" placeholder="Acme Corp" value={profile.organization_name} onChange={e => update("organization_name", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Industry">
            <select value={profile.industry} onChange={e => update("industry", e.target.value)} className={inputClass}>
              {INDUSTRIES.map(i => <option key={i} value={i} className="bg-[#0d0d14]">{i}</option>)}
            </select>
          </Field>
          <Field label="Country (Tax Region)">
            <input type="text" placeholder="US" value={profile.country} onChange={e => update("country", e.target.value.toUpperCase())} className={inputClass} />
          </Field>
          <Field label="Headquarters" icon={Globe}>
            <input type="text" placeholder="San Francisco, CA" value={profile.headquarters} onChange={e => update("headquarters", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Company Size">
            <select value={profile.company_size} onChange={e => update("company_size", e.target.value)} className={inputClass}>
              {COMPANY_SIZES.map(s => <option key={s} value={s} className="bg-[#0d0d14]">{s}</option>)}
            </select>
          </Field>
          <Field label="Annual Revenue (Optional)">
            <select value={profile.annual_revenue} onChange={e => update("annual_revenue", e.target.value)} className={inputClass}>
              {REVENUE_RANGES.map((r, i) => <option key={i} value={r} className="bg-[#0d0d14]">{r || "Select..."}</option>)}
            </select>
          </Field>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-4">
        <h3 className="text-white/40 text-xs uppercase tracking-wider">Workforce</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="Total Employees" icon={Users}>
            <input type="number" min="0" value={profile.num_employees} onChange={e => update("num_employees", parseInt(e.target.value) || 0)} className={inputClass} />
          </Field>
          <Field label="Expected Active Users" icon={Users}>
            <input type="number" min="0" value={profile.expected_active_users} onChange={e => update("expected_active_users", parseInt(e.target.value) || 0)} className={inputClass} />
          </Field>
          <Field label="Expected Managers">
            <input type="number" min="0" value={profile.expected_managers} onChange={e => update("expected_managers", parseInt(e.target.value) || 0)} className={inputClass} />
          </Field>
          <Field label="Expected Executives">
            <input type="number" min="0" value={profile.expected_executives} onChange={e => update("expected_executives", parseInt(e.target.value) || 0)} className={inputClass} />
          </Field>
          <Field label="Implementation Timeline" icon={Calendar}>
            <select value={profile.implementation_timeline} onChange={e => update("implementation_timeline", e.target.value)} className={inputClass}>
              {TIMELINES.map(t => <option key={t} value={t} className="bg-[#0d0d14]">{t}</option>)}
            </select>
          </Field>
          <Field label="Business Email *" icon={Mail}>
            <input type="email" placeholder="you@company.com" value={profile.customer_email} onChange={e => update("customer_email", e.target.value)} className={inputClass} />
          </Field>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-4">
        <h3 className="text-white/40 text-xs uppercase tracking-wider">Current Systems (Optional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Field label="Current LMS" icon={Briefcase}>
            <input type="text" placeholder="Cornerstone, SAP Litmos..." value={profile.current_lms} onChange={e => update("current_lms", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Current HR Platform" icon={Briefcase}>
            <input type="text" placeholder="Workday, BambooHR..." value={profile.current_hr_platform} onChange={e => update("current_hr_platform", e.target.value)} className={inputClass} />
          </Field>
          <Field label="Current Identity Provider" icon={Server}>
            <input type="text" placeholder="Azure AD, Okta..." value={profile.current_identity_provider} onChange={e => update("current_identity_provider", e.target.value)} className={inputClass} />
          </Field>
        </div>
      </div>
    </div>
  );
}