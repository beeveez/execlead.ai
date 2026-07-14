import React from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { getNavEntriesBySection } from "@/lib/navigationRegistry";
import { WORKSPACES, WORKSPACE_HOME } from "@/lib/workspaces";
import { ArrowLeft, ChevronRight } from "lucide-react";

/**
 * SectionHome — dynamic landing page for a workspace section.
 *
 * Generated entirely from the Navigation Registry™. Renders all
 * navigation items belonging to the requested workspace + section
 * as clickable cards.
 *
 * Route: /section/:workspaceId/:section
 */
export default function SectionHome() {
  const { workspaceId, section } = useParams();
  const decodedSection = decodeURIComponent(section || "");

  const ws = WORKSPACES[workspaceId];
  const wsHome = WORKSPACE_HOME[workspaceId] || "/";
  const items = getNavEntriesBySection(workspaceId, decodedSection);

  if (!ws || items.length === 0) {
    return <Navigate to={wsHome} replace />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link
        to={wsHome}
        className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
      >
        <ArrowLeft size={12} /> Back to {ws.label}
      </Link>

      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <ws.icon size={12} style={{ color: ws.color }} />
          {ws.label}
        </div>
        <h1 className="text-2xl font-bold text-white">{decodedSection}</h1>
        <p className="text-white/40 text-sm mt-1">
          {items.length} {items.length === 1 ? "item" : "items"} in this section
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <Link
            key={item.route}
            to={item.route}
            className="group flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all"
          >
            {item.icon && (
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <item.icon size={18} className="text-white/40 group-hover:text-white/60 transition-colors" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                {item.title}
              </div>
              <div className="text-xs text-white/30 truncate">{item.route}</div>
            </div>
            <ChevronRight size={16} className="text-white/20 group-hover:text-white/40 transition-colors flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}