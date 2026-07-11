import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Clock, Sparkles, Compass, Check } from "lucide-react";
import {
  COMPETENCY_CATEGORIES,
  searchCompetencies,
  getByCategory,
  getRecentlyUsed,
  getSuggested,
  getPopular,
  getCategoryById,
} from "@/lib/competencyCatalog";

const TABS = [
  { id: "search", label: "Search", icon: Search },
  { id: "browse", label: "Browse", icon: Compass },
  { id: "recent", label: "Recent", icon: Clock },
  { id: "suggested", label: "Suggested", icon: Sparkles },
];

export default function CompetencyPicker({ isOpen, onClose, onAdd, existingNames = [], targetRole, userId }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("search");
  const [selectedCategory, setSelectedCategory] = useState(COMPETENCY_CATEGORIES[0].id);

  const results = useMemo(() => {
    if (tab === "search") {
      return query ? searchCompetencies(query, existingNames) : getPopular(existingNames);
    }
    if (tab === "browse") return getByCategory(selectedCategory, existingNames);
    if (tab === "recent") {
      return getRecentlyUsed(userId)
        .map((n) => {
          const comp = existingNames.includes(n) ? null : searchCompetencies(n, [])[0];
          return comp && !existingNames.includes(comp.name) ? comp : null;
        })
        .filter(Boolean);
    }
    if (tab === "suggested") return getSuggested(targetRole, existingNames);
    return [];
  }, [tab, query, selectedCategory, existingNames, targetRole, userId]);

  const handleAdd = (comp) => {
    onAdd(comp);
    setQuery("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#0d0d14] border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[600px]"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
              <h3 className="text-white font-semibold text-sm">Add Executive Competency</h3>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/80 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Search bar */}
            <div className="p-3 border-b border-white/5 flex-shrink-0">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (e.target.value && tab !== "search") setTab("search");
                  }}
                  placeholder="Search competencies..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="px-3 pt-2 flex gap-1 border-b border-white/5 flex-shrink-0">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                    tab === t.id
                      ? "text-indigo-400 border-indigo-400"
                      : "text-white/40 border-transparent hover:text-white/70"
                  }`}
                >
                  <t.icon size={13} />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Category chips (browse tab) */}
            {tab === "browse" && (
              <>
                <div className="px-3 py-2 flex gap-1.5 flex-wrap border-b border-white/5 flex-shrink-0">
                  {COMPETENCY_CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all ${
                        selectedCategory === c.id
                          ? "text-white"
                          : "text-white/40 border-white/10 bg-white/[0.02] hover:bg-white/5"
                      }`}
                      style={selectedCategory === c.id ? { borderColor: c.color, backgroundColor: `${c.color}15`, color: c.color } : {}}
                    >
                      <c.icon size={10} />
                      {c.label}
                    </button>
                  ))}
                </div>
                {tab === "browse" && results.length > 0 && (
                  <div className="px-3 py-1.5 border-b border-white/5 flex-shrink-0">
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-white/20 mb-1">Subcategories</p>
                    <div className="flex gap-1 flex-wrap">
                      {[...new Set(results.map((r) => r.subcategory))].map((sub) => (
                        <span key={sub} className="px-2 py-0.5 rounded text-[9px] bg-white/5 text-white/30">{sub}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-3">
              {results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((comp) => {
                    const cat = getCategoryById(comp.category);
                    const isAdded = existingNames.includes(comp.name);
                    return (
                      <button
                        key={`${comp.name}-${comp.category}`}
                        onClick={() => !isAdded && handleAdd(comp)}
                        disabled={isAdded}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left ${
                          isAdded
                            ? "border-white/5 bg-white/[0.01] opacity-40 cursor-not-allowed"
                            : "border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10"
                        }`}
                      >
                        {cat?.icon && <cat.icon size={14} style={{ color: cat.color }} className="flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white/90">{comp.name}</div>
                          <div className="text-[10px] text-white/30">{cat?.label}</div>
                        </div>
                        {isAdded ? (
                          <Check size={14} className="text-emerald-400 flex-shrink-0" />
                        ) : (
                          <span className="text-[10px] text-indigo-400 font-medium opacity-0 group-hover:opacity-100">+ Add</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-white/30 text-sm">
                    {tab === "recent" ? "No recently used competencies yet." : "No competencies found."}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}