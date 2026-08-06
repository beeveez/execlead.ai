// Enterprise ROI Engine™ — public re-export aggregator. Import from here
// (or from the backward-compatible @/lib/enterpriseRoiEngine shim).
export * from "./enterpriseMetrics";
export * from "./enterpriseScenarioEngine";
export { calculateEnterpriseROI } from "./enterpriseROIService";
export {
  buildCommercialRecommendation, buildProcurementPackage, buildPresentation,
  buildDashboardSummaries, buildExecutiveRecommendation,
} from "./enterpriseBusinessCase";