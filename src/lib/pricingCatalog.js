import { base44 } from "@/api/base44Client";
import { DEFAULT_FEATURES, PLAN_LIMITS, getFeaturesForPlan, getFeatureCatalog, normalizeFeature, isFeatureLive, isComingSoon } from "./featureCatalog";

const basePlans = [
  { id: "free", name: "Free", description: "Designed for users exploring executive leadership", monthlyPrice: 0, annualPrice: 0, currency: "USD", badge: null, buttonText: "Get Started Free", recommended: false, enterpriseOnly: false, visible: true, color: "#94a3b8", icon: "🌱", sortOrder: 0 },
  { id: "professional", name: "Professional", description: "For ambitious professionals", monthlyPrice: 29, annualPrice: 290, currency: "USD", badge: "Most Popular", buttonText: "Upgrade", recommended: true, enterpriseOnly: false, visible: true, color: "#6366f1", icon: "🚀", sortOrder: 1 },
  { id: "executive", name: "Executive", description: "Designed for senior managers and executives", monthlyPrice: 79, annualPrice: 790, currency: "USD", badge: null, buttonText: "Upgrade", recommended: false, enterpriseOnly: false, visible: true, color: "#a855f7", icon: "👑", sortOrder: 2 },
  { id: "enterprise", name: "Enterprise", description: "For organizations building the next generation of technology leaders", monthlyPrice: 0, annualPrice: 0, currency: "USD", badge: null, buttonText: "Contact Sales", recommended: false, enterpriseOnly: true, visible: true, color: "#10b981", icon: "🏢", sortOrder: 3, customPricing: true, seatInfo: "Starting at 100 seats" },
  { id: "developer_unlimited", name: "Developer Unlimited", description: "Hidden plan for super admins — never charged, full access", monthlyPrice: 0, annualPrice: 0, currency: "USD", badge: null, buttonText: "Developer", recommended: false, enterpriseOnly: false, visible: false, color: "#f59e0b", icon: "⚡", sortOrder: 4 }
];

const tierOrder = (id) => ({ free: 0, professional: 1, executive: 2, enterprise: 3, developer_unlimited: 4 })[id] ?? 0;

const deriveFeatures = (planId, catalog) =>
  catalog
    .map(normalizeFeature)
    .filter(f => f.isEnabled && f.pricingEnabled && isFeatureLive(f) && !isComingSoon(f) && tierOrder(f.minimumPlan) <= tierOrder(planId))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(f => f.limitLabel ? `${f.name} (${f.limitLabel})` : f.name);

const deriveComingSoon = (catalog) =>
  catalog
    .map(normalizeFeature)
    .filter(f => f.pricingEnabled && isComingSoon(f))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(f => f.name);

const withDerived = (p) => ({
  ...p,
  features: deriveFeatures(p.id, DEFAULT_FEATURES),
  comingSoon: deriveComingSoon(DEFAULT_FEATURES),
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
      return { ...merged, features: deriveFeatures(merged.id, featureCatalog), comingSoon: deriveComingSoon(featureCatalog), limits: PLAN_LIMITS[merged.id] || {} };
    };

    return basePlans.map(buildPlan);
  } catch (e) {
    return DEFAULT_CATALOG;
  }
}