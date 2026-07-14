/**
 * EXEC™ Operating System™ — Global Breadcrumb Engine™
 * ============================================================
 * Automatically derives the breadcrumb trail (Platform >
 * Workspace > Module > Section) from the current route using
 * the workspace navigation registry. Every crumb is clickable.
 */

import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { WORKSPACE_NAV, WORKSPACES, WORKSPACE_HOME } from "@/lib/workspaces";
import { useUniversalRouter } from "@/lib/universalRouter";

function getBreadcrumbTrail(pathname) {
  // Exact match first
  for (const [wsId, groups] of Object.entries(WORKSPACE_NAV)) {
    for (const group of groups) {
      for (const item of group.items) {
        if (item.path === pathname) {
          return buildTrail(wsId, group, item);
        }
      }
    }
  }
  // Prefix match (e.g. /academy/lesson-1 matches /academy)
  for (const [wsId, groups] of Object.entries(WORKSPACE_NAV)) {
    for (const group of groups) {
      for (const item of group.items) {
        if (pathname.startsWith(item.path + "/")) {
          return buildTrail(wsId, group, item);
        }
      }
    }
  }
  return null;
}

function buildTrail(wsId, group, item) {
  const ws = WORKSPACES[wsId];
  return [
    { label: ws?.label || wsId, path: WORKSPACE_HOME[wsId] || "/" },
    { label: group.label, path: null },
    { label: item.label, path: item.path },
  ];
}

export default function GlobalBreadcrumbs({ className }) {
  const location = useLocation();
  const { navigateTo } = useUniversalRouter();

  const trail = useMemo(() => getBreadcrumbTrail(location.pathname), [location.pathname]);

  if (!trail || trail.length === 0) return null;

  const handleCrumbClick = (e, path) => {
    if (!path) return;
    e.preventDefault();
    navigateTo(path);
  };

  return (
    <nav className={`flex items-center gap-1.5 text-xs px-1 py-1 overflow-x-auto ${className || ""}`}>
      <ShieldCheck size={12} className="text-indigo-400/50 flex-shrink-0" />
      {trail.map((crumb, i) => (
        <React.Fragment key={i}>
          {i > 0 && <ChevronRight size={11} className="text-white/15 flex-shrink-0" />}
          {crumb.path ? (
            <a
              href={crumb.path}
              onClick={(e) => handleCrumbClick(e, crumb.path)}
              className="text-white/40 hover:text-white/80 transition-colors whitespace-nowrap"
            >
              {crumb.label}
            </a>
          ) : (
            <span className="text-white/25 whitespace-nowrap">{crumb.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}