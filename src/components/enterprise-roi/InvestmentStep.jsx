import React from "react";
import { NumberField } from "./RoiField";

export default function InvestmentStep({ values, onChange }) {
  const set = (k) => (v) => onChange({ ...values, [k]: v });
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <NumberField label="Annual Leadership Development Budget" prefix="$" value={values.leadershipDevBudget} onChange={set("leadershipDevBudget")} />
      <NumberField label="Executive Coaching Budget" prefix="$" value={values.executiveCoachingBudget} onChange={set("executiveCoachingBudget")} />
      <NumberField label="Average Coaching Cost per Leader" prefix="$" value={values.avgCoachingCost} onChange={set("avgCoachingCost")} />
      <NumberField label="Executive Assessment Budget" prefix="$" value={values.leadershipAssessmentBudget} onChange={set("leadershipAssessmentBudget")} />
      <NumberField label="Assessment Vendor Costs" prefix="$" value={values.assessmentVendorCosts} onChange={set("assessmentVendorCosts")} />
      <NumberField label="Training Budget" prefix="$" value={values.trainingBudget} onChange={set("trainingBudget")} />
      <NumberField label="Learning Platform Costs" prefix="$" value={values.learningPlatformCosts} onChange={set("learningPlatformCosts")} />
      <NumberField label="Leadership Consulting Spend" prefix="$" value={values.leadershipConsultingSpend} onChange={set("leadershipConsultingSpend")} />
      <NumberField label="Executive Recruitment Budget" prefix="$" value={values.executiveRecruitmentBudget} onChange={set("executiveRecruitmentBudget")} />
      <NumberField label="Average Executive Hiring Cost" prefix="$" value={values.avgExecutiveHiringCost} onChange={set("avgExecutiveHiringCost")} />
      <NumberField label="Estimated Annual Platform Investment" prefix="$" value={values.estimatedAnnualPlatformInvestment} onChange={set("estimatedAnnualPlatformInvestment")} tooltip="Your estimated annual investment in EXECLEAD.AI. Customer-defined; basis for net impact and payback." />
    </div>
  );
}