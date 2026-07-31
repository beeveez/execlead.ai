import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, Sparkles, X } from "lucide-react";
import {
  buildOutcomeTree, flattenNavItems, computeStage, computeQuickActions,
  universalSearch, trackVisit, EXEC_PROMPTS,
} from "@/lib/navigationIntelligence";

// OutcomeSidebar — Navigation Intelligence™
// ≤7 outcome destinations, progressively-disclosed child capabilities,
// universal search, EXEC™ guide entry, and adaptive quick actions.
export default function OutcomeSidebar({
  navGroups, brokenNavPaths, pathname, isEnterprise, onNavigate, mobile,
}) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(() => {
    // auto-expand the outcome matching the active route
    try {
      const active = navGroups?.flatMap((g) => g.items || []).find((i) => i.path === pathname);
      if (!active) return {};
    } catch {}
    return {};
  });

  // Track engagement for progressive disclosure
  useEffect(() => { trackVisit(pathname); }, [pathname]);

  const stage = useMemo(() => computeStage(), [pathname]);
  const flatItems = useMemo(() => flattenNavItems(navGroups), [navGroups]);
  const outcomes = useMemo(
    () => buildOutcomeTree({ flatItems, stage, isEnterprise, brokenNavPaths: brokenNavPaths, pathname }),
    [flatItems, stage, isEnterprise, brokenNavPaths, pathname]
  );
  const quickActions = useMemo(() => computeQuickActions(pathname), [pathname]);
  const searchResults = useMemo(() => universalSearch(query), [query]);

  // Auto-expand active outcome
  useEffect(() => {
    const match = Object.values(ROUTE_HINT).find((r) => pathname?.startsWith(r));
    if (match) {
      const oid = Object.entries(ROUTE_HINT).find(([, r]) => r === match)?.[0];
      if (oid) setExpanded((e) => ({ ...e, [oid]: true }));
    }
  }, [pathname]);

  const toggle = (id) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  const rootCls = mobile ? "" : "flex-1 p-3 overflow-y-auto";

  return (
    <nav className={rootCls}>
      {/* Universal Search */}
      <div className="relative mb-3 px-1">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search experiences…"
          className="w-full bg-white/[0.03] border border-white/8 rounded-lg pl-8 pr-7 py-2 text-[12px] text-white placeholder:text-white/30 focus:outline-none focus:border-accent-orange/40 transition-colors"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
            <X size={13} />
          </button>
        )}
      </div>

      {/* Search results override the outcome list */}
      {query && searchResults.length > 0 ? (
        <div className="space-y-0.5 mb-4">
          <div className="px-3 pb-1 text-[10px] uppercase tracking-wider text-white/30">Results</div>
          {searchResults.map((r) => (
            <Link key={r.path} to={r.path} onClick={onNavigate}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] text-white/65 hover:text-white hover:bg-white/5 transition-colors group">
              <r.icon size={15} className="text-white/30 group-hover:text-accent-orange/70" />
              <span className="flex-1 truncate">{r.label}</span>
              <span className="text-[9px] text-white/25">{r.section}</span>
            </Link>
          ))}
        </div>
      ) : query ? (
        <div className="px-3 py-4 text-[12px] text-white/30 text-center mb-4">No experiences match “{query}”.</div>
      ) : null}

      {!query && (
        <>
          {/* Quick Actions */}
          <div className="px-1 mb-4">
            <div className="px-2 pb-1.5 text-[10px] uppercase tracking-wider text-white/30">Quick Actions</div>
            <div className="flex flex-wrap gap-1.5">
              {quickActions.map((a) => (
                <Link key={a.label} to={a.path} onClick={onNavigate}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/8 text-[11px] text-white/60 hover:text-white hover:border-accent-orange/30 transition-colors">
                  <a.icon size={12} className="text-accent-orange/60" /> {a.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Outcomes */}
          <div className="space-y-0.5">
            {outcomes.map((outcome) => {
              const isActive = pathname === outcome.route || pathname?.startsWith(outcome.route + "/");
              const isOpen = expanded[outcome.id] || isActive;
              const hasChildren = outcome.children.length > 0;
              return (
                <div key={outcome.id}>
                  <div className="flex items-stretch">
                    <Link to={outcome.route} onClick={onNavigate}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 flex-1 text-[13px] ${isActive ? "bg-accent-orange/10 text-accent-orange" : "text-white/55 hover:text-white hover:bg-white/5"}`}>
                      <outcome.icon size={17} className={isActive ? "text-accent-orange" : "text-white/35"} />
                      {outcome.label}
                    </Link>
                    {hasChildren && (
                      <button onClick={() => toggle(outcome.id)}
                        className={`flex items-center px-2 rounded-lg transition-colors ${isOpen ? "text-accent-orange/60" : "text-white/25 hover:text-white/50"}`}>
                        <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                    )}
                  </div>
                  <AnimatePresence initial={false}>
                    {isOpen && hasChildren && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }} className="overflow-hidden">
                        <div className="ml-5 pl-3 border-l border-white/8 space-y-0.5 mt-1 mb-1.5">
                          {outcome.children.map((c) => {
                            const childActive = pathname === c.path;
                            return (
                              <Link key={c.path} to={c.path} onClick={onNavigate}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] transition-colors ${childActive ? "bg-white/5 text-white" : "text-white/45 hover:text-white/80 hover:bg-white/5"}`}>
                                {c.icon && <c.icon size={14} className="text-white/30" />}
                                <span className="flex-1 truncate">{c.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* EXEC™ Guide */}
          <div className="mt-5 mx-1">
            <Link to="/coach" onClick={onNavigate}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-gradient-to-r from-accent-orange/10 to-transparent border border-accent-orange/20 text-[12px] text-white/70 hover:border-accent-orange/40 transition-colors">
              <Sparkles size={15} className="text-accent-orange" />
              <div className="flex-1">
                <div className="font-medium text-white/85">Ask EXEC™</div>
                <div className="text-[10px] text-white/40">Your navigation intelligence</div>
              </div>
            </Link>
            <div className="flex flex-wrap gap-1 mt-2">
              {EXEC_PROMPTS.slice(0, 3).map((p) => (
                <Link key={p} to="/coach" onClick={onNavigate}
                  className="text-[10px] px-2 py-1 rounded-md bg-white/[0.03] text-white/35 hover:text-white/70 hover:bg-white/5 transition-colors">
                  {p}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}

// Hint: which outcome a path belongs to (for auto-expand). Mirrors OUTCOMES routes.
const ROUTE_HINT = {
  dashboard: "/dashboard",
  journey: "/executive-readiness",
  practice: "/coach",
  growth: "/evidence-vault",
  portfolio: "/executive-portfolio",
  enterprise: "/enterprise",
  settings: "/settings",
};