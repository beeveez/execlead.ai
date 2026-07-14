import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { DOC_CATEGORIES } from "@/lib/developerPortalEngine";
import { isImmutableEntity } from "@/lib/entityGovernancePolicy";
import { Lock } from "lucide-react";

const STORAGE_KEY = "developer_portal_expanded_categories";

function loadExpanded() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { architecture: true };
}

export default function DocSidebar({
  docs, entityNames, selectedDoc,
  onSelectDoc, onCategoryToggle, searchResults, searchQuery,
}) {
  const [expanded, setExpanded] = useState(loadExpanded);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(expanded)); } catch {}
  }, [expanded]);

  const toggle = (catId) => {
    setExpanded(prev => ({ ...prev, [catId]: !prev[catId] }));
    onCategoryToggle?.(catId);
  };

  const handleKeyDown = (e, catId) => {
    switch (e.key) {
      case "ArrowRight":
        e.preventDefault();
        setExpanded(prev => ({ ...prev, [catId]: true }));
        break;
      case "ArrowLeft":
        e.preventDefault();
        setExpanded(prev => ({ ...prev, [catId]: false }));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        toggle(catId);
        break;
    }
  };

  const getCount = (catId) => {
    if (catId === "entities" || catId === "data-models") return entityNames.length;
    return docs.filter(d => d.category === catId).length;
  };

  // Search mode
  if (searchQuery) {
    return (
      <div className="w-72 border-r border-white/5 bg-white/[0.01] overflow-y-auto flex-shrink-0">
        <div className="p-3 text-[10px] uppercase tracking-widest text-white/30">
          {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
        </div>
        {searchResults.length === 0 ? (
          <div className="px-3 py-4 text-sm text-white/20">No results found.</div>
        ) : (
          searchResults.map(d => (
            <button
              key={d.id}
              onClick={() => onSelectDoc(d)}
              className={`w-full text-left px-3 py-1.5 pl-7 text-xs truncate transition-colors ${
                selectedDoc?.id === d.id ? "text-indigo-300 bg-indigo-500/5" : "text-white/40 hover:text-white/60 hover:bg-white/[0.02]"
              }`}
            >
              {d.title}
            </button>
          ))
        )}
      </div>
    );
  }

  return (
    <div
      role="tree"
      aria-label="Documentation categories"
      className="w-72 border-r border-white/5 bg-white/[0.01] overflow-y-auto flex-shrink-0"
    >
      {DOC_CATEGORIES.map(cat => {
        const isExpanded = !!expanded[cat.id];
        const count = getCount(cat.id);
        const panelId = `tree-panel-${cat.id}`;

        return (
          <div key={cat.id} role="treeitem" aria-expanded={isExpanded}>
            <button
              onClick={() => toggle(cat.id)}
              onKeyDown={(e) => handleKeyDown(e, cat.id)}
              tabIndex={0}
              aria-expanded={isExpanded}
              aria-controls={panelId}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
                isExpanded
                  ? "text-indigo-300 bg-indigo-500/5"
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.02]"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <ChevronRight
                  size={12}
                  className="transition-transform duration-200 ease-out"
                  style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}
                />
                {cat.label}
              </span>
              <span className="text-[10px] text-white/20 font-mono">{count}</span>
            </button>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  id={panelId}
                  role="group"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="pb-2">
                    {cat.dynamic ? (
                      entityNames.length === 0 ? (
                        <div className="px-3 py-2 text-[11px] text-white/20 italic">Discovering…</div>
                      ) : (
                        entityNames.map(name => (
                          <button
                            key={`entity-${name}`}
                            onClick={() => onSelectDoc({ id: `entity-${name}`, title: name, category: cat.id, isEntity: true })}
                            className={`w-full text-left px-3 py-1.5 pl-7 text-xs truncate transition-colors flex items-center gap-1.5 ${
                              selectedDoc?.id === `entity-${name}` ? "text-indigo-300 bg-indigo-500/5" : "text-white/40 hover:text-white/60 hover:bg-white/[0.02]"
                            }`}
                          >
                            {isImmutableEntity(name) && (
                              <Lock size={9} className="text-red-400 shrink-0" />
                            )}
                            <span className="truncate">{name}</span>
                          </button>
                        ))
                      )
                    ) : (
                      docs.filter(d => d.category === cat.id).map(d => (
                        <button
                          key={d.id}
                          onClick={() => onSelectDoc(d)}
                          className={`w-full text-left px-3 py-1.5 pl-7 text-xs truncate transition-colors ${
                            selectedDoc?.id === d.id ? "text-indigo-300 bg-indigo-500/5" : "text-white/40 hover:text-white/60 hover:bg-white/[0.02]"
                          }`}
                        >
                          {d.title}
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}