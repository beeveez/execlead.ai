import React from "react";
import { ToggleField, SectionCard } from "./FormFields";
import { Shield, Globe, Lock, Eye } from "lucide-react";

const VISIBILITY = [
  { value: "public", label: "Public", desc: "Visible to everyone", icon: Globe },
  { value: "private", label: "Private", desc: "Only visible to you", icon: Lock },
  { value: "recruiter_visible", label: "Recruiter Visible", desc: "Visible to verified recruiters", icon: Eye },
];

export default function PrivacySection({ form, setField }) {
  return (
    <SectionCard title="Privacy" description="Control who sees your information." icon={Shield}>
      <div>
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">Profile Visibility</label>
        <div className="grid grid-cols-3 gap-2">
          {VISIBILITY.map(v => (
            <button key={v.value} onClick={() => setField("privacy_profile", v.value)} className={`flex flex-col items-center gap-1.5 py-3 rounded-lg border transition-all ${form.privacy_profile === v.value ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400" : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"}`}>
              <v.icon size={18} />
              <span className="text-xs font-medium">{v.label}</span>
              <span className="text-[10px] text-white/20 text-center px-1">{v.desc}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="border-t border-white/5 pt-2">
        <ToggleField label="Hide Salary" description="Keep your expected salary private" value={form.hide_salary} onChange={v => setField("hide_salary", v)} />
        <ToggleField label="Hide Resume" description="Prevent resume downloads by others" value={form.hide_resume} onChange={v => setField("hide_resume", v)} />
        <ToggleField label="Hide Email" description="Don't show your email address" value={form.hide_email} onChange={v => setField("hide_email", v)} />
      </div>
    </SectionCard>
  );
}