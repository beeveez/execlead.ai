// Enterprise Business Case™ — procurement package, executive presentation,
// commercial recommendation, dashboard summaries, and API-ready impact sections.
import { GA_ENTERPRISE_TIERS, SIMULATION_CREDIT_PROGRAM } from "../enterpriseCommercialArchitecture";
import { fmtCurrency, fmtPct, fmtNum } from "./enterpriseMetrics";

export function buildCommercialRecommendation(roi, inputs) {
  const L = Number(inputs.leadershipPopulation) || 0;
  const inv = roi.annualPlatformInvestment;
  let tierId = "executive_launchpad";
  if (L >= 1000 || inv >= 500000) tierId = "strategic_enterprise";
  else if (L >= 200 || inv >= 100000) tierId = "enterprise_leadership_os";
  const tier = GA_ENTERPRISE_TIERS.find((t) => t.id === tierId) || GA_ENTERPRISE_TIERS[0];
  const reasoning = [
    L < 200 ? "Leadership population fits a focused Launchpad deployment." : "Leadership population warrants enterprise-wide coverage.",
    roi.currentCoachingCoveragePct < 30 ? "Current coaching coverage is limited — significant expansion opportunity." : "Coaching coverage is established; focus shifts to depth and readiness.",
    roi.executiveHiringSavings > 0 ? "Internal succession can reduce external executive hiring spend." : "",
    roi.annualNetValue > 0 ? `Estimated positive net business impact of ${fmtCurrency(roi.annualNetValue)} supports investment.` : "Investment scale should be validated against expected value.",
  ].filter(Boolean);
  return {
    tierId,
    tierName: tier.name,
    target: tier.target,
    recommendedLicense: tier.name,
    estimatedARR: inv,
    expansionOpportunity: `${SIMULATION_CREDIT_PROGRAM.bundles.length} expansion credit bundles (25 / 50 / 100 credits)`,
    upsellPotential: "Executive Simulation Credits™ · Enterprise Academy™ · Custom Executive Simulations™",
    simulationCredits: SIMULATION_CREDIT_PROGRAM.annualAllocationPerAccount,
    recommendedImplementation: "4-week pilot cohort → 12-week phased rollout → quarterly readiness review",
    reasoning,
  };
}

export function buildExecutiveRecommendation(roi, recommendation) {
  if (roi.annualNetValue <= 0) return "Reassess investment scale or assumptions — current inputs do not project a positive net business impact.";
  return `Proceed with a ${recommendation.tierName} deployment. Estimated ${fmtCurrency(roi.annualGrossValue)} annual value against ${fmtCurrency(roi.annualPlatformInvestment)} investment, ${fmtPct(roi.threeYearROI)} three-year ROI, and ~${roi.paybackPeriod || "—"} month payback. Confidence: ${roi.confidence.label}.`;
}

export function buildExecutiveSummary(inputs, roi, recommendation) {
  return {
    headline: `${inputs.organizationName || "Your organization"} — Enterprise Leadership ROI Assessment`,
    narrative: `Deploying EXECLEAD.AI across ${fmtNum(inputs.leadershipPopulation)} leaders is estimated to produce ${fmtCurrency(roi.annualGrossValue)} in annual value and ${fmtCurrency(roi.threeYearValue)} over three years, with a ${fmtPct(roi.threeYearROI)} ROI and ~${roi.paybackPeriod || "—"} month payback. Recommended license: ${recommendation.tierName}.`,
    expectedROI: fmtPct(roi.threeYearROI),
    payback: roi.paybackPeriod ? `${roi.paybackPeriod} months` : "—",
    confidence: roi.confidence.label,
  };
}

export function buildFinancialImpact(roi) {
  return {
    annualValue: roi.annualGrossValue,
    annualInvestment: roi.annualPlatformInvestment,
    netBusinessImpact: roi.annualNetValue,
    threeYearValue: roi.threeYearValue,
    threeYearInvestment: roi.threeYearInvestment,
    threeYearROI: roi.threeYearROI,
    paybackMonths: roi.paybackPeriod,
  };
}

export function buildOperationalImpact(roi) {
  return {
    adminHoursSaved: roi.adminHoursSaved,
    reportingHoursSaved: roi.reportingHoursSaved,
    totalHoursSaved: roi.totalHoursSaved,
    assessmentCapacityIncrease: roi.assessmentCapacityIncrease,
    leadershipDevelopmentEfficiency: roi.leadershipDevelopmentEfficiency,
    operationalProductivityValue: roi.operationalProductivityValue,
  };
}

export function buildLeadershipImpact(roi, inputs) {
  return {
    coverage: { from: roi.currentCoachingCoveragePct, to: roi.newCoveragePct, increase: roi.leadershipCoverageIncrease },
    promotion: { internalOpportunity: roi.internalPromotionOpportunity, hiringSavings: roi.executiveHiringSavings },
    succession: { successionReviews: Number(inputs.successionReviews) || 0, hiringAvoided: roi.executiveHiringReduction },
    readiness: { assessments: roi.newAssessments, capacity: roi.assessmentCapacityIncrease },
    assessmentCapacity: roi.assessmentCapacityIncrease,
    coachingCapacity: { current: roi.currentCoachingCapacity, ai: roi.aiCoachingCapacity, total: roi.newCoachingCapacity },
  };
}

export function buildProcurementPackage(inputs, assumptions, roi, recommendation) {
  return {
    executiveSummary: {
      problem: "Leadership development is fragmented across coaching, assessments, and manual reporting — limiting scalability and visibility.",
      solution: "EXECLEAD.AI unifies executive readiness, coaching, assessments, simulations, and succession in one AI-powered operating system.",
      expectedROI: fmtPct(roi.threeYearROI),
      recommendation: buildExecutiveRecommendation(roi, recommendation),
    },
    commercial: {
      annualInvestment: fmtCurrency(roi.annualPlatformInvestment),
      threeYearInvestment: fmtCurrency(roi.threeYearInvestment),
      commercialAssumptions: "Value-based pricing aligned to leadership population and enterprise requirements. Customer-defined investment.",
      licenseModel: recommendation.recommendedLicense,
    },
    security: {
      trustCenter: "Trust Center™ — security, privacy, and compliance documentation",
      aiGovernance: "AI Governance Center — model routing, policy, and audit",
      dataPrivacy: "Data Privacy — encryption, data protection, retention controls",
      sso: "SSO / SCIM — enterprise identity provisioning",
      compliance: "Compliance posture documented in Trust Center (certifications roadmap)",
      vendorDueDiligence: "Vendor Due Diligence package available on request",
    },
    implementation: {
      timeline: "4-week pilot → 12-week rollout → quarterly review",
      pilot: "Cohort of 25–50 leaders; measure readiness lift and engagement",
      rollout: "Phased deployment across business units with manager dashboards",
      milestones: "Readiness baseline → +10% coverage → succession plans for critical roles",
      training: "Executive briefings, HR admin training, manager enablement",
    },
    executiveSuccessMetrics: {
      leadershipReadiness: "Executive Readiness™ improvement across cohort",
      assessmentThroughput: `${roi.assessmentCapacityIncrease} additional assessments/year`,
      promotionReadiness: `${roi.internalPromotionOpportunity} internal promotion opportunities`,
      successionHealth: `${roi.executiveHiringReduction} external hires avoided`,
      internalMobility: "Internal mobility rate improvement",
    },
    sponsorDeck: "See Executive Presentation Generator™ (12 slides)",
  };
}

export function buildPresentation(inputs, assumptions, roi, recommendation) {
  const slides = [
    { title: "Executive Summary", bullets: [buildExecutiveSummary(inputs, roi, recommendation).narrative] },
    { title: "Current Leadership Investment", bullets: [`Leadership development: ${fmtCurrency(inputs.leadershipDevBudget)}`, `Coaching: ${fmtCurrency(inputs.executiveCoachingBudget)}`, `Recruitment: ${fmtCurrency(inputs.executiveRecruitmentBudget)}`] },
    { title: "Current Problems", bullets: ["Fragmented leadership development tools", "Limited coaching coverage and visibility", "Manual, time-intensive reporting", "Reliance on external executive hiring"] },
    { title: "ROI Analysis", bullets: [`Annual value: ${fmtCurrency(roi.annualGrossValue)}`, `Net impact: ${fmtCurrency(roi.annualNetValue)}`, `3-year ROI: ${fmtPct(roi.threeYearROI)}`, `Payback: ${roi.paybackPeriod ? roi.paybackPeriod + " months" : "—"}`] },
    { title: "Leadership Readiness", bullets: [`Assessments: ${fmtNum(roi.newAssessments)}/year`, `Coverage: ${fmtPct(roi.newCoveragePct)}`, `Coaching capacity: ${fmtNum(roi.newCoachingCapacity)} leaders`] },
    { title: "Succession Impact", bullets: [`Internal promotion opportunities: ${fmtNum(roi.internalPromotionOpportunity)}`, `External hires avoided: ${fmtNum(roi.executiveHiringReduction)}`, `Hiring savings: ${fmtCurrency(roi.executiveHiringSavings)}`] },
    { title: "Financial Benefits", bullets: [`Productivity value: ${fmtCurrency(roi.operationalProductivityValue)}`, `Hiring savings: ${fmtCurrency(roi.executiveHiringSavings)}`, `Assessment value: ${fmtCurrency(roi.assessmentValue)}`] },
    { title: "Operational Benefits", bullets: [`${fmtNum(roi.totalHoursSaved)} hours saved annually`, `Assessment capacity +${fmtNum(roi.assessmentCapacityIncrease)}`, `Efficiency ${roi.leadershipDevelopmentEfficiency}%`] },
    { title: "Implementation Timeline", bullets: ["4-week pilot cohort", "12-week phased rollout", "Quarterly readiness review"] },
    { title: "Commercial Proposal", bullets: [`License: ${recommendation.recommendedLicense}`, `Annual investment: ${fmtCurrency(roi.annualPlatformInvestment)}`, `Simulation credits: ${recommendation.simulationCredits}/year`] },
    { title: "Security & Governance", bullets: ["Trust Center™ + AI Governance", "SSO / SCIM enterprise identity", "Data privacy and compliance", "Vendor due diligence available"] },
    { title: "Next Steps", bullets: ["Approve pilot cohort", "Schedule executive demo", "Validate assumptions with HR data", "Launch readiness baseline"] },
  ];
  return { slides };
}

export function buildDashboardSummaries(roi, recommendation) {
  return {
    executiveFinancialSummary: {
      annualValue: roi.annualGrossValue,
      netBusinessImpact: roi.annualNetValue,
      payback: roi.paybackPeriod,
      roi: roi.threeYearROI,
      risk: roi.annualNetValue > 0 ? "Low–Medium" : "Medium–High",
      confidence: roi.confidence.label,
      commercialRecommendation: recommendation.tierName,
    },
    leadershipImpactSummary: {
      coverage: `${roi.currentCoachingCoveragePct}% → ${roi.newCoveragePct}%`,
      promotion: roi.internalPromotionOpportunity,
      succession: roi.executiveHiringReduction,
      readiness: roi.newAssessments,
      assessmentCapacity: roi.assessmentCapacityIncrease,
      coachingCapacity: roi.newCoachingCapacity,
    },
  };
}

export function buildChartData(roi) {
  return {
    investmentVsValue: [1, 2, 3].map((y) => ({ year: `Year ${y}`, Investment: roi.annualPlatformInvestment * y, Value: roi.annualGrossValue * y })),
    coverage: [{ name: "Current", leaders: roi.coverageCurrentLeaders }, { name: "With EXECLEAD", leaders: roi.coverageNewLeaders }],
    assessment: [{ name: "Current", count: roi.currentAssessments }, { name: "New", count: roi.newAssessments }],
    coaching: [{ name: "Current", leaders: roi.currentCoachingCapacity }, { name: "AI-Added", leaders: roi.aiCoachingCapacity }],
    admin: [{ name: "Admin", hrs: roi.adminHoursSaved }, { name: "Reporting", hrs: roi.reportingHoursSaved }],
    hiring: [{ name: "External Hires", count: roi.baselineExternalHires }, { name: "Avoided", count: roi.executiveHiringReduction }],
    promotion: [{ name: "Internal Opportunity", leaders: roi.internalPromotionOpportunity }],
    breakdown: [
      { name: "Productivity Value", value: roi.operationalProductivityValue },
      { name: "Hiring Savings", value: roi.executiveHiringSavings },
      { name: "Assessment Value", value: roi.assessmentValue },
    ],
  };
}