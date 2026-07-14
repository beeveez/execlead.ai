/**
 * EXECLEAD.AI — Navigation Registry™
 * ============================================================
 * The single source of truth for every navigable page in the
 * platform. Every workspace page registers here with full
 * metadata. No component should hardcode navigation paths.
 *
 * Consumers:
 *   • Sidebar Navigation
 *   • Universal Breadcrumb Engine™
 *   • Universal Command Palette™
 *   • Global Search™
 *   • Universal Workspace Router™
 *   • Favorites
 *   • Recently Viewed
 *   • Navigation Analytics
 *   • Documentation
 *   • Permissions
 *   • Deep Linking
 *
 * Each entry:
 *   id, title, route, workspace, section, parent, icon,
 *   displayOrder, permission, featureFlag, searchKeywords,
 *   breadcrumbLabel, public
 */

import { WORKSPACE_NAV, WORKSPACES, WORKSPACE_HOME } from "./workspaces";
import { ROUTE_ACCESS } from "./roles";
import {
  Home, CreditCard, Info, Mail, ShieldCheck, FileText, Trophy,
} from "lucide-react";

/* ================================================================
 * Public pages (not in WORKSPACE_NAV)
 * ================================================================ */
const PUBLIC_PAGES = [
  { path: "/", title: "Home", breadcrumbLabel: "Home", icon: Home, keywords: "landing home execlead platform" },
  { path: "/pricing", title: "Pricing", breadcrumbLabel: "Pricing", icon: CreditCard, keywords: "pricing plans membership subscription billing" },
  { path: "/leaderboard", title: "Leaderboard", breadcrumbLabel: "Leaderboard", icon: Trophy, keywords: "leaderboard rankings executives top" },
  { path: "/company-library", title: "Company Library", breadcrumbLabel: "Company Library", icon: Home, keywords: "companies library directory intelligence" },
  { path: "/about", title: "About", breadcrumbLabel: "About", icon: Info, keywords: "about execlead company mission" },
  { path: "/contact", title: "Contact", breadcrumbLabel: "Contact", icon: Mail, keywords: "contact support email help" },
  { path: "/founders", title: "Founders Wall", breadcrumbLabel: "Founders Wall", icon: Trophy, keywords: "founders wall founding members" },
  { path: "/beta", title: "Beta Program", breadcrumbLabel: "Beta Apply", icon: Home, keywords: "beta apply program early access" },
  { path: "/trust-center", title: "Trust Center", breadcrumbLabel: "Trust Center", icon: ShieldCheck, keywords: "trust center security compliance privacy" },
  { path: "/legal", title: "Legal", breadcrumbLabel: "Legal", icon: FileText, keywords: "legal terms privacy policy compliance" },
];

/* ================================================================
 * Registry builder
 * ================================================================ */

let _registry = null;

function generateKeywords(label, section, workspaceLabel) {
  return [label, section, workspaceLabel]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[™®©]/g, "")
    .trim();
}

function buildRegistry() {
  const registry = [];
  const seen = new Set();
  let order = 0;

  // Public pages
  PUBLIC_PAGES.forEach((page) => {
    if (seen.has(page.path)) return;
    seen.add(page.path);
    order++;
    registry.push({
      id: page.path,
      title: page.title,
      route: page.path,
      workspace: "public",
      workspaceLabel: "Public",
      workspaceColor: "#6b7280",
      section: "Public",
      parent: null,
      icon: page.icon,
      displayOrder: order,
      permission: null,
      featureFlag: null,
      searchKeywords: page.keywords,
      breadcrumbLabel: page.breadcrumbLabel,
      public: true,
    });
  });

  // Workspace pages — derived from WORKSPACE_NAV
  Object.entries(WORKSPACE_NAV).forEach(([wsId, groups]) => {
    const ws = WORKSPACES[wsId];
    const wsHome = WORKSPACE_HOME[wsId] || "/";

    groups.forEach((group) => {
      group.items.forEach((item) => {
        if (seen.has(item.path)) return;
        seen.add(item.path);
        order++;

        const keywordBase = generateKeywords(item.label, group.label, ws?.label);
        const featureKw = item.feature ? ` ${item.feature.replace(/_/g, " ")}` : "";

        registry.push({
          id: item.path,
          title: item.label,
          route: item.path,
          workspace: wsId,
          workspaceLabel: ws?.label || wsId,
          workspaceColor: ws?.color || "#6366f1",
          section: group.label,
          parent: wsHome,
          icon: item.icon,
          displayOrder: order,
          permission: ROUTE_ACCESS[item.path] || null,
          featureFlag: item.feature || null,
          searchKeywords: keywordBase + featureKw,
          breadcrumbLabel: item.label,
          public: false,
        });
      });
    });
  });

  return registry;
}

/* ================================================================
 * Public API
 * ================================================================ */

/** Returns the full navigation registry (lazy-initialized). */
export function getNavigationRegistry() {
  if (!_registry) _registry = buildRegistry();
  return _registry;
}

/** Find a single entry by exact route match, then prefix match. */
export function getNavEntryByPath(path) {
  const registry = getNavigationRegistry();
  return (
    registry.find((e) => e.route === path) ||
    registry.find((e) => path.startsWith(e.route + "/")) ||
    null
  );
}

/** All entries in a workspace, ordered by displayOrder. */
export function getNavEntriesByWorkspace(wsId) {
  return getNavigationRegistry()
    .filter((e) => e.workspace === wsId)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

/** All entries in a workspace section, ordered by displayOrder. */
export function getNavEntriesBySection(wsId, section) {
  return getNavigationRegistry()
    .filter((e) => e.workspace === wsId && e.section === section)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

/** All sections (unique) in a workspace, in display order. */
export function getWorkspaceSections(wsId) {
  const entries = getNavEntriesByWorkspace(wsId);
  const sections = [];
  const seen = new Set();
  entries.forEach((e) => {
    if (!seen.has(e.section)) {
      seen.add(e.section);
      sections.push(e.section);
    }
  });
  return sections;
}

/**
 * Build a breadcrumb trail for a route using the registry.
 * Returns: [{ label, path, workspace, isCurrent }]
 * Parent levels are clickable; the current page is not.
 */
export function getBreadcrumbTrail(pathname) {
  const entry = getNavEntryByPath(pathname);
  if (!entry || entry.workspace === "public") return null;

  const ws = WORKSPACES[entry.workspace];
  const wsHome = WORKSPACE_HOME[entry.workspace] || "/";

  // Section crumb: first sibling in the same section that isn't the current page
  const siblings = getNavEntriesBySection(entry.workspace, entry.section);
  const sectionTarget = siblings.find((s) => s.route !== pathname);

  const trail = [
    {
      label: ws?.label || entry.workspace,
      path: wsHome,
      workspace: entry.workspace,
      icon: ws?.icon,
      isCurrent: false,
    },
    {
      label: entry.section,
      path: sectionTarget?.route || null,
      workspace: entry.workspace,
      isCurrent: false,
    },
    {
      label: entry.breadcrumbLabel || entry.title,
      path: entry.route,
      workspace: entry.workspace,
      icon: entry.icon,
      isCurrent: true,
    },
  ];

  return trail;
}

/**
 * Fuzzy search across the navigation registry.
 * Returns scored, sorted results.
 */
export function searchNavigation(query, limit = 20) {
  const registry = getNavigationRegistry();
  if (!query || !query.trim()) return [];

  const q = query.toLowerCase().trim();

  return registry
    .map((entry) => {
      const title = entry.title.toLowerCase();
      const keywords = entry.searchKeywords.toLowerCase();
      const section = entry.section.toLowerCase();
      const wsLabel = entry.workspaceLabel.toLowerCase();

      let score = 0;
      if (title === q) score += 300;
      if (title.startsWith(q)) score += 200;
      if (title.includes(q)) score += 120;
      if (keywords.includes(q)) score += 80;
      if (section.includes(q)) score += 30;
      if (wsLabel.includes(q)) score += 25;

      const words = title.split(/\s+/);
      if (words.some((w) => w.startsWith(q))) score += 60;

      // Fuzzy subsequence match
      if (score === 0) {
        let qi = 0;
        for (let ti = 0; ti < title.length && qi < q.length; ti++) {
          if (title[ti] === q[qi]) qi++;
        }
        if (qi === q.length) score += 20;
      }

      return { ...entry, score };
    })
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** Total registered page count (for analytics/diagnostics). */
export function getNavRegistryStats() {
  const registry = getNavigationRegistry();
  return {
    totalPages: registry.length,
    publicPages: registry.filter((e) => e.public).length,
    workspacePages: registry.filter((e) => !e.public).length,
    workspaces: [...new Set(registry.map((e) => e.workspace))].filter((w) => w !== "public").length,
    sections: [...new Set(registry.map((e) => `${e.workspace}:${e.section}`))].length,
    gatedByFeature: registry.filter((e) => e.featureFlag).length,
    gatedByPermission: registry.filter((e) => e.permission).length,
  };
}