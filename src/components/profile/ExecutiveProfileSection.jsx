import React from "react";
import { TextField, TextAreaField, SelectField, SectionCard } from "./FormFields";
import { Briefcase } from "lucide-react";

const INDUSTRIES = ["Technology", "Finance", "Healthcare", "Manufacturing", "Retail", "Consulting", "Education", "Government", "Media", "Energy", "Real Estate", "Transportation", "Other"];

export default function ExecutiveProfileSection({ form, setField }) {
  return (
    <SectionCard title="Executive Profile" description="Your professional identity and current role." icon={Briefcase}>
      <TextField label="Professional Headline" value={form.professional_headline} onChange={v => setField("professional_headline", v)} placeholder="Chief Technology Officer | Digital Transformation Leader" />
      <TextAreaField label="Executive Bio" value={form.bio} onChange={v => setField("bio", v)} placeholder="A brief executive summary of your career, achievements, and leadership philosophy..." rows={5} />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Current Company" value={form.current_company} onChange={v => setField("current_company", v)} placeholder="Acme Corporation" />
        <TextField label="Current Position" value={form.current_role} onChange={v => setField("current_role", v)} placeholder="VP of Engineering" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <SelectField label="Industry" value={form.industry} onChange={v => setField("industry", v)} options={INDUSTRIES} />
        <TextField label="Years of Experience" value={form.years_experience} onChange={v => setField("years_experience", v)} placeholder="15" type="number" />
      </div>
    </SectionCard>
  );
}