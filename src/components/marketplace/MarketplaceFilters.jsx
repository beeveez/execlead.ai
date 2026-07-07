import React from "react";
import { Search, Filter, X } from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "learning_path", label: "Learning Paths" },
  { id: "certification_track", label: "Certifications" },
  { id: "interview_pack", label: "Interview Packs" },
  { id: "company_pack", label: "Company Packs" },
  { id: "executive_playbook", label: "Playbooks" },
  { id: "presentation_template", label: "Templates" },
  { id: "case_study", label: "Case Studies" },
  { id: "industry_framework", label: "Frameworks" },
  { id: "executive_book", label: "Books" },
  { id: "ai_prompt_library", label: "AI Prompts" },
  { id: "board_pack", label: "Board Packs" },
  { id: "strategy_toolkit", label: "Strategy Toolkits" },
  { id: "executive_bundle", label: "Bundles" },
];

export default function MarketplaceFilters({
  search, setSearch,
  category, setCategory,
  difficulty, setDifficulty,
  priceFilter, setPriceFilter,
  sort, setSort,
  activeCollection, onClearCollection,
  activeBundle, onClearBundle,
}) {
  const hasActiveFilter = category !== "all" || difficulty !== "all" || priceFilter !== "all" || activeCollection || activeBundle;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, company, role, skill, or topic..."
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Filter size={14} className="text-white/30" />
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${category === c.id ? "bg-indigo-500/15 text-indigo-400" : "bg-white/5 text-white/40 hover:text-white/70"}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/50">
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
          <option value="executive">Executive</option>
        </select>
        <div className="flex gap-1">
          {["all", "free", "paid"].map((p) => (
            <button key={p} onClick={() => setPriceFilter(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${priceFilter === p ? "bg-indigo-500/15 text-indigo-400" : "bg-white/5 text-white/40 hover:text-white/70"}`}>
              {p}
            </button>
          ))}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 ml-auto">
          <option value="trending">Sort: Trending</option>
          <option value="newest">Sort: Newest</option>
          <option value="rating">Sort: Top Rated</option>
          <option value="downloads">Sort: Most Downloaded</option>
        </select>
      </div>

      {hasActiveFilter && (
        <div className="flex flex-wrap items-center gap-2">
          {activeCollection && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-cyan-500/10 text-cyan-400">
              Collection: {activeCollection}
              <button onClick={onClearCollection}><X size={11} /></button>
            </span>
          )}
          {activeBundle && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-purple-500/10 text-purple-400">
              Bundle: {activeBundle}
              <button onClick={onClearBundle}><X size={11} /></button>
            </span>
          )}
          {category !== "all" && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-indigo-500/10 text-indigo-400">
              {CATEGORIES.find((c) => c.id === category)?.label}
              <button onClick={() => setCategory("all")}><X size={11} /></button>
            </span>
          )}
          {difficulty !== "all" && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-white/5 text-white/50 capitalize">
              {difficulty}
              <button onClick={() => setDifficulty("all")}><X size={11} /></button>
            </span>
          )}
          {priceFilter !== "all" && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 capitalize">
              {priceFilter}
              <button onClick={() => setPriceFilter("all")}><X size={11} /></button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}