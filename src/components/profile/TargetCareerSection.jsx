import React, { useMemo } from "react";
import { SectionCard } from "./FormFields";
import CountrySelect from "@/components/common/CountrySelect";
import CompanyAutocomplete from "@/components/career-intelligence/CompanyAutocomplete";
import RoleAutocomplete from "@/components/career-intelligence/RoleAutocomplete";
import IndustryAutocomplete from "@/components/career-intelligence/IndustryAutocomplete";
import SalaryInput from "@/components/career-intelligence/SalaryInput";
import WorkPreferenceSelector from "@/components/career-intelligence/WorkPreferenceSelector";
import CareerIntelligencePanel from "@/components/career-intelligence/CareerIntelligencePanel";
import { Target } from "lucide-react";
import { getCompanyByName } from "@/lib/careerIntelligence/companyRegistry";

export default function TargetCareerSection({ form, setField }) {
  // When a company is selected, auto-populate industry if not already set
  const handleCompanyChange = (companyName) => {
    setField("target_company", companyName);
    const company = getCompanyByName(companyName);
    if (company && !form.preferred_industry) {
      setField("preferred_industry", company.industry);
    }
  };

  // Normalize work_preference: accept legacy string or new array
  const workPrefValue = Array.isArray(form.work_preference)
    ? form.work_preference
    : form.work_preference ? [form.work_preference] : [];

  return (
    <SectionCard
      title="Target Career"
      description="Define your next career move with Career Intelligence™."
      icon={Target}
    >
      {/* Registry-Driven Selections */}
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Target Company</label>
          <CompanyAutocomplete
            value={form.target_company}
            onChange={handleCompanyChange}
            placeholder="Search Microsoft, Amazon, Google..."
          />
        </div>

        <div>
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Target Role</label>
          <RoleAutocomplete
            value={form.target_role}
            onChange={v => setField("target_role", v)}
            placeholder="Search CEO, CTO, Director..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Target Country</label>
            <CountrySelect
              value={form.target_country}
              onChange={v => setField("target_country", v)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-1.5 block">Preferred Industry</label>
            <IndustryAutocomplete
              value={form.preferred_industry}
              onChange={v => setField("preferred_industry", v)}
              placeholder="Search Technology, Finance..."
            />
          </div>
        </div>

        <SalaryInput
          value={form.expected_salary}
          onChange={v => setField("expected_salary", v)}
          currency={form.salary_currency}
          onCurrencyChange={v => setField("salary_currency", v)}
          role={form.target_role}
          country={form.target_country}
          industry={form.preferred_industry}
        />

        <WorkPreferenceSelector
          value={workPrefValue}
          onChange={v => setField("work_preference", v)}
        />
      </div>

      {/* Career Intelligence Panel™ */}
      <CareerIntelligencePanel form={form} />
    </SectionCard>
  );
}