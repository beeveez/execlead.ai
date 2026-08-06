// Enterprise Metrics™ — pure calculation engine. No UI coupling. Every metric
// exposes formula, inputs, assumptions, a calculation lineage chain, source
// type, and confidence. Backward-compatible `calculateRoi` name retained.

export const DEFAULT_INPUTS = {
  organizationName: "", industry: "", country: "", employees: 0, leadershipPopulation: 0,
  managers: 0, seniorManagers: 0, directors: 0, vicePresidents: 0, executives: 0,
  annualRevenue: 0, annualPayroll: 0,
  leadershipDevBudget: 0, executiveCoachingBudget: 0, avgCoachingCost: 3000,
  leadershipAssessmentBudget: 0, assessmentVendorCosts: 0, trainingBudget: 0,
  learningPlatformCosts: 0, leadershipConsultingSpend: 0, executiveRecruitmentBudget: 0,
  avgExecutiveHiringCost: 50000, estimatedAnnualPlatformInvestment: 0,
  assessmentsPerYear: 0, avgAssessmentTime: 4, avgReportPrepTime: 6, leadershipReviewMeetings: 0,
  successionReviews: 0, promotionDecisions: 0, leadershipPrograms: 0, avgHoursPerAssessment: 8,
  avgHrReportingHours: 4, currentCoachingCoveragePct: 20, internalPromotionPct: 50, externalExecutiveHiringPct: 50,
};

export const DEFAULT_ASSUMPTIONS = {
  adminTimeReduction: 40, reportingAutomation: 50, assessmentThroughputIncrease: 35,
  leadershipCoverageGrowth: 30, aiCoachingAdoption: 60, internalPromotionImprovement: 20,
  executiveHiringReduction: 15, assessmentStandardization: 25, managerProductivityImprovement: 20,
  hrProductivityImprovement: 30, loadedLaborRate: 75,
};

export const ASSUMPTION_META = [
  { key: "adminTimeReduction", label: "Administrative Time Reduction", default: 40, unit: "%", tooltip: "Share of leadership-administration hours saved through automation and AI assistance." },
  { key: "reportingAutomation", label: "Reporting Automation", default: 50, unit: "%", tooltip: "Share of leadership-report preparation time eliminated by automated reporting." },
  { key: "assessmentThroughputIncrease", label: "Assessment Throughput Increase", default: 35, unit: "%", tooltip: "Increase in the number of leaders assessed per year." },
  { key: "leadershipCoverageGrowth", label: "Leadership Coverage Growth", default: 30, unit: "%", tooltip: "Additional share of the leadership population reached by development programs." },
  { key: "aiCoachingAdoption", label: "AI Coaching Adoption", default: 60, unit: "%", tooltip: "Share of the leadership population that adopts AI coaching." },
  { key: "internalPromotionImprovement", label: "Internal Promotion Improvement", default: 20, unit: "%", tooltip: "Increase in the share of openings filled by internal promotion vs. external hiring." },
  { key: "executiveHiringReduction", label: "Executive Hiring Reduction", default: 15, unit: "%", tooltip: "Reduction in external executive hires through stronger internal succession." },
  { key: "assessmentStandardization", label: "Assessment Standardization", default: 25, unit: "%", tooltip: "Share of assessment vendor spend reduced through standardized in-platform assessments." },
  { key: "managerProductivityImprovement", label: "Manager Productivity Improvement", default: 20, unit: "%", tooltip: "Productivity gain in manager time spent on leadership reviews and assessments." },
  { key: "hrProductivityImprovement", label: "HR Productivity Improvement", default: 30, unit: "%", tooltip: "Productivity gain in HR reporting and coordination hours." },
  { key: "loadedLaborRate", label: "Loaded Labor Rate ($/hour)", default: 75, unit: "$", tooltip: "Fully-loaded hourly cost of HR/leadership staff time saved. Used to value time savings." },
];

export const DEMO_INPUTS = {
  ...DEFAULT_INPUTS,
  organizationName: "Acme Corporation", industry: "Technology", country: "United States",
  employees: 5000, leadershipPopulation: 400, managers: 200, seniorManagers: 100, directors: 60, vicePresidents: 25, executives: 15,
  annualRevenue: 750000000, annualPayroll: 400000000,
  leadershipDevBudget: 800000, executiveCoachingBudget: 600000, avgCoachingCost: 4000,
  leadershipAssessmentBudget: 250000, assessmentVendorCosts: 150000, trainingBudget: 1200000,
  learningPlatformCosts: 200000, leadershipConsultingSpend: 300000, executiveRecruitmentBudget: 1000000,
  avgExecutiveHiringCost: 75000, estimatedAnnualPlatformInvestment: 300000,
  assessmentsPerYear: 200, avgAssessmentTime: 4, avgReportPrepTime: 6, leadershipReviewMeetings: 40,
  successionReviews: 30, promotionDecisions: 80, leadershipPrograms: 12, avgHoursPerAssessment: 8,
  avgHrReportingHours: 5, currentCoachingCoveragePct: 20, internalPromotionPct: 50, externalExecutiveHiringPct: 50,
};

function num(v) { const n = Number(v); return isNaN(n) ? 0 : n; }
function pct(a) { return Math.max(0, Math.min(100, num(a))) / 100; }

export function assumptionConfidence(value, def) {
  const r = def > 0 ? num(value) / def : 1;
  if (r >= 0.5 && r <= 1.5) return "High";
  if (r >= 0.25 && r <= 2) return "Medium";
  return "Low";
}

const L = (label, value) => ({ label, value });

export function calculateRoi(inputs, assumptions) {
  const i = { ...DEFAULT_INPUTS, ...inputs };
  const a = { ...DEFAULT_ASSUMPTIONS, ...assumptions };
  const Lpop = num(i.leadershipPopulation);
  const inv = num(i.estimatedAnnualPlatformInvestment);
  const assessmentsPerYear = num(i.assessmentsPerYear);
  const successionReviews = num(i.successionReviews);
  const promotionDecisions = num(i.promotionDecisions);
  const reviewMeetings = num(i.leadershipReviewMeetings);

  const assessmentHours = (num(i.avgAssessmentTime) + num(i.avgHoursPerAssessment)) * assessmentsPerYear;
  const reportHours = num(i.avgReportPrepTime) * (assessmentsPerYear + successionReviews + promotionDecisions);
  const hrHours = num(i.avgHrReportingHours) * reviewMeetings;
  const adminHoursSaved = assessmentHours * pct(a.adminTimeReduction) * pct(a.managerProductivityImprovement);
  const reportingHoursSaved = reportHours * pct(a.reportingAutomation) + hrHours * pct(a.hrProductivityImprovement);
  const totalHoursSaved = adminHoursSaved + reportingHoursSaved;
  const operationalProductivityValue = totalHoursSaved * num(a.loadedLaborRate);

  const costPerLeader = Math.max(num(i.avgCoachingCost), 1);
  const currentCoachingCapacity = Math.round(num(i.executiveCoachingBudget) / costPerLeader);
  const aiCoachingCapacity = Math.round(Lpop * pct(a.aiCoachingAdoption));
  const newCoachingCapacity = currentCoachingCapacity + aiCoachingCapacity;

  const currentCoachingCoveragePct = Math.min(100, num(i.currentCoachingCoveragePct));
  const newCoveragePct = Math.min(100, currentCoachingCoveragePct + num(a.leadershipCoverageGrowth));
  const coverageCurrentLeaders = Math.round(Lpop * pct(currentCoachingCoveragePct));
  const coverageNewLeaders = Math.round(Lpop * pct(newCoveragePct));
  const leadershipCoverageIncrease = Math.max(0, coverageNewLeaders - coverageCurrentLeaders);

  const currentAssessments = assessmentsPerYear;
  const newAssessments = Math.round(assessmentsPerYear * (1 + pct(a.assessmentThroughputIncrease)));
  const assessmentCapacityIncrease = Math.max(0, newAssessments - currentAssessments);
  const perAssessmentCost = assessmentsPerYear > 0 ? (num(i.leadershipAssessmentBudget) + num(i.assessmentVendorCosts)) / assessmentsPerYear : 0;
  const assessmentStandardizationValue = (num(i.leadershipAssessmentBudget) + num(i.assessmentVendorCosts)) * pct(a.assessmentStandardization);
  const assessmentValue = assessmentCapacityIncrease * perAssessmentCost + assessmentStandardizationValue;

  const baselineExternalHires = Math.round(promotionDecisions * pct(i.externalExecutiveHiringPct));
  const executiveHiringReduction = Math.round(baselineExternalHires * pct(a.executiveHiringReduction));
  const executiveHiringSavings = executiveHiringReduction * num(i.avgExecutiveHiringCost);
  const internalPromotionOpportunity = Math.round(promotionDecisions * pct(a.internalPromotionImprovement));
  const leadershipDevelopmentEfficiency = Math.round((pct(a.managerProductivityImprovement) + pct(a.hrProductivityImprovement) + pct(a.assessmentStandardization)) / 3 * 100);

  const annualGrossValue = operationalProductivityValue + executiveHiringSavings + assessmentValue;
  const annualNetValue = annualGrossValue - inv;
  const threeYearValue = annualGrossValue * 3;
  const threeYearInvestment = inv * 3;
  const threeYearROI = threeYearInvestment > 0 ? Math.round((threeYearValue - threeYearInvestment) / threeYearInvestment * 100) : null;
  const paybackPeriod = inv > 0 && annualNetValue > 0 ? Math.round((inv / annualNetValue) * 12) : null;

  const keyFields = [Lpop, inv, assessmentsPerYear, num(i.executiveCoachingBudget), num(i.avgExecutiveHiringCost), num(i.executiveRecruitmentBudget)];
  const filled = keyFields.filter((v) => v > 0).length;
  let confLabel = "Low";
  if (filled >= 5) confLabel = "Medium";
  if (filled >= 6 && annualNetValue > 0) confLabel = "High";
  const confidence = { label: confLabel, score: Math.round((filled / keyFields.length) * 100) };

  const metrics = [
    { key: "annualPlatformInvestment", label: "Estimated Annual Platform Investment", value: inv, source: "Customer Input",
      formula: "Customer-entered estimated annual EXECLEAD.AI investment.", inputs: { estimatedAnnualPlatformInvestment: inv }, assumptions: {}, confidence,
      lineage: [L("Customer Input", "Estimated Annual Platform Investment"), L("Value", fmtCurrency(inv))] },
    { key: "threeYearInvestment", label: "Three-Year Investment", value: threeYearInvestment, source: "Derived",
      formula: "Annual Platform Investment × 3 (no discounting).", inputs: { annualInvestment: inv }, assumptions: {}, confidence,
      lineage: [L("Annual Investment", fmtCurrency(inv)), L("× 3 years", "no discounting"), L("Three-Year Investment", fmtCurrency(threeYearInvestment))] },
    { key: "adminHoursSaved", label: "Administrative Hours Saved", value: Math.round(adminHoursSaved), unit: "hrs", source: "Assumption-Based",
      formula: "Assessment hours × Admin Time Reduction × Manager Productivity Improvement.", inputs: { assessmentHours: Math.round(assessmentHours) }, assumptions: { adminTimeReduction: a.adminTimeReduction, managerProductivityImprovement: a.managerProductivityImprovement }, confidence,
      lineage: [L("Leadership Assessments/Year", assessmentsPerYear), L("Avg Assessment Time + Hours/Assessment", `${num(i.avgAssessmentTime)} + ${num(i.avgHoursPerAssessment)}`), L("Assessment Hours", `${Math.round(assessmentHours)} hrs`), L("Admin Time Reduction", `${a.adminTimeReduction}%`), L("Manager Productivity", `${a.managerProductivityImprovement}%`), L("Administrative Hours Saved", `${Math.round(adminHoursSaved)} hrs`)] },
    { key: "reportingHoursSaved", label: "Reporting Hours Saved", value: Math.round(reportingHoursSaved), unit: "hrs", source: "Assumption-Based",
      formula: "Report hours × Reporting Automation + HR hours × HR Productivity Improvement.", inputs: { reportHours: Math.round(reportHours), hrHours: Math.round(hrHours) }, assumptions: { reportingAutomation: a.reportingAutomation, hrProductivityImprovement: a.hrProductivityImprovement }, confidence,
      lineage: [L("Report Prep Hours", `${Math.round(reportHours)} hrs`), L("Reporting Automation", `${a.reportingAutomation}%`), L("HR Hours", `${Math.round(hrHours)} hrs`), L("HR Productivity", `${a.hrProductivityImprovement}%`), L("Reporting Hours Saved", `${Math.round(reportingHoursSaved)} hrs`)] },
    { key: "assessmentCapacityIncrease", label: "Assessment Capacity Increase", value: assessmentCapacityIncrease, source: "Assumption-Based",
      formula: "Assessments/Year × Assessment Throughput Increase.", inputs: { assessmentsPerYear }, assumptions: { assessmentThroughputIncrease: a.assessmentThroughputIncrease }, confidence,
      lineage: [L("Assessments/Year", assessmentsPerYear), L("Throughput Increase", `${a.assessmentThroughputIncrease}%`), L("Assessment Capacity Increase", assessmentCapacityIncrease)] },
    { key: "leadershipCoverageIncrease", label: "Leadership Coverage Increase", value: leadershipCoverageIncrease, unit: "leaders", source: "Assumption-Based",
      formula: "New covered leaders − Current covered leaders (based on Coverage Growth).", inputs: { coverageCurrentLeaders, coverageNewLeaders }, assumptions: { leadershipCoverageGrowth: a.leadershipCoverageGrowth }, confidence,
      lineage: [L("Leadership Population", Lpop), L("Current Coverage", `${currentCoachingCoveragePct}%`), L("Coverage Growth", `${a.leadershipCoverageGrowth}%`), L("New Coverage", `${newCoveragePct}%`), L("Coverage Increase", `${leadershipCoverageIncrease} leaders`)] },
    { key: "aiCoachingCapacity", label: "AI Coaching Capacity", value: aiCoachingCapacity, unit: "leaders", source: "Assumption-Based",
      formula: "Leadership Population × AI Coaching Adoption.", inputs: { leadershipPopulation: Lpop }, assumptions: { aiCoachingAdoption: a.aiCoachingAdoption }, confidence,
      lineage: [L("Leadership Population", Lpop), L("AI Coaching Adoption", `${a.aiCoachingAdoption}%`), L("AI Coaching Capacity", `${aiCoachingCapacity} leaders`)] },
    { key: "executiveHiringSavings", label: "Executive Hiring Savings", value: executiveHiringSavings, source: "Assumption-Based",
      formula: "External hires × Executive Hiring Reduction × Avg Executive Hiring Cost.", inputs: { baselineExternalHires, avgExecutiveHiringCost: num(i.avgExecutiveHiringCost) }, assumptions: { executiveHiringReduction: a.executiveHiringReduction }, confidence,
      lineage: [L("Promotion Decisions", promotionDecisions), L("External Hiring %", `${num(i.externalExecutiveHiringPct)}%`), L("External Hires", baselineExternalHires), L("Hiring Reduction", `${a.executiveHiringReduction}%`), L("Avoided Hires", executiveHiringReduction), L("Avg Hiring Cost", fmtCurrency(num(i.avgExecutiveHiringCost))), L("Hiring Savings", fmtCurrency(executiveHiringSavings))] },
    { key: "leadershipDevelopmentEfficiency", label: "Leadership Development Efficiency", value: leadershipDevelopmentEfficiency, unit: "%", source: "Derived",
      formula: "Average of Manager Productivity, HR Productivity, and Assessment Standardization.", inputs: {}, assumptions: { managerProductivityImprovement: a.managerProductivityImprovement, hrProductivityImprovement: a.hrProductivityImprovement, assessmentStandardization: a.assessmentStandardization }, confidence,
      lineage: [L("Manager Productivity", `${a.managerProductivityImprovement}%`), L("HR Productivity", `${a.hrProductivityImprovement}%`), L("Assessment Standardization", `${a.assessmentStandardization}%`), L("Efficiency", `${leadershipDevelopmentEfficiency}%`)] },
    { key: "internalPromotionOpportunity", label: "Internal Promotion Opportunity", value: internalPromotionOpportunity, unit: "leaders", source: "Assumption-Based",
      formula: "Promotion Decisions × Internal Promotion Improvement.", inputs: { promotionDecisions }, assumptions: { internalPromotionImprovement: a.internalPromotionImprovement }, confidence,
      lineage: [L("Promotion Decisions", promotionDecisions), L("Internal Promotion Improvement", `${a.internalPromotionImprovement}%`), L("Internal Promotion Opportunity", `${internalPromotionOpportunity} leaders`)] },
    { key: "operationalProductivityValue", label: "Operational Productivity Value", value: Math.round(operationalProductivityValue), source: "Derived",
      formula: "(Admin Hours Saved + Reporting Hours Saved) × Loaded Labor Rate.", inputs: { totalHoursSaved: Math.round(totalHoursSaved) }, assumptions: { loadedLaborRate: a.loadedLaborRate }, confidence,
      lineage: [L("Admin Hours Saved", `${Math.round(adminHoursSaved)} hrs`), L("Reporting Hours Saved", `${Math.round(reportingHoursSaved)} hrs`), L("Total Hours Saved", `${Math.round(totalHoursSaved)} hrs`), L("Loaded Labor Rate", `${fmtCurrency(a.loadedLaborRate)}/hr`), L("Productivity Value", fmtCurrency(operationalProductivityValue))] },
    { key: "netBusinessImpact", label: "Estimated Net Business Impact", value: Math.round(annualNetValue), source: "Derived",
      formula: "(Operational Productivity Value + Hiring Savings + Assessment Value) − Annual Platform Investment.", inputs: { operationalProductivityValue: Math.round(operationalProductivityValue), executiveHiringSavings, assessmentValue: Math.round(assessmentValue), annualInvestment: inv }, assumptions: {}, confidence,
      lineage: [L("Productivity Value", fmtCurrency(operationalProductivityValue)), L("Hiring Savings", fmtCurrency(executiveHiringSavings)), L("Assessment Value", fmtCurrency(assessmentValue)), L("Gross Value", fmtCurrency(annualGrossValue)), L("Annual Investment", fmtCurrency(inv)), L("Net Business Impact", fmtCurrency(annualNetValue))] },
    { key: "threeYearROI", label: "Estimated Three-Year ROI", value: threeYearROI, unit: "%", source: "Derived",
      formula: "(Three-Year Value − Three-Year Investment) ÷ Three-Year Investment.", inputs: { threeYearValue: Math.round(threeYearValue), threeYearInvestment }, assumptions: {}, confidence,
      lineage: [L("Annual Gross Value", fmtCurrency(annualGrossValue)), L("× 3", fmtCurrency(threeYearValue)), L("Three-Year Investment", fmtCurrency(threeYearInvestment)), L("ROI", fmtPct(threeYearROI))] },
    { key: "paybackPeriod", label: "Estimated Payback Period", value: paybackPeriod, unit: "months", source: "Derived",
      formula: "Annual Investment ÷ Annual Net Value × 12.", inputs: { annualInvestment: inv, annualNetValue: Math.round(annualNetValue) }, assumptions: {}, confidence,
      lineage: [L("Annual Investment", fmtCurrency(inv)), L("Annual Net Value", fmtCurrency(annualNetValue)), L("Payback", paybackPeriod ? `${paybackPeriod} months` : "—")] },
  ];

  return {
    annualPlatformInvestment: inv, threeYearInvestment,
    adminHoursSaved: Math.round(adminHoursSaved), reportingHoursSaved: Math.round(reportingHoursSaved),
    totalHoursSaved: Math.round(totalHoursSaved), operationalProductivityValue: Math.round(operationalProductivityValue),
    currentCoachingCapacity, aiCoachingCapacity, newCoachingCapacity,
    currentCoachingCoveragePct, newCoveragePct, coverageCurrentLeaders, coverageNewLeaders, leadershipCoverageIncrease,
    currentAssessments, newAssessments, assessmentCapacityIncrease, assessmentValue: Math.round(assessmentValue),
    baselineExternalHires, executiveHiringReduction, executiveHiringSavings, internalPromotionOpportunity,
    leadershipDevelopmentEfficiency, annualGrossValue: Math.round(annualGrossValue), annualNetValue: Math.round(annualNetValue),
    threeYearValue: Math.round(threeYearValue), threeYearROI, paybackPeriod, confidence, metrics,
  };
}

export const fmtCurrency = (n) => (n == null ? "—" : `$${Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`);
export const fmtNum = (n) => (n == null ? "—" : Number(n).toLocaleString("en-US"));
export const fmtPct = (n) => (n == null ? "—" : `${n}%`);