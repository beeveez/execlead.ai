import { base44 } from "@/api/base44Client";
import { DEFAULT_FEATURES, PLAN_LIMITS, getFeaturesForPlan, getFeatureCatalog } from "./featureCatalog";

const basePlans = [
  { id: "free", name: "Free", description: "Start your executive journey", monthlyPrice: 0, annualPrice: 0, currency: "USD", badge: null, buttonText: "Start Free", recommended: false, enterpriseOnly: false, visible: true, color: "#94a3b8", icon: "🌱", sortOrder: 0 },
  { id: "professional", name: "Professional", description: "For ambitious leaders", monthlyPrice: 29, annualPrice: 290, currency: "USD", badge: null, buttonText: "Start 14-Day Trial", recommended: false, enterpriseOnly: false, visible: true, color: "#6366f1", icon: "🚀", sortOrder: 1 },
  { id: "executive", name: "Executive", description: "For senior executives", monthlyPrice: 79, annualPrice: 790, currency: "USD", badge: "Most Popular", buttonText: "Start 14-Day Trial", recommended: true, enterpriseOnly: false, visible: true, color: "#a855f7", icon: "👑", sortOrder: 2 },
  { id: "enterprise", name: "Enterprise", description: "For organizations building the next generation of technology leaders", monthlyPrice: 0, annualPrice: 0, currency: "USD", badge: null, buttonText: "Contact Sales", recommended: false, enterpriseOnly: true, visible: true, color: "#10b981", icon: "🏢", sortOrder: 3, customPricing: true, seatInfo: "Starting at 100 seats" }
];

const tierOrder = (id) => ({ free: 0, professional: 1, executive: 2, enterprise: 3 })[id] ?? 0;

const deriveFeatures = (planId, catalog) =>
  catalog
    .filter(f => f.isEnabled && tierOrder(f.minimumPlan) <= tierOrder(planId))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(f => f.limitLabel ? `${f.name} (${f.limitLabel})` : f.name);

const withDerived = (p) => ({
  ...p,
  features: deriveFeatures(p.id, DEFAULT_FEATURES),
  limits: PLAN_LIMITS[p.id] || {}
});

export const DEFAULT_CATALOG = basePlans.map(withDerived);

export const PLANS = Object.fromEntries(DEFAULT_CATALOG.map(p => [p.id, { ...p, price: { monthly: p.monthlyPrice, annual: p.annualPrice } }]));
export const PLAN_LIST = DEFAULT_CATALOG.map(p => ({ ...p, price: { monthly: p.monthlyPrice, annual: p.annualPrice } }));

export async function getPricingCatalog() {
  try {
    const [planOverrides, featureCatalog] = await Promise.all([
      base44.entities.PricingPlan.list("sort_order", 50),
      getFeatureCatalog()
    ]);

    const buildPlan = (def) => {
      const ov = planOverrides?.find(o => o.plan_id === def.id);
      const merged = ov ? {
        ...def,
        name: ov.name || def.name,
        description: ov.description || def.description,
        monthlyPrice: ov.monthly_price ?? def.monthlyPrice,
        annualPrice: ov.annual_price ?? def.annualPrice,
        currency: ov.currency || def.currency,
        badge: ov.badge !== undefined && ov.badge !== "" ? ov.badge : def.badge,
        buttonText: ov.button_text || def.buttonText,
        recommended: ov.recommended ?? def.recommended,
        enterpriseOnly: ov.enterprise_only ?? def.enterpriseOnly,
        visible: ov.visible ?? def.visible
      } : def;
      return { ...merged, features: deriveFeatures(merged.id, featureCatalog), limits: PLAN_LIMITS[merged.id] || {} };
    };

    return basePlans.map(buildPlan);
  } catch (e) {
    return DEFAULT_CATALOG;
  }
}