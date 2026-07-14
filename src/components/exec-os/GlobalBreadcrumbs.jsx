/**
 * EXEC™ Operating System™ — Global Breadcrumb Engine™ v2.0
 * ============================================================
 * Automatically derives the breadcrumb trail (Workspace >
 * Section > Current Page) from the current route using the
 * workspace navigation registry.
 *
 * Every parent breadcrumb is clickable and navigates via the
 * Universal Workspace Router™. Only the current page is
 * non-clickable (aria-current="page").
 *
 * Accessibility: Tab navigation, Enter/Space activation,
 * ARIA labels, keyboard focus states, and tooltips.
 */

import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { getBreadcrumbTrail } from "@/lib/navigationRegistry";
import { useUniversalRouter } from "@/lib/universalRouter";

export default function GlobalBreadcrumbs({ className }) {
  const location = useLocation();
  const { navigateTo } = useUniversalRouter();

  const trail = useMemo(() => getBreadcrumbTrail(location.pathname), [location.pathname]);

  if (!trail || trail.length === 0) return null;

  const handleCrumbClick = (e, path) => {
    e.preventDefault();
    navigateTo(path);
  };

  const handleKeyDown = (e, path) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigateTo(path);
    }
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1.5 text-xs px-1 py-1 overflow-x-auto ${className || ""}`}
    >
      <ShieldCheck size={12} className="text-indigo-400/50 flex-shrink-0" aria-hidden="true" />
      <ol className="flex items-center gap-1.5 list-none m-0 p-0">
        {trail.map((crumb, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <ChevronRight size={11} className="text-white/15 flex-shrink-0" aria-hidden="true" />
            )}
            <li className="flex items-center">
              {crumb.isCurrent || !crumb.path ? (
                <span
                  className="text-white/70 font-medium whitespace-nowrap"
                  aria-current="page"
                >
                  {crumb.label}
                </span>
              ) : (
                <a
                  href={crumb.path}
                  onClick={(e) => handleCrumbClick(e, crumb.path)}
                  onKeyDown={(e) => handleKeyDown(e, crumb.path)}
                  title={`Go to ${crumb.label}`}
                  aria-label={`Go to ${crumb.label}`}
                  className="text-white/40 hover:text-white/80 hover:underline underline-offset-2 decoration-white/30 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-400/50 focus:rounded transition-colors whitespace-nowrap"
                >
                  {crumb.label}
                </a>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}