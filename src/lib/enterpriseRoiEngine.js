// Enterprise Leadership ROI Calculator™ — transparent, customer-input-driven
// financial modeling engine. No unrealistic claims; every output exposes its
// formula, inputs, assumptions, and a confidence indicator.

export const DEFAULT_INPUTS = {
  organizationName: "", industry: "", country: "", employees: 0, leadershipPopulation: 0,
  managers: 0, seniorManagers: 0, directors: 0, executives: 0, annualRevenue: 0,
  leadershipDevBudget: 0, executiveCoachingBudget: 0, avgCoachingCostPerLeader: 3000,
  leadershipAssessmentBudget: 0, externalRecruitmentSpend: 0, avgExecutiveHiringCost: 50000,
  trainingBudget: 0, assessmentVendorCosts: 0, plannedExecleadInvestment: 0,
  assessmentsPerYear: 0, avgAssessmentTime: 4, avgManagerReviewTime: 60, successionReviewsPerYear: 0,
  promotionDecisionsPerYear: 0, leadershipDevPrograms: 0, avgTimeToAssessOneLeader: 8, avgHoursCreatingReports: 6,
};

export const DEFAULT_ASSUMPTIONS = {
  coachingEfficiencyImprovement: 25,
  adminTimeReduction: 40,
  assessmentThroughputIncrease: 35,
  internalPromotionImprovement: 20,
  leadershipCoverageIncrease: 30,
  reportingAutomation: 50,
  aiCoachingAdoption: 60,
  loadedLaborRate: 75,
};

export const ASSUMPTION_META = [
  { key: "coachingEfficiencyImprovement", label: "Expected Coaching Efficiency Improvement", default: 25, tooltip: "How much more coaching capacity AI-supported coaching delivers per dollar vs. today." },
  { key: "adminTimeReduction", label: "Expected Administrative Time Reduction", default: 40, tooltip: "Share of leadership-administration hours saved through automation and AI assistance." },
  { key: "assessmentThroughputIncrease", label: "Expected Assessment Throughput Increase", default: 35, tooltip: "Increase in the number of leaders assessed per year." },
  { key: "internalPromotionImprovement", label: "Expected Internal Promotion Improvement", default: 20, tooltip: "Increase in the share of openings filled by internal promotion vs. external hiring." },
  { key: "leadershipCoverageIncrease", label: "Expected Leadership Coverage Increase", default: 30, tooltip: "Additional share of the leadership population reached by development programs." },
  { key: "reportingAutomation", label: "Expected Reporting Automation", default: 50, tooltip: "Share of leadership-report creation time eliminated by automated reporting." },
  { key: "aiCoachingAdoption", label: "Expected AI Coaching Adoption", default: 60, tooltip: "Share of the leadership population that adopts AI coaching." },
  { key: "loadedLaborRate", label: "Loaded Labor Rate ($/hour)", default: 75, tooltip: "Fully-loaded hourly cost of the HR/leadership staff time saved. Used to value time savings." },
];

export const SCENARIO_PRESETS = {
  conservative: { factor: 0.6, label: "Conservative" },
  expected: { factor: 1, label: "Expected" },
  optimistic: { factor: 1.4, label: "Optimistic" },
};

function num(v) { const n = Number(v); return isNaN(n) ? 0 : n; }
function pct(a) { return Math.max(0, Math.min(100, num(a))) / 100; }

export function applyScenario(assumptions, factor) {
  const keys = ["coachingEfficiencyImprovement", "adminTimeReduction", "assessmentThroughputIncrease", "internalPromotionImprovement", "leadershipCoverageIncrease", "reportingAutomation", "aiCoachingAdoption"];
  const out = { ...assumptions };
  for (const k of keys) out[k] = Math.min(100, Math.round(num(assumptions[k]) * factor));
  return out;
}

export function calculateRoi(inputs, assumptions) {
  const i = { ...DEFAULT_INPUTS, ...inputs };
  const a = { ...DEFAULT_ASSUMPTIONS, ...assumptions };
  const L = num(i.leadershipPopulation);
  const inv = num(i.plannedExecleadInvestment);

  const assessmentsPerYear = num(i.assessmentsPerYear);
  const successionReviews = num(i.successionReviewsPerYear);
  const promotionDecisions = num(i.promotionDecisionsPerYear);

  const reviewHours = (num(i.avgManagerReviewTime) / 60) * assessmentsPerYear;
  const assessHours = num(i.avgTimeToAssessOneLeader) * assessmentsPerYear;
  const adminHours = reviewHours + assessHours;
  const adminTimeSaved = adminHours * pct(a.adminTimeReduction) * pct(a.aiCoachingAdoption);

  const reportingHours = num(i.avgHoursCreatingReports) * (assessmentsPerYear + successionReviews + promotionDecisions);
  const reportingTimeSaved = reportingHours * pct(a.reportingAutomation);
  const totalHoursSaved = adminTimeSaved + reportingTimeSaved;
  const timeValue = totalHoursSaved * num(a.loadedLaborRate);

  const costPerLeader = Math.max(num(i.avgCoachingCostPerLeader), 1);
  const currentCoachingCapacity = Math.round(num(i.executiveCoachingBudget) / costPerLeader);
  const newCoachingCapacity = Math.round(currentCoachingCapacity * (1 + pct(a.coachingEfficiencyImprovement)) + L * pct(a.aiCoachingAdoption));
  const coachingCapacityIncrease = Math.max(0, newCoachingCapacity - currentCoachingCapacity);

  const currentAssessments = assessmentsPerYear;
  const newAssessments = Math.round(assessmentsPerYear * (1 + pct(a.assessmentThroughputIncrease)));
  const assessmentThroughputIncrease = Math.max(0, newAssessments - currentAssessments);
  const perAssessmentCost = assessmentsPerYear > 0 ? (num(i.leadershipAssessmentBudget) + num(i.assessmentVendorCosts)) / assessmentsPerYear : 0;
  const assessmentValue = assessmentThroughputIncrease * perAssessmentCost;

  const coverageCurrentLeaders = Math.min(L, currentCoachingCapacity + currentAssessments);
  const coverageNewLeaders = Math.min(L, newCoachingCapacity + newAssessments + Math.round(L * pct(a.leadershipCoverageIncrease)));
  const coverageExpansionLeaders = Math.max(0, coverageNewLeaders - coverageCurrentLeaders);
  const coverageCurrentPct = L > 0 ? Math.round((coverageCurrentLeaders / L) * 100) : 0;
  const coverageNewPct = L > 0 ? Math.round((coverageNewLeaders / L) * 100) : 0;

  const hiringAvoided = Math.round(promotionDecisions * pct(a.internalPromotionImprovement));
  const hiringSavings = hiringAvoided * num(i.avgExecutiveHiringCost);
  const internalPromotionValue = hiringSavings;

  const operationalEfficiencyPct = Math.round((pct(a.adminTimeReduction) + pct(a.reportingAutomation) + pct(a.assessmentThroughputIncrease)) / 3 * 100);

  const annualGrossValue = timeValue + hiringSavings + assessmentValue;
  const annualNetValue = annualGrossValue - inv;
  const threeYearValue = annualGrossValue * 3;
  const threeYearInvestment = inv * 3;
  const threeYearROI = threeYearInvestment > 0 ? Math.round((threeYearValue - threeYearInvestment) / threeYearInvestment * 100) : null;
  const paybackMonths = inv > 0 && annualNetValue > 0 ? Math.round((inv / annualNetValue) * 12) : null;

  const keyFields = [L, inv, assessmentsPerYear, num(i.executiveCoachingBudget), num(i.avgExecutiveHiringCost), num(i.externalRecruitmentSpend)];
  const filled = keyFields.filter((v) => v > 0).length;
  let confLabel = "Low";
  if (filled >= 5) confLabel = "Medium";
  if (filled >= 6 && annualNetValue > 0) confLabel = "High";
  const confidence = { label: confLabel, score: Math.round((filled / keyFields.length) * 100) };

  const metrics = [
    { key: "annualInvestment", label: "Estimated Annual Investment", value: inv, formula: "Customer-entered planned EXECLEAD.AI investment.", inputs: { plannedExecleadInvestment: inv }, assumptions: {}, confidence },
    { key: "threeYearInvestment", label: "Estimated Three-Year Investment", value: threeYearInvestment, formula: "Annual Investment × 3 (no discounting applied).", inputs: { annualInvestment: inv }, assumptions: {}, confidence },
    { key: "adminTimeSaved", label: "Annual Administrative Time Saved", value: Math.round(adminTimeSaved), unit: "hrs", formula: "(Review hours + Assessment hours) × Admin Time Reduction × AI Coaching Adoption.", inputs: { reviewHours: Math.round(reviewHours), assessHours: Math.round(assessHours) }, assumptions: { adminTimeReduction: a.adminTimeReduction, aiCoachingAdoption: a.aiCoachingAdoption }, confidence },
    { key: "coachingCapacity", label: "Annual Coaching Capacity", value: newCoachingCapacity, unit: "leaders", formula: "Current capacity × (1 + Coaching Efficiency) + Leadership Population × AI Coaching Adoption.", inputs: { currentCoachingCapacity, leadershipPopulation: L }, assumptions: { coachingEfficiencyImprovement: a.coachingEfficiencyImprovement, aiCoachingAdoption: a.aiCoachingAdoption }, confidence },
    { key: "assessmentThroughput", label: "Assessment Throughput Increase", value: assessmentThroughputIncrease, unit: "assessments", formula: "Assessments/Year × Assessment Throughput Increase.", inputs: { assessmentsPerYear }, assumptions: { assessmentThroughputIncrease: a.assessmentThroughputIncrease }, confidence },
    { key: "coverageExpansion", label: "Leadership Coverage Expansion", value: coverageExpansionLeaders, unit: "leaders", formula: "New leaders covered − Current leaders covered.", inputs: { coverageCurrentLeaders, coverageNewLeaders }, assumptions: { leadershipCoverageIncrease: a.leadershipCoverageIncrease }, confidence },
    { key: "reportingTime", label: "Reporting Time Reduction", value: Math.round(reportingTimeSaved), unit: "hrs", formula: "Reporting hours × Reporting Automation.", inputs: { reportingHours: Math.round(reportingHours) }, assumptions: { reportingAutomation: a.reportingAutomation }, confidence },
    { key: "hiringSavings", label: "Executive Hiring Savings", value: hiringSavings, formula: "Promotion Decisions × Internal Promotion Improvement × Avg Executive Hiring Cost.", inputs: { promotionDecisions, avgExecutiveHiringCost: num(i.avgExecutiveHiringCost) }, assumptions: { internalPromotionImprovement: a.internalPromotionImprovement }, confidence },
    { key: "internalPromotionValue", label: "Internal Promotion Value", value: internalPromotionValue, formula: "Internal hires avoided × Avg Executive Hiring Cost (value of internal mobility).", inputs: { hiringAvoided }, assumptions: { internalPromotionImprovement: a.internalPromotionImprovement }, confidence },
    { key: "operationalEfficiency", label: "Operational Efficiency", value: operationalEfficiencyPct, unit: "%", formula: "Average of Admin Time Reduction, Reporting Automation, and Assessment Throughput Increase.", inputs: {}, assumptions: { adminTimeReduction: a.adminTimeReduction, reportingAutomation: a.reportingAutomation, assessmentThroughputIncrease: a.assessmentThroughputIncrease }, confidence },
    { key: "annualNetValue", label: "Estimated Net Business Impact", value: Math.round(annualNetValue), formula: "(Time Value + Hiring Savings + Assessment Value) − Annual Investment.", inputs: { timeValue: Math.round(timeValue), hiringSavings, assessmentValue: Math.round(assessmentValue), annualInvestment: inv }, assumptions: {}, confidence },
    { key: "threeYearROI", label: "Estimated Three-Year ROI", value: threeYearROI, unit: "%", formula: "(Three-Year Value − Three-Year Investment) ÷ Three-Year Investment.", inputs: { threeYearValue: Math.round(threeYearValue), threeYearInvestment }, assumptions: {}, confidence },
  ];

  return {
    annualInvestment: inv, threeYearInvestment, adminTimeSavedHours: Math.round(adminTimeSaved),
    reportingTimeSavedHours: Math.round(reportingTimeSaved), totalHoursSaved: Math.round(totalHoursSaved),
    adminTimeValue: Math.round(timeValue), currentCoachingCapacity, newCoachingCapacity, coachingCapacityIncrease,
    currentAssessments, newAssessments, assessmentThroughputIncrease, assessmentValue: Math.round(assessmentValue),
    coverageCurrentLeaders, coverageNewLeaders, coverageExpansionLeaders, coverageCurrentPct, coverageNewPct,
    reportingTimeReductionHours: Math.round(reportingTimeSaved), hiringAvoided, hiringSavings, internalPromotionValue,
    operationalEfficiencyPct, annualGrossValue: Math.round(annualGrossValue), annualNetValue: Math.round(annualNetValue),
    threeYearValue: Math.round(threeYearValue), threeYearROI, paybackMonths, confidence, metrics,
  };
}

export const fmtCurrency = (n) => (n == null ? "—" : `$${Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`);
export const fmtNum = (n) => (n == null ? "—" : Number(n).toLocaleString("en-US"));
export const fmtPct = (n) => (n == null ? "—" : `${n}%`);