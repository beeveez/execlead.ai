import { DEFAULT_FEATURES, normalizeFeature, isFeatureLive, isComingSoon } from "./featureCatalog";
import { NAV_GROUPS, ROUTE_ACCESS } from "./roles";

const KNOWN_ROUTES = [
  "/dashboard", "/academy", "/coach", "/simulator", "/debate", "/council",
  "/marketplace", "/career-studio", "/resume", "/companies", "/journal",
  "/analytics", "/leadership-dna", "/executive-legacy", "/career", "/challenge",
  "/profile", "/billing", "/settings", "/notifications", "/ai-usage",
  "/enterprise", "/admin", "/hr-dashboard", "/succession-planning",
  "/promotion-readiness", "/learning-assignments", "/sso",
  "/compare-plans", "/connected-accounts", "/pricing-admin", "/feature-management",
  "/billing-admin", "/payment-settings", "/email-settings", "/company-admin",
  "/cpq", "/cpq-dashboard", "/developer", "/developer/audit-logs",
  "/developer/system-health", "/developer/api-keys", "/developer/database",
  "/developer/migrations", "/developer/deployments", "/developer/organizations",
  "/onboarding", "/cpq/quote/:id",
];

function routeMatches(known, path) {
  if (known === path) return true;
  const knownParts = known.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);
  if (knownParts.length !== pathParts.length) return false;
  return knownParts.every((p, i) => p.startsWith(":") || p === pathParts[i]);
}

export function validateFeatureConsistency() {
  const errors = [];
  const warnings = [];
  const features = DEFAULT_FEATURES.map(normalizeFeature);

  // 1. Every live, pricing-enabled feature with a routePath must have a matching route
  features
    .filter(f => f.pricingEnabled && isFeatureLive(f) && !isComingSoon(f))
    .forEach(f => {
      if (f.routePath && !KNOWN_ROUTES.some(r => routeMatches(r, f.routePath))) {
        errors.push({
          type: "missing_route",
          feature: f.name,
          featureId: f.id,
          message: `Feature "${f.name}" references route "${f.routePath}" but no matching route exists in App.jsx`,
        });
      }
    });

  // 2. Every nav item must have a destination route
  const allNavItems = NAV_GROUPS.flatMap(g => g.items);
  allNavItems.forEach(item => {
    if (!KNOWN_ROUTES.some(r => routeMatches(r, item.path))) {
      errors.push({
        type: "orphan_nav",
        feature: item.label,
        message: `Nav item "${item.label}" → "${item.path}" has no matching route in App.jsx`,
      });
    }
  });

  // 3. Every ROUTE_ACCESS entry should correspond to a known route
  Object.keys(ROUTE_ACCESS).forEach(path => {
    if (!KNOWN_ROUTES.some(r => routeMatches(r, path))) {
      warnings.push({
        type: "orphan_route_access",
        message: `ROUTE_ACCESS references "${path}" but no route exists in App.jsx`,
      });
    }
  });

  // 4. Features with navEnabled should have a routePath
  features
    .filter(f => f.navEnabled && isFeatureLive(f) && !isComingSoon(f))
    .forEach(f => {
      if (!f.routePath) {
        warnings.push({
          type: "nav_without_route",
          feature: f.name,
          featureId: f.id,
          message: `Feature "${f.name}" has navEnabled=true but no routePath`,
        });
      }
    });

  // 5. Coming Soon features should not appear as included in pricing
  features
    .filter(f => isComingSoon(f) && f.pricingEnabled)
    .forEach(f => {
      warnings.push({
        type: "coming_soon_in_pricing",
        feature: f.name,
        featureId: f.id,
        message: `Feature "${f.name}" is Coming Soon but pricingEnabled=true — will show as "Coming Soon" not included`,
      });
    });

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    featureCount: features.length,
    routeCount: KNOWN_ROUTES.length,
    navItemCount: allNavItems.length,
  };
}