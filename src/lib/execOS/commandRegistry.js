/**
 * EXEC™ Operating System™ — Command Registry
 * ============================================================
 * Builds a searchable index of all navigable pages and commands.
 * Consumes the Navigation Registry™ (single source of truth).
 * Powers the Universal Command Palette™ (Ctrl+K) and Universal Search™.
 */

import { getNavigationRegistry } from "../navigationRegistry";
import { getRecent } from "./workspaceHistory";
import { Search, Printer, Moon, Keyboard, LogOut, FileDown } from "lucide-react";

let _index = null;

function buildIndex() {
  const navEntries = getNavigationRegistry().map((entry) => ({
    type: "navigation",
    id: entry.id,
    title: entry.title,
    path: entry.route,
    workspace: entry.workspace,
    workspaceLabel: entry.workspaceLabel,
    workspaceColor: entry.workspaceColor,
    category: entry.section,
    icon: entry.icon,
    feature: entry.featureFlag,
  }));

  // Global commands (not tied to a specific page)
  const commands = [
    { type: "command", id: "cmd:search", title: "Search Everything", subtitle: "Universal search across the platform", action: "search", category: "Actions", icon: Search },
    { type: "command", id: "cmd:print", title: "Print Page", subtitle: "Print or save current page as PDF", action: "print", category: "Actions", icon: Printer },
    { type: "command", id: "cmd:export-pdf", title: "Export PDF Report", subtitle: "Generate executive report from current page", action: "export-pdf", category: "Actions", icon: FileDown },
    { type: "command", id: "cmd:toggle-theme", title: "Toggle Theme", subtitle: "Switch between light and dark mode", action: "toggle-theme", category: "Appearance", icon: Moon },
    { type: "command", id: "cmd:shortcuts", title: "Keyboard Shortcuts", subtitle: "View all keyboard shortcuts", action: "shortcuts", category: "Help", icon: Keyboard },
    { type: "command", id: "cmd:signout", title: "Sign Out", subtitle: "Sign out of EXECLEAD.AI", action: "signout", category: "Account", icon: LogOut },
  ];

  return [...navEntries, ...commands];
}

export function getCommandIndex() {
  if (!_index) _index = buildIndex();
  return _index;
}

/**
 * Fuzzy search across the command index.
 * Returns scored, sorted results.
 */
export function searchCommands(query, activeWorkspace, limit = 14) {
  const index = getCommandIndex();
  if (!query || !query.trim()) return [];

  const q = query.toLowerCase().trim();

  // Workspace Isolation™ — scope navigation results to the active
  // workspace. Global commands (print, theme, signout, …) remain
  // available regardless of workspace.
  const scoped = activeWorkspace
    ? index.filter((item) => item.type === "command" || item.workspace === activeWorkspace)
    : index;

  return scoped
    .map((item) => {
      const title = item.title.toLowerCase();
      const subtitle = (item.subtitle || "").toLowerCase();
      const category = item.category.toLowerCase();
      const wsLabel = (item.workspaceLabel || "").toLowerCase();

      let score = 0;
      if (title === q) score += 300;
      if (title.startsWith(q)) score += 200;
      if (title.includes(q)) score += 120;
      if (subtitle.includes(q)) score += 40;
      if (category.includes(q)) score += 30;
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

      return { ...item, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Resolve recent history paths into full command items.
 */
export function getRecentCommands(limit = 6, activeWorkspace) {
  const recent = getRecent(limit);
  const index = getCommandIndex();
  return recent
    .map((r) => {
      const item = index.find((i) => i.path === r.path);
      return item ? { ...item, timestamp: r.timestamp } : null;
    })
    .filter(Boolean)
    .filter((item) => !activeWorkspace || item.type === "command" || item.workspace === activeWorkspace);
}