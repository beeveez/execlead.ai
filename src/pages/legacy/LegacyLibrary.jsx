import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { BookOpen, Search, PenLine, Loader2, Sparkles, Filter, X } from "lucide-react";
import LegacyLetterCard from "@/components/legacy/LegacyLetterCard";
import { LETTER_CATEGORIES, CURATED_COLLECTIONS, LEADERSHIP_LEVELS, INDUSTRIES } from "@/lib/legacyLibrary";

export default function LegacyLibrary() {
  const { user } = useAuth();
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [industry, setIndustry] = useState("");
  const [level, setLevel] = useState("");
  const [collection, setCollection] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    base44.entities.LeadershipLetter.filter({ status: "published" }, "-views", 200)
      .then(setLetters)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return letters.filter((l) => {
      if (category && l.category !== category) return false;
      if (industry && l.industry !== industry) return false;
      if (level && l.leadership_level !== level) return false;
      if (collection && !(l.curated_collections || []).includes(collection)) return false;
      if (search) {
        const q = search.toLowerCase();
        const haystack = `${l.title} ${l.subtitle} ${l.message} ${l.author_name} ${l.organization} ${l.country} ${(l.tags || []).join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [letters, search, category, industry, level, collection]);

  const featured = filtered.filter((l) => l.featured).slice(0, 3);
  const rest = filtered.filter((l) => !l.featured);
  const hasFilters = category || industry || level || collection || search;

  const clearFilters = () => {
    setCategory(""); setIndustry(""); setLevel(""); setCollection(""); setSearch("");
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero */}
      <div className="text-center py-8 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-4">
          <BookOpen size={14} className="text-indigo-400" />
          <span className="text-indigo-400 text-xs font-medium">Leadership Legacy Library</span>
        </motion.div>
        <h1 className="text-3xl md:text-5xl font-bold mb-3">Letters to the Next Generation of Leaders</h1>
        <p className="text-white/40 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          Timeless leadership wisdom from verified executives, founders, and advisors. Every lesson preserved for future generations.
        </p>
      </div>

      {/* Write CTA */}
      <div className="flex justify-center mb-8">
        <Link to="/legacy-library/new" className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm">
          <PenLine size={16} /> Write a Leadership Letter
        </Link>
      </div>

      {/* Collections */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
          <button
            onClick={() => setCollection("")}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!collection ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20" : "bg-white/5 text-white/40 hover:text-white/70 border border-transparent"}`}
          >
            All Letters
          </button>
          {CURATED_COLLECTIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCollection(collection === c.id ? "" : c.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${collection === c.id ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20" : "bg-white/5 text-white/40 hover:text-white/70 border border-transparent"}`}
            >
              <span>{c.icon}</span> {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by topic, author, company, or keyword…"
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1.5 px-4 h-10 rounded-lg text-sm bg-white/5 border border-white/10 text-white/60 hover:text-white/90"
        >
          <Filter size={14} /> Filters {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
        </button>
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden mb-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FilterSelect label="Category" value={category} onChange={setCategory} options={LETTER_CATEGORIES} />
            <FilterSelect label="Industry" value={industry} onChange={setIndustry} options={INDUSTRIES} />
            <FilterSelect label="Leadership Level" value={level} onChange={setLevel} options={LEADERSHIP_LEVELS} />
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 mt-2 text-xs text-white/40 hover:text-white/60">
              <X size={12} /> Clear all filters
            </button>
          )}
        </motion.div>
      )}

      {/* Letters */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={32} className="text-indigo-400/30 mx-auto mb-3" />
          <p className="text-white/30 text-sm">{hasFilters ? "No letters match your filters." : "No letters published yet."}</p>
          {hasFilters && <button onClick={clearFilters} className="text-indigo-400 text-sm mt-2 hover:underline">Clear filters</button>}
        </div>
      ) : (
        <>
          {featured.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-amber-400" />
                <h2 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Featured Letters</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featured.map((l, i) => <LegacyLetterCard key={l.id} letter={l} index={i} />)}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map((l, i) => <LegacyLetterCard key={l.id} letter={l} index={i} />)}
          </div>
        </>
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-white/40 text-xs mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-9 text-sm text-white/90 focus:outline-none focus:border-indigo-500/50"
      >
        <option value="" className="bg-[#0d0d14]">All</option>
        {options.map((o) => <option key={o} value={o} className="bg-[#0d0d14]">{o}</option>)}
      </select>
    </div>
  );
}