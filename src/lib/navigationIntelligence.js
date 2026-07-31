import {
  Home, Compass, Swords, TrendingUp, Award, Building2, Settings as SettingsIcon,
  Target, RotateCcw, Search,
} from "lucide-react";
import { searchNavigation } from "@/lib/navigationRegistry";

// ============================================================
// NAVIGATION INTELLIGENCE™ — Outcome-First Navigation Standard
// ------------------------------------------------------------
// Reorganizes every platform capability under 7 outcome-based
// destinations. No capability is removed — advanced capabilities
// are revealed progressively (by stage + engagement) and remain
// reachable via Universal Search.
// ============================================================

// ── The 7 default destinations ──
export const OUTCOMES = [
  { id: "dashboard", label: "Dashboard", icon: Home, route: "/dashboard" },
  { id: "journey", label: "Leadership Journey", icon: Compass, route: "/executive-readiness" },
  { id: "practice", label: "Practice", icon: Swords, route: "/coach" },
  { id: "growth", label: "Growth", icon: TrendingUp, route: "/evidence-vault" },
  { id: "portfolio", label: "Portfolio", icon: Award, route: "/executive-portfolio" },
  { id: "enterprise", label: "Enterprise", icon: Building2, route: "/enterprise", enterprise: true },
  { id: "settings", label: "Settings", icon: SettingsIcon, route: "/settings" },
];

// ── Route → (outcome, stage) map ──
// stage 1 = always visible | 2 = revealed after engagement | 3 = advanced
export const ROUTE_MAP = {
  // Leadership Journey
  "/executive-readiness": { outcome: "journey", stage: 1 },
  "/assessment": { outcome: "journey", stage: 1 },
  "/leadership-dna": { outcome: "journey", stage: 1 },
  "/journey": { outcome: "journey", stage: 1 },
  "/career": { outcome: "journey", stage: 2 },
  "/promotion-forecast": { outcome: "journey", stage: 2 },
  // Practice
  "/coach": { outcome: "practice", stage: 1 },
  "/simulator": { outcome: "practice", stage: 1 },
  "/debate": { outcome: "practice", stage: 2 },
  "/council": { outcome: "practice", stage: 2 },
  "/decision-lab": { outcome: "practice", stage: 2 },
  "/voice-interview": { outcome: "practice", stage: 2 },
  // Growth
  "/evidence-vault": { outcome: "growth", stage: 2 },
  "/skills": { outcome: "growth", stage: 2 },
  "/metrics": { outcome: "growth", stage: 2 },
  "/recommendation-intelligence": { outcome: "growth", stage: 2 },
  "/analytics": { outcome: "growth", stage: 3 },
  "/outcome-intelligence": { outcome: "growth", stage: 3 },
  // Portfolio
  "/resume": { outcome: "portfolio", stage: 2 },
  "/career-studio": { outcome: "portfolio", stage: 2 },
  "/executive-portfolio": { outcome: "portfolio", stage: 3 },
  "/executive-identity-graph": { outcome: "portfolio", stage: 3 },
  "/executive-success-stories": { outcome: "portfolio", stage: 3 },
  // Enterprise
  "/enterprise": { outcome: "enterprise", stage: 1, enterprise: true },
  "/succession-planning": { outcome: "enterprise", stage: 1, enterprise: true },
  "/hr-dashboard": { outcome: "enterprise", stage: 1, enterprise: true },
  "/enterprise-intelligence": { outcome: "enterprise", stage: 1, enterprise: true },
  "/trust-center": { outcome: "enterprise", stage: 1, enterprise: true },
  // Settings
  "/settings": { outcome: "settings", stage: 1 },
};

const VISITED_KEY = "execlead_visited_routes";
const LAST_ROUTE_KEY = "execlead_last_route";

// ── Enterprise detection ──
export function isEnterpriseUser(role) {
  if (!role) {
    try { return localStorage.getItem("execlead_frontdoor") === "enterprise"; } catch { return false; }
  }
  const enterpriseRoles = ["enterprise_admin", "admin", "super_admin", "platform_admin", "founder_root_admin"];
  if (enterpriseRoles.includes(role)) return true;
  try { return localStorage.getItem("execlead_frontdoor") === "enterprise"; } catch { return false; }
}

// ── Progressive disclosure stage (1-3) from engagement ──
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

// ── Build the outcome tree with progressive disclosure ──
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
          if (itemStage <= stage) return true;          // revealed by stage
          if (it.path === pathname) return true;        // never hide the active page
          if (visited.includes(it.path)) return true;    // engaged → stays revealed
          return false;
        });
      // Dedupe children by path (preserve first)
      const seen = new Set();
      const dedup = children.filter((c) => (seen.has(c.path) ? false : (seen.add(c.path), true)));
      return { ...outcome, children: dedup };
    });
}

// ── Contextual quick actions (adaptive) ──
export function computeQuickActions(pathname) {
  const actions = [];
  const last = getLastRoute();
  if (last && last !== pathname && !["/dashboard", "/home"].includes(last)) {
    actions.push({ label: "Continue Last Session", path: last, icon: RotateCcw });
  }
  actions.push({ label: "Complete Today's Mission", path: "/dashboard", icon: Target });
  actions.push({ label: "Practice Leadership", path: "/simulator", icon: Swords });
  actions.push({ label: "View My Progress", path: "/executive-readiness", icon: TrendingUp });
  return actions.slice(0, 4);
}

// ── EXEC™ guide prompts ──
export const EXEC_PROMPTS = [
  "What should I do next?",
  "What's today's highest-impact activity?",
  "How can I improve Executive Readiness?",
  "Which competency needs attention?",
  "Recommend my next leadership challenge.",
];

// ── Universal search wrapper ──
export function universalSearch(query, limit = 8) {
  if (!query || !query.trim()) return [];
  return searchNavigation(query, limit).map((e) => ({
    path: e.route, label: e.title, icon: e.icon, section: e.workspaceLabel,
  }));
}

export { Search };