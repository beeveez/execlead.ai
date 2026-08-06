// Enterprise ROI Service™ — single orchestrator. The UI calls only
// calculateEnterpriseROI() and receives an API-ready result object consumable
// by the dashboard, charts, CRM, PDF generator, and future external APIs
// (Salesforce, HubSpot, Dynamics, Workday, SuccessFactors, Oracle HCM, Viva).
import { calculateRoi } from "./enterpriseMetrics";
import { buildScenarios } from "./enterpriseScenarioEngine";
import {
  buildCommercialRecommendation, buildExecutiveRecommendation, buildExecutiveSummary,
  buildFinancialImpact, buildOperationalImpact, buildLeadershipImpact,
  buildProcurementPackage, buildPresentation, buildDashboardSummaries, buildChartData,
} from "./enterpriseBusinessCase";

export function calculateEnterpriseROI(inputs, assumptions, options = {}) {
  const roi = calculateRoi(inputs, assumptions);
  const scenarios = buildScenarios(inputs, assumptions, options.customFactor || 1);
  const commercialRecommendation = buildCommercialRecommendation(roi, inputs);
  const executiveRecommendation = buildExecutiveRecommendation(roi, commercialRecommendation);
  return {
    ...roi,
    roi,
    inputs,
    assumptions,
    executiveSummary: buildExecutiveSummary(inputs, roi, commercialRecommendation),
    financialImpact: buildFinancialImpact(roi),
    operationalImpact: buildOperationalImpact(roi),
    leadershipImpact: buildLeadershipImpact(roi, inputs),
    confidence: roi.confidence,
    executiveRecommendation,
    commercialRecommendation,
    procurementPackage: buildProcurementPackage(inputs, assumptions, roi, commercialRecommendation),
    presentation: buildPresentation(inputs, assumptions, roi, commercialRecommendation),
    scenarios,
    dashboard: buildDashboardSummaries(roi, commercialRecommendation),
    charts: buildChartData(roi),
  };
}