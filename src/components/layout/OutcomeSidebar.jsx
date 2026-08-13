import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, Sparkles, X } from "lucide-react";
import {
  buildOutcomeTree, flattenNavItems, computeStage, computeQuickActions,
  universalSearch, trackVisit, getExecPrompts,
} from "@/lib/navigationIntelligence";
import { WORKSPACE_HOME } from "@/lib/workspaces";
import ExecutiveReadinessHUD from "@/components/journey/ExecutiveReadinessHUD";

// OutcomeSidebar — Navigation Intelligence™ (Workspace Isolation™)
// Executive renders its outcome-based progressive-disclosure tree.
// Developer / Operations / Enterprise render their own section
// navigation. Search, quick actions, and Ask EXEC™ prompts are all
// scoped to the active workspace — no cross-workspace leakage.
export default function OutcomeSidebar({
  navGroups, brokenNavPaths, pathname, onNavigate, mobile, activeWorkspace = "executive",
}) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(() => {
    try {
      const active = navGroups?.flatMap((g) => g.items || []).find((i) => i.path === pathname);
      if (!active) return {};
    } catch {}
    return {};
  });

  useEffect(() => { trackVisit(pathname); }, [pathname]);

  const stage = useMemo(() => computeStage(), [pathname]);
  const isExecutive = activeWorkspace === "executive";
  const flatItems = useMemo(() => flattenNavItems(navGroups), [navGroups]);
  const outcomes = useMemo(
    () => buildOutcomeTree({ flatItems, stage, brokenPaths: brokenNavPaths, pathname }),
    [flatItems, stage, brokenNavPaths, pathname]
  );
  const quickActions = useMemo(() => computeQuickActions(pathname, activeWorkspace), [pathname, activeWorkspace]);
  const searchResults = useMemo(() => universalSearch(query, activeWorkspace), [query, activeWorkspace]);
  const execPrompts = useMemo(() => getExecPrompts(activeWorkspace), [activeWorkspace]);

  // Auto-expand active outcome/section
  useEffect(() => {
    const match = Object.values(ROUTE_HINT).find((r) => pathname?.startsWith(r));
    if (match) {
      const oid = Object.entries(ROUTE_HINT).find(([, r]) => r === match)?.[0];
      if (oid) setExpanded((e) => ({ ...e, [oid]: true }));
    }
    // Section nav: expand the section containing the active route.
    if (!isExecutive) {
      navGroups?.forEach((g, idx) => {
        const hasActive = (g.items || []).some((it) => pathname === it.path || pathname?.startsWith(it.path + "/"));
        if (hasActive) setExpanded((e) => ({ ...e, [`sec-${idx}`]: true }));
      });
    }
  }, [pathname, isExecutive, navGroups]);

  const toggle = (id) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  const rootCls = mobile ? "" : "flex-1 p-3 overflow-y-auto";
  const askExecTarget = isExecutive ? "/coach" : (WORKSPACE_HOME[activeWorkspace] || "/home");

  return (
    <nav className={rootCls}>
      {/* Universal Search — scoped to the active workspace */}
      <div className="relative mb-3 px-1">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isExecutive ? "Search experiences…" : `Search ${activeWorkspace}…`}
          className="w-full bg-white/[0.03] border border-white/8 rounded-lg pl-8 pr-7 py-2 text-[12px] text-white placeholder:text-white/30 focus:outline-none focus:border-accent-orange/40 transition-colors"
        />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
            <X size={13} />
          </button>
        )}
      </div>

      {isExecutive && <ExecutiveReadinessHUD />}

      {/* Search results override the nav list */}
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
        <div className="px-3 py-4 text-[12px] text-white/30 text-center mb-4">No matches in this workspace.</div>
      ) : null}

      {!query && (
        <>
          {/* Quick Actions — scoped to the active workspace */}
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

          {/* Navigation — Executive outcome tree vs workspace section nav */}
          {isExecutive ? (
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
          ) : (
            <div className="space-y-1">
              {navGroups.map((group, idx) => {
                const key = `sec-${idx}`;
                const items = (group.items || []).filter((it) => !brokenNavPaths?.has(it.path));
                if (items.length === 0) return null;
                const hasActive = items.some((it) => pathname === it.path || pathname?.startsWith(it.path + "/"));
                const isOpen = expanded[key] || hasActive;
                return (
                  <div key={key}>
                    <button onClick={() => toggle(key)}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-[10px] uppercase tracking-wider font-semibold transition-colors ${hasActive ? "text-accent-orange" : "text-white/40 hover:text-white/70"}`}>
                      <span>{group.label}</span>
                      <ChevronDown size={13} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.16 }} className="overflow-hidden">
                          <div className="ml-3 pl-3 border-l border-white/8 space-y-0.5 mt-0.5 mb-1.5">
                            {items.map((it) => {
                              const active = pathname === it.path || pathname?.startsWith(it.path + "/");
                              return (
                                <Link key={it.path} to={it.path} onClick={onNavigate}
                                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] transition-colors ${active ? "bg-accent-orange/10 text-accent-orange" : "text-white/55 hover:text-white hover:bg-white/5"}`}>
                                  {it.icon && <it.icon size={15} className={active ? "text-accent-orange" : "text-white/35"} />}
                                  <span className="flex-1 truncate">{it.label}</span>
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
          )}

          {/* Ask EXEC™ — prompts scoped to the active workspace */}
          <div className="mt-5 mx-1">
            <Link to={askExecTarget} onClick={onNavigate}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-gradient-to-r from-accent-orange/10 to-transparent border border-accent-orange/20 text-[12px] text-white/70 hover:border-accent-orange/40 transition-colors">
              <Sparkles size={15} className="text-accent-orange" />
              <div className="flex-1">
                <div className="font-medium text-white/85">Ask EXEC™</div>
                <div className="text-[10px] text-white/40">{isExecutive ? "Your navigation intelligence" : "Your platform intelligence"}</div>
              </div>
            </Link>
            <div className="flex flex-wrap gap-1 mt-2">
              {execPrompts.slice(0, 3).map((p) => (
                <Link key={p} to={askExecTarget} onClick={onNavigate}
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

// Hint: which Executive outcome a path belongs to (for auto-expand).
const ROUTE_HINT = {
  dashboard: "/dashboard",
  journey: "/executive-readiness",
  practice: "/coach",
  growth: "/evidence-vault",
  portfolio: "/executive-portfolio",
  settings: "/settings",
};