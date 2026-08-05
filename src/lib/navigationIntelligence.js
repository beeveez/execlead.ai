import {
  Home, Compass, Swords, TrendingUp, Award, Building2, Settings as SettingsIcon,
  Target, RotateCcw, Search, ShieldCheck, Activity, FileText, Brain, Sparkles,
  Rocket, Gauge, Shield,
} from "lucide-react";
import { searchNavigation } from "@/lib/navigationRegistry";

// ============================================================
// NAVIGATION INTELLIGENCE™ — Workspace Isolation™ Standard
// ------------------------------------------------------------
// Each workspace owns its entire shell: sidebar, quick actions,
// search scope, and AI prompts. Executive keeps its outcome-based
// progressive-disclosure tree; Developer / Operations / Enterprise
// render their own navigation. No workspace's content may appear
// in another workspace's shell.
// ============================================================

// ── Executive: the 7 outcome destinations ──
export const OUTCOMES = [
  { id: "dashboard", label: "Dashboard", icon: Home, route: "/dashboard" },
  { id: "journey", label: "Leadership Journey", icon: Compass, route: "/executive-readiness" },
  { id: "practice", label: "Practice", icon: Swords, route: "/coach" },
  { id: "growth", label: "Growth", icon: TrendingUp, route: "/evidence-vault" },
  { id: "portfolio", label: "Portfolio", icon: Award, route: "/executive-portfolio" },
  { id: "enterprise", label: "Enterprise", icon: Building2, route: "/enterprise", enterprise: true },
  { id: "settings", label: "Settings", icon: SettingsIcon, route: "/settings" },
];

// ── Executive: route → (outcome, stage) map ──
export const ROUTE_MAP = {
  "/executive-readiness": { outcome: "journey", stage: 1 },
  "/assessment": { outcome: "journey", stage: 1 },
  "/leadership-dna": { outcome: "journey", stage: 1 },
  "/journey": { outcome: "journey", stage: 1 },
  "/career": { outcome: "journey", stage: 2 },
  "/promotion-forecast": { outcome: "journey", stage: 2 },
  "/coach": { outcome: "practice", stage: 1 },
  "/simulator": { outcome: "practice", stage: 1 },
  "/debate": { outcome: "practice", stage: 2 },
  "/council": { outcome: "practice", stage: 2 },
  "/decision-lab": { outcome: "practice", stage: 2 },
  "/voice-interview": { outcome: "practice", stage: 2 },
  "/evidence-vault": { outcome: "growth", stage: 2 },
  "/skills": { outcome: "growth", stage: 2 },
  "/metrics": { outcome: "growth", stage: 2 },
  "/recommendation-intelligence": { outcome: "growth", stage: 2 },
  "/analytics": { outcome: "growth", stage: 3 },
  "/outcome-intelligence": { outcome: "growth", stage: 3 },
  "/resume": { outcome: "portfolio", stage: 2 },
  "/career-studio": { outcome: "portfolio", stage: 2 },
  "/executive-portfolio": { outcome: "portfolio", stage: 3 },
  "/executive-identity-graph": { outcome: "portfolio", stage: 3 },
  "/executive-success-stories": { outcome: "portfolio", stage: 3 },
  "/enterprise": { outcome: "enterprise", stage: 1, enterprise: true },
  "/succession-planning": { outcome: "enterprise", stage: 1, enterprise: true },
  "/hr-dashboard": { outcome: "enterprise", stage: 1, enterprise: true },
  "/enterprise-intelligence": { outcome: "enterprise", stage: 1, enterprise: true },
  "/trust-center": { outcome: "enterprise", stage: 1, enterprise: true },
  "/settings": { outcome: "settings", stage: 1 },
};

const VISITED_KEY = "execlead_visited_routes";
const LAST_ROUTE_KEY = "execlead_last_route";

// ── Per-workspace quick actions (Workspace Isolation™) ──
const QUICK_ACTIONS = {
  executive: [
    { label: "Complete Today's Mission", path: "/dashboard", icon: Target },
    { label: "Practice Leadership", path: "/simulator", icon: Swords },
    { label: "View My Progress", path: "/executive-readiness", icon: TrendingUp },
  ],
  developer: [
    { label: "Run Platform Validation", path: "/developer/diagnostics", icon: ShieldCheck },
    { label: "View Platform Health", path: "/developer/executive-platform-status", icon: Activity },
    { label: "Review ADRs", path: "/architecture-decisions", icon: FileText },
    { label: "Architecture Standards", path: "/architecture-governance", icon: Building2 },
    { label: "Check Security Status", path: "/security-baseline", icon: Shield },
    { label: "Platform Analytics", path: "/developer/performance", icon: Gauge },
    { label: "Platform Knowledge Center", path: "/platform-knowledge", icon: Brain },
    { label: "Digital Twin™", path: "/platform-digital-twin", icon: Sparkles },
    { label: "Review Release Readiness", path: "/release-readiness", icon: Rocket },
    { label: "Platform Governance Center™", path: "/developer/diagnostics", icon: Gauge },
  ],
  operations: [
    { label: "Product Command Center™", path: "/operations", icon: Home },
    { label: "AI Operations Center™", path: "/operations/ai", icon: Brain },
    { label: "Commercial Command Center™", path: "/commercial-command-center", icon: TrendingUp },
    { label: "Security Operations", path: "/operations/security", icon: ShieldCheck },
    { label: "Performance Operations", path: "/operations/performance", icon: Gauge },
    { label: "Release Readiness", path: "/release-readiness", icon: Rocket },
  ],
  enterprise: [
    { label: "Enterprise Command Center™", path: "/enterprise/command-center", icon: Home },
    { label: "Organization", path: "/enterprise/organization-domain", icon: Building2 },
    { label: "Workforce Development", path: "/enterprise/workforce", icon: Award },
    { label: "Governance", path: "/enterprise/governance-domain", icon: ShieldCheck },
    { label: "Security & Identity", path: "/enterprise/security-identity", icon: Shield },
    { label: "Reporting", path: "/enterprise/reporting", icon: TrendingUp },
  ],
};

// ── Per-workspace Ask EXEC™ prompts (Workspace Isolation™) ──
const EXEC_PROMPTS_BY_WS = {
  executive: [
    "What should I do next?",
    "What's today's highest-impact activity?",
    "How can I improve Executive Readiness?",
    "Which competency needs attention?",
    "Recommend my next leadership challenge.",
  ],
  developer: [
    "Explain this architecture",
    "Find a module",
    "Locate an ADR",
    "Show dependencies",
    "Search platform documentation",
    "Analyze technical debt",
    "Run platform diagnostics",
  ],
  operations: [
    "What's the platform health summary?",
    "Show commercial performance",
    "What needs launch attention?",
    "Open customer intelligence",
  ],
  enterprise: [
    "Show organization overview",
    "Who needs workforce development?",
    "What governance items need review?",
    "Enterprise security status",
  ],
};

// Backward-compatible default (executive).
export const EXEC_PROMPTS = EXEC_PROMPTS_BY_WS.executive;

export function getExecPrompts(activeWorkspace = "executive") {
  return EXEC_PROMPTS_BY_WS[activeWorkspace] || EXEC_PROMPTS_BY_WS.executive;
}

// ── Enterprise detection ──
export function isEnterpriseUser(role) {
  if (!role) {
    try { return localStorage.getItem("execlead_frontdoor") === "enterprise"; } catch { return false; }
  }
  const enterpriseRoles = ["enterprise_admin", "admin", "super_admin", "platform_admin", "founder_root_admin"];
  if (enterpriseRoles.includes(role)) return true;
  try { return localStorage.getItem("execlead_frontdoor") === "enterprise"; } catch { return false; }
}

// ── Progressive disclosure stage (1-3) from engagement (Executive only) ──
export function computeStage() {
  let visited = [];
  try { visited = JSON.parse(localStorage.getItem(VISITED_KEY)) || []; } catch {}
  const visitedStages = visited.map((p) => ROUTE_MAP[p]?.stage || 1);
  if (visitedStages.some((s) => s >= 3)) return 3;
  if (visitedStages.some((s) => s >= 2)) return 2;
  return 1;
}

export function trackVisit(pathname) {
  if (!pathname || ["/dashboard", "/home", "/"].includes(pathname)) return;
  try {
    const visited = JSON.parse(localStorage.getItem(VISITED_KEY)) || [];
    if (!visited.includes(pathname)) {
      const next = [...visited, pathname].slice(-40);
      localStorage.setItem(VISITED_KEY, JSON.stringify(next));
    }
    localStorage.setItem(LAST_ROUTE_KEY, pathname);
  } catch {}
}

export function getLastRoute() {
  try { return localStorage.getItem(LAST_ROUTE_KEY); } catch { return null; }
}

// ── Flatten workspace nav groups into a single capability list ──
export function flattenNavItems(navGroups) {
  const seen = new Set();
  const items = [];
  (navGroups || []).forEach((g) => {
    (g.items || []).forEach((it) => {
      if (it.path && !seen.has(it.path)) { seen.add(it.path); items.push(it); }
    });
  });
  return items;
}

// ── Build the Executive outcome tree with progressive disclosure ──
// Only the Executive workspace uses the outcome-based tree. Other
// workspaces render their own section navigation (see OutcomeSidebar).
export function buildOutcomeTree({ flatItems, stage, isEnterprise, brokenPaths, pathname }) {
  let visited = [];
  try { visited = JSON.parse(localStorage.getItem(VISITED_KEY)) || []; } catch {}
  const broken = brokenPaths || new Set();

  return OUTCOMES
    .filter((o) => !o.enterprise || isEnterprise)
    .map((outcome) => {
      const children = flatItems
        .filter((it) => ROUTE_MAP[it.path]?.outcome === outcome.id)
        .filter((it) => !broken.has(it.path))
        .filter((it) => {
          const meta = ROUTE_MAP[it.path];
          const itemStage = meta?.stage || 1;
          if (itemStage <= stage) return true;
          if (it.path === pathname) return true;
          if (visited.includes(it.path)) return true;
          return false;
        });
      const seen = new Set();
      const dedup = children.filter((c) => (seen.has(c.path) ? false : (seen.add(c.path), true)));
      return { ...outcome, children: dedup };
    });
}

// ── Contextual quick actions, scoped to the active workspace ──
export function computeQuickActions(pathname, activeWorkspace = "executive") {
  const actions = [];
  const last = getLastRoute();
  if (last && last !== pathname && !["/dashboard", "/home"].includes(last)) {
    actions.push({ label: "Continue Last Session", path: last, icon: RotateCcw });
  }
  const wsActions = QUICK_ACTIONS[activeWorkspace] || QUICK_ACTIONS.executive;
  return [...actions, ...wsActions].slice(0, 4);
}

// ── Universal search, scoped to the active workspace (Workspace Isolation™) ──
// Developer search returns only Developer entries; Executive only Executive;
// etc. Leadership / career / practice content never leaks across workspaces.
export function universalSearch(query, activeWorkspace, limit = 8) {
  if (!query || !query.trim()) return [];
  const results = searchNavigation(query, 50);
  const scoped = activeWorkspace
    ? results.filter((e) => e.workspace === activeWorkspace)
    : results;
  return scoped.slice(0, limit).map((e) => ({
    path: e.route, label: e.title, icon: e.icon, section: e.workspaceLabel,
  }));
}

export { Search };