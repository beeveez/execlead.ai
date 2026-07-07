/**
 * EXECLEAD.AI — Self-Healing Consistency Engine
 * ---------------------------------------------
 * Cross-validates Routes, Navigation, Permissions, Features, Plans,
 * and Feature Flags. Classifies findings (Critical / Warning / Info),
 * computes platform health scores, and generates actionable self-heal
 * steps for each finding.
 *
 * Entity-backed fixes execute against the Feature entity at runtime;
 * code-level fixes (routes, pages, nav, permissions) produce a preview
 * snippet for the developer to apply.
 */
import { NAV_GROUPS, ROUTE_ACCESS } from "./roles";
import { DEFAULT_FEATURES, FEATURE_REGISTRY, PLAN_TIERS, normalizeFeature, isFeatureLive, isComingSoon } from "./featureCatalog";
import { ROUTE_REGISTRY, routeMatches, routeExists } from "./routeRegistry";

const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items.map((i) => ({ ...i, group: g.label })));

let findingSeq = 0;
function fid() { return `f${++findingSeq}`; }

function makeAction(id, label, type, opts = {}) {
  return { id, label, type, ...opts };
}

/* ----------------------------- validators ----------------------------- */

function validateRoutes(findings) {
  // Duplicate routes
  const pathCounts = {};
  ROUTE_REGISTRY.forEach((r) => { pathCounts[r.url] = (pathCounts[r.url] || 0) + 1; });
  Object.entries(pathCounts).forEach(([path, count]) => {
    if (count > 1) {
      findings.push({
        id: fid(), severity: "critical", category: "route",
        title: `Duplicate route: ${path}`,
        description: `Route "${path}" is declared ${count} times in App.jsx. Duplicate routes cause unpredictable rendering.`,
        route: path,
        actions: [
          makeAction("open", "Open Route", "link", { href: path }),
          makeAction("remove_dup", "Remove Duplicate", "code", { preview: `// Remove the duplicate <Route path="${path}" ... /> from src/App.jsx` }),
        ],
      });
    }
  });

  // Missing component
  ROUTE_REGISTRY.filter((r) => !r.hasComponent).forEach((r) => {
    findings.push({
      id: fid(), severity: "critical", category: "route",
      title: `Missing page component: ${r.url}`,
      description: `Route "${r.url}" has no component mapped in the registry.`,
      route: r.url,
      actions: [
        makeAction("create_page", "Create Placeholder Page", "code", {
          preview: `// src/pages/${r.component}.jsx\nimport React from "react";\nexport default function ${r.component}() {\n  return <div className="p-8 text-white">${r.name}</div>;\n}\n// + import & <Route> in App.jsx`,
        }),
        makeAction("open", "Open Route", "link", { href: r.url }),
      ],
    });
  });
}

function validateNavigation(findings) {
  ALL_NAV_ITEMS.forEach((item) => {
    if (!routeExists(item.path)) {
      findings.push({
        id: fid(), severity: "critical", category: "navigation",
        title: `Broken navigation: ${item.label}`,
        description: `Nav item "${item.label}" (group: ${item.group}) targets "${item.path}" but no route exists in App.jsx.`,
        route: item.path,
        actions: [
          makeAction("create_route", "Create Missing Route", "code", {
            preview: `// Add to src/App.jsx\n<Route path="${item.path}" element={<${item.label.replace(/\\s/g, "")} />} />`,
          }),
          makeAction("open_nav", "Open Navigation", "code", { preview: `// Review src/lib/roles.js → NAV_GROUPS` }),
          makeAction("disable_nav", "Disable Menu", "code", { preview: `// Remove or comment the nav item in src/lib/roles.js:\n// { path: "${item.path}", label: "${item.label}", icon: ... }` }),
          makeAction("gen_page", "Auto Generate Page", "code", {
            preview: `// src/pages/${item.label.replace(/\\s/g, "")}.jsx\nimport React from "react";\nexport default function ${item.label.replace(/\\s/g, "")}() {\n  return <div>${item.label}</div>;\n}`,
          }),
        ],
      });
    }
  });
}

function validatePermissions(findings) {
  Object.keys(ROUTE_ACCESS).forEach((path) => {
    if (!routeExists(path)) {
      findings.push({
        id: fid(), severity: "warning", category: "permission",
        title: `Orphan permission: ${path}`,
        description: `ROUTE_ACCESS defines permissions for "${path}" but no matching route exists.`,
        route: path,
        actions: [
          makeAction("repair_perm", "Repair Permission", "code", { preview: `// Remove the orphan entry from ROUTE_ACCESS in src/lib/roles.js:\n// "${path}": [...]` }),
          makeAction("create_route", "Create Missing Route", "code", { preview: `// Add <Route path="${path}" ... /> to src/App.jsx` }),
        ],
      });
    }
  });
}

function validateFeatures(findings, liveFeatures) {
  const liveIds = new Set((liveFeatures || []).map((f) => f.feature_id));

  // Feature references a route that doesn't exist
  DEFAULT_FEATURES.map(normalizeFeature).forEach((f) => {
    if (f.routePath && isFeatureLive(f) && !isComingSoon(f) && !routeExists(f.routePath)) {
      findings.push({
        id: fid(), severity: "critical", category: "feature",
        title: `Feature maps to missing route: ${f.name}`,
        description: `Feature "${f.name}" (${f.id}) references route "${f.routePath}" but no route exists.`,
        feature: f.id,
        route: f.routePath,
        actions: [
          makeAction("create_route", "Create Missing Route", "code", { preview: `// Add <Route path="${f.routePath}" element={<${f.name.replace(/\\s/g, "")} />} /> to src/App.jsx` }),
          makeAction("repair_mapping", "Repair Feature Mapping", "code", { preview: `// Update FEATURE_REGISTRY["${f.id}"].routePath in src/lib/featureCatalog.js` }),
        ],
      });
    }
  });

  // Feature with navEnabled but no route
  DEFAULT_FEATURES.map(normalizeFeature).filter((f) => f.navEnabled && isFeatureLive(f) && !isComingSoon(f)).forEach((f) => {
    if (!f.routePath) {
      findings.push({
        id: fid(), severity: "warning", category: "feature",
        title: `Nav feature without route: ${f.name}`,
        description: `Feature "${f.name}" has navEnabled but no routePath.`,
        feature: f.id,
        actions: [makeAction("repair_mapping", "Repair Feature Mapping", "entity", { featureId: f.id, op: "set_route" })],
      });
    }
  });

  // Missing feature flag (Feature entity record) for catalog features
  DEFAULT_FEATURES.map(normalizeFeature).filter((f) => isFeatureLive(f) && !isComingSoon(f)).forEach((f) => {
    if (!liveIds.has(f.id)) {
      findings.push({
        id: fid(), severity: "warning", category: "feature",
        title: `Missing feature flag: ${f.name}`,
        description: `Feature "${f.name}" (${f.id}) exists in the catalog but has no Feature database record. Navigation and gating may not reflect overrides.`,
        feature: f.id,
        actions: [makeAction("create_flag", "Create Feature Flag", "entity", { featureId: f.id, op: "create" })],
      });
    }
  });

  // Orphan feature flag — DB record for a feature not in the catalog
  (liveFeatures || []).forEach((rec) => {
    if (!DEFAULT_FEATURES.find((f) => f.id === rec.feature_id)) {
      findings.push({
        id: fid(), severity: "warning", category: "feature",
        title: `Orphan feature flag: ${rec.name || rec.feature_id}`,
        description: `Feature database record "${rec.feature_id}" does not match any catalog feature.`,
        feature: rec.feature_id,
        actions: [makeAction("delete_orphan", "Delete Orphan Entry", "entity", { featureId: rec.feature_id, recordId: rec.id, op: "delete" })],
      });
    }
  });

  // Drift: live record's route_path doesn't match catalog
  (liveFeatures || []).forEach((rec) => {
    const def = DEFAULT_FEATURES.find((f) => f.id === rec.feature_id);
    if (!def) return;
    const reg = FEATURE_REGISTRY[rec.feature_id];
    const expectedRoute = reg?.routePath || def.routePath || "";
    if (expectedRoute && rec.route_path && rec.route_path !== expectedRoute) {
      findings.push({
        id: fid(), severity: "warning", category: "feature",
        title: `Feature route drift: ${rec.name || rec.feature_id}`,
        description: `Feature record route_path="${rec.route_path}" but catalog expects "${expectedRoute}".`,
        feature: rec.feature_id,
        actions: [makeAction("repair_mapping", "Repair Feature Mapping", "entity", { featureId: rec.feature_id, recordId: rec.id, op: "repair_route", expectedRoute })],
      });
    }
  });
}

function validatePlans(findings) {
  DEFAULT_FEATURES.forEach((f) => {
    if (f.minimumPlan && !(f.minimumPlan in PLAN_TIERS) && f.minimumPlan !== "public") {
      findings.push({
        id: fid(), severity: "warning", category: "api",
        title: `Invalid plan assignment: ${f.name}`,
        description: `Feature "${f.name}" has minimumPlan="${f.minimumPlan}" which is not a known plan.`,
        feature: f.id,
        actions: [makeAction("repair_plan", "Repair Plan Assignment", "code", { preview: `// Set a valid minimumPlan for "${f.id}" in src/lib/featureCatalog.js` })],
      });
    }
  });
}

function classifyInfo(findings) {
  // Deprecated routes
  ROUTE_REGISTRY.filter((r) => r.deprecated).forEach((r) => {
    findings.push({
      id: fid(), severity: "information", category: "route",
      title: `Deprecated route: ${r.url}`,
      description: `Route "${r.url}" (${r.name}) is marked ${r.status}.`,
      route: r.url,
      actions: [makeAction("open", "Open Route", "link", { href: r.url })],
    });
  });
  // Hidden / internal features
  DEFAULT_FEATURES.map(normalizeFeature).filter((f) => f.visibility === "hidden" || f.visibility === "internal").forEach((f) => {
    findings.push({
      id: fid(), severity: "information", category: "feature",
      title: `Hidden feature: ${f.name}`,
      description: `Feature "${f.name}" has visibility="${f.visibility}".`,
      feature: f.id,
      actions: [],
    });
  });
  // Unused routes (no nav reference, not public, not an index/detail sub-route)
  ROUTE_REGISTRY.filter((r) => !r.public && r.navRefs.length === 0 && !r.url.includes(":")).forEach((r) => {
    findings.push({
      id: fid(), severity: "information", category: "route",
      title: `Unused route: ${r.url}`,
      description: `Route "${r.url}" (${r.name}) is not referenced by any navigation group.`,
      route: r.url,
      actions: [makeAction("open", "Open Route", "link", { href: r.url }), makeAction("add_nav", "Update Navigation", "code", { preview: `// Add a nav item for "${r.url}" in src/lib/roles.js → NAV_GROUPS` })],
    });
  });
}

/* ----------------------------- health scores ----------------------------- */

function pct(n, d) { return d === 0 ? 100 : Math.round((n / d) * 100); }

function computeHealth(findings) {
  const navTotal = ALL_NAV_ITEMS.length;
  const navBroken = findings.filter((f) => f.category === "navigation" && f.severity === "critical").length;
  const navigation = pct(navTotal - navBroken, navTotal);

  const routeTotal = ROUTE_REGISTRY.length;
  const routeCritical = findings.filter((f) => f.category === "route" && f.severity === "critical").length;
  const routes = pct(routeTotal - routeCritical, routeTotal);

  const permTotal = Object.keys(ROUTE_ACCESS).length;
  const permOrphan = findings.filter((f) => f.category === "permission").length;
  const permissions = pct(permTotal - permOrphan, permTotal);

  const featTotal = DEFAULT_FEATURES.length;
  const featIssues = findings.filter((f) => f.category === "feature" && f.severity !== "information").length;
  const features = pct(featTotal - Math.min(featIssues, featTotal), featTotal);

  const apiIssues = findings.filter((f) => f.category === "api").length;
  const api = pct(featTotal - Math.min(apiIssues, featTotal), featTotal);

  const overall = Math.round(
    (navigation * 0.25 + routes * 0.25 + permissions * 0.2 + features * 0.2 + api * 0.1)
  );

  return { navigation, routes, permissions, features, api, overall };
}

/* ----------------------------- public API ----------------------------- */

export function runConsistencyCheck(liveFeatures = []) {
  findingSeq = 0;
  const findings = [];
  validateRoutes(findings);
  validateNavigation(findings);
  validatePermissions(findings);
  validateFeatures(findings, liveFeatures);
  validatePlans(findings);
  classifyInfo(findings);

  const order = { critical: 0, warning: 1, information: 2 };
  findings.sort((a, b) => order[a.severity] - order[b.severity]);

  const health = computeHealth(findings);
  const counts = {
    critical: findings.filter((f) => f.severity === "critical").length,
    warning: findings.filter((f) => f.severity === "warning").length,
    information: findings.filter((f) => f.severity === "information").length,
  };

  const deploymentBlocked = counts.critical > 0;
  const deployBlockers = findings.filter((f) => f.severity === "critical").map((f) => f.title);

  return { findings, health, counts, deploymentBlocked, deployBlockers, routeCount: ROUTE_REGISTRY.length, navCount: ALL_NAV_ITEMS.length, featureCount: DEFAULT_FEATURES.length };
}