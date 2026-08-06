import React from "react";
import { NumberField } from "./RoiField";

export default function OperationsStep({ values, onChange }) {
  const set = (k) => (v) => onChange({ ...values, [k]: v });
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <NumberField label="Leadership Assessments Per Year" value={values.assessmentsPerYear} onChange={set("assessmentsPerYear")} />
      <NumberField label="Average Assessment Time (hours)" value={values.avgAssessmentTime} onChange={set("avgAssessmentTime")} />
      <NumberField label="Average Report Preparation Time (hours)" value={values.avgReportPrepTime} onChange={set("avgReportPrepTime")} />
      <NumberField label="Leadership Review Meetings" value={values.leadershipReviewMeetings} onChange={set("leadershipReviewMeetings")} />
      <NumberField label="Succession Reviews" value={values.successionReviews} onChange={set("successionReviews")} />
      <NumberField label="Promotion Decisions" value={values.promotionDecisions} onChange={set("promotionDecisions")} />
      <NumberField label="Leadership Programs" value={values.leadershipPrograms} onChange={set("leadershipPrograms")} />
      <NumberField label="Average Hours Per Assessment" value={values.avgHoursPerAssessment} onChange={set("avgHoursPerAssessment")} />
      <NumberField label="Average HR Reporting Hours" value={values.avgHrReportingHours} onChange={set("avgHrReportingHours")} />
      <NumberField label="Current Coaching Coverage %" value={values.currentCoachingCoveragePct} onChange={set("currentCoachingCoveragePct")} tooltip="Share of leadership population currently reached by coaching." />
      <NumberField label="Internal Promotion %" value={values.internalPromotionPct} onChange={set("internalPromotionPct")} tooltip="Share of openings currently filled internally." />
      <NumberField label="External Executive Hiring %" value={values.externalExecutiveHiringPct} onChange={set("externalExecutiveHiringPct")} tooltip="Share of openings currently filled via external executive hiring." />
    </div>
  );
}