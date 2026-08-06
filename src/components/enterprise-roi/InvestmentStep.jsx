import React from "react";
import { NumberField } from "./RoiField";

export default function InvestmentStep({ values, onChange }) {
  const set = (k) => (v) => onChange({ ...values, [k]: v });
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <NumberField label="Annual Leadership Development Budget" prefix="$" value={values.leadershipDevBudget} onChange={set("leadershipDevBudget")} />
      <NumberField label="Annual Executive Coaching Budget" prefix="$" value={values.executiveCoachingBudget} onChange={set("executiveCoachingBudget")} />
      <NumberField label="Average Coaching Cost per Leader" prefix="$" value={values.avgCoachingCostPerLeader} onChange={set("avgCoachingCostPerLeader")} />
      <NumberField label="Annual Leadership Assessment Budget" prefix="$" value={values.leadershipAssessmentBudget} onChange={set("leadershipAssessmentBudget")} />
      <NumberField label="Annual External Executive Recruitment Spend" prefix="$" value={values.externalRecruitmentSpend} onChange={set("externalRecruitmentSpend")} />
      <NumberField label="Average Executive Hiring Cost" prefix="$" value={values.avgExecutiveHiringCost} onChange={set("avgExecutiveHiringCost")} />
      <NumberField label="Annual Training Budget" prefix="$" value={values.trainingBudget} onChange={set("trainingBudget")} />
      <NumberField label="Assessment Vendor Costs" prefix="$" value={values.assessmentVendorCosts} onChange={set("assessmentVendorCosts")} />
      <NumberField label="Planned Annual EXECLEAD.AI Investment" prefix="$" value={values.plannedExecleadInvestment} onChange={set("plannedExecleadInvestment")} tooltip="Your estimated annual investment in EXECLEAD.AI. Used as the basis for net impact and ROI. Customer-defined." />
    </div>
  );
}