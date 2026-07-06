import React from "react";
import { TextField, SelectField, SectionCard } from "./FormFields";
import CountrySelect from "@/components/common/CountrySelect";
import { Target, Monitor, Building, MapPin } from "lucide-react";

const INDUSTRIES = ["Technology", "Finance", "Healthcare", "Manufacturing", "Retail", "Consulting", "Education", "Government", "Media", "Energy", "Real Estate", "Transportation", "Other"];

export default function TargetCareerSection({ form, setField }) {
  const workPrefs = [
    { value: "remote", label: "Remote", icon: Monitor },
    { value: "hybrid", label: "Hybrid", icon: Building },
    { value: "onsite", label: "Onsite", icon: MapPin },
  ];

  return (
    <SectionCard title="Target Career" description="Define your next career move." icon={Target}>
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Target Company" value={form.target_company} onChange={v => setField("target_company", v)} placeholder="Google, Amazon, Stripe..." />
        <TextField label="Target Role" value={form.target_role} onChange={v => setField("target_role", v)} placeholder="Chief Technology Officer" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Target Country</label>
          <CountrySelect value={form.target_country} onChange={v => setField("target_country", v)} />
        </div>
        <SelectField label="Preferred Industry" value={form.preferred_industry} onChange={v => setField("preferred_industry", v)} options={INDUSTRIES} />
      </div>
      <TextField label="Expected Salary (USD)" value={form.expected_salary} onChange={v => setField("expected_salary", v)} placeholder="250000" type="number" />
      <div>
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Work Preference</label>
        <div className="grid grid-cols-3 gap-2">
          {workPrefs.map(pref => (
            <button key={pref.value} onClick={() => setField("work_preference", pref.value)} className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border transition-all ${form.work_preference === pref.value ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400" : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"}`}>
              <pref.icon size={18} />
              <span className="text-xs font-medium">{pref.label}</span>
            </button>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}