import React from "react";
import { NumberField, TextField } from "./RoiField";

export default function OrgProfileStep({ values, onChange }) {
  const set = (k) => (v) => onChange({ ...values, [k]: v });
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <TextField label="Organization Name" value={values.organizationName} onChange={set("organizationName")} placeholder="Acme Corporation" />
      <TextField label="Industry" value={values.industry} onChange={set("industry")} placeholder="Technology" />
      <TextField label="Country" value={values.country} onChange={set("country")} placeholder="United States" />
      <NumberField label="Employees" value={values.employees} onChange={set("employees")} tooltip="Total organization headcount." />
      <NumberField label="Leadership Population" value={values.leadershipPopulation} onChange={set("leadershipPopulation")} tooltip="Total leaders across all levels — denominator for coverage." />
      <NumberField label="Managers" value={values.managers} onChange={set("managers")} />
      <NumberField label="Senior Managers" value={values.seniorManagers} onChange={set("seniorManagers")} />
      <NumberField label="Directors" value={values.directors} onChange={set("directors")} />
      <NumberField label="Vice Presidents" value={values.vicePresidents} onChange={set("vicePresidents")} />
      <NumberField label="Executives" value={values.executives} onChange={set("executives")} />
      <NumberField label="Annual Revenue (Optional)" prefix="$" value={values.annualRevenue} onChange={set("annualRevenue")} />
      <NumberField label="Annual Payroll (Optional)" prefix="$" value={values.annualPayroll} onChange={set("annualPayroll")} />
    </div>
  );
}