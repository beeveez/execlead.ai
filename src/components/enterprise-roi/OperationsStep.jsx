import React from "react";
import { NumberField } from "./RoiField";

export default function OperationsStep({ values, onChange }) {
  const set = (k) => (v) => onChange({ ...values, [k]: v });
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <NumberField label="Leadership Assessments Completed / Year" value={values.assessmentsPerYear} onChange={set("assessmentsPerYear")} />
      <NumberField label="Average Assessment Time (hours)" value={values.avgAssessmentTime} onChange={set("avgAssessmentTime")} />
      <NumberField label="Average Manager Review Time (minutes)" value={values.avgManagerReviewTime} onChange={set("avgManagerReviewTime")} />
      <NumberField label="Succession Reviews / Year" value={values.successionReviewsPerYear} onChange={set("successionReviewsPerYear")} />
      <NumberField label="Promotion Decisions / Year" value={values.promotionDecisionsPerYear} onChange={set("promotionDecisionsPerYear")} />
      <NumberField label="Leadership Development Programs" value={values.leadershipDevPrograms} onChange={set("leadershipDevPrograms")} />
      <NumberField label="Average Time to Assess One Leader (hours)" value={values.avgTimeToAssessOneLeader} onChange={set("avgTimeToAssessOneLeader")} />
      <NumberField label="Average Hours Spent Creating Reports" value={values.avgHoursCreatingReports} onChange={set("avgHoursCreatingReports")} />
    </div>
  );
}