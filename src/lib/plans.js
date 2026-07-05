import { DEFAULT_CATALOG } from "./pricingCatalog";
import { hasFeatureAccess, FEATURE_ALIASES } from "./featureCatalog";

const withPrice = (plan) => ({
  ...plan,
  price: { monthly: plan.monthlyPrice, annual: plan.annualPrice }
});

export const PLANS = Object.fromEntries(DEFAULT_CATALOG.map(p => [p.id, withPrice(p)]));
export const PLAN_LIST = DEFAULT_CATALOG.map(withPrice);

export const getPlan = (profile) => PLANS[profile?.subscription_plan] || PLANS.free;

export const hasFeature = (profile, key) => {
  const featureId = FEATURE_ALIASES[key] || key;
  return hasFeatureAccess(profile?.subscription_plan || "free", featureId);
};