import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Store, Loader2, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MarketplaceCard from "@/components/marketplace/MarketplaceCard";
import MarketplaceDetail from "@/components/marketplace/MarketplaceDetail";

const TYPE_FILTERS = [
  { id: "all", label: "All" },
  { id: "learning_path", label: "Learning Paths" },
  { id: "company_pack", label: "Company Packs" },
  { id: "interview_pack", label: "Interview Packs" },
  { id: "certification_track", label: "Certifications" },
  { id: "executive_playbook", label: "Playbooks" },
  { id: "presentation_template", label: "Templates" },
  { id: "case_study", label: "Case Studies" },
  { id: "industry_framework", label: "Frameworks" },
];

export default function Marketplace() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    base44.entities.MarketplaceItem.list("sort_order", 200)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((item) => {
    const matchType = filter === "all" || item.type === filter;
    const matchSearch = !search || item.title?.toLowerCase().includes(search.toLowerCase()) || item.description?.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  const featured = filtered.filter((i) => i.featured);
  const regular = filtered.filter((i) => !i.featured);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Store size={12} className="text-indigo-400" />
          EXECLEAD Marketplace™
        </div>
        <h1 className="text-2xl font-bold text-white">Premium Leadership Content</h1>
        <p className="text-white/40 text-sm mt-1">Learning paths, company packs, interview prep, playbooks, templates, and frameworks.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search marketplace..."
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f.id ? "bg-indigo-500/15 text-indigo-400" : "bg-white/5 text-white/40 hover:text-white/70"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-indigo-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Store size={32} className="mx-auto text-white/10 mb-4" />
          <p className="text-white/30 text-sm">No items found. Try a different search or filter.</p>
        </div>
      ) : (
        <>
          {featured.length > 0 && filter === "all" && !search && (
            <div>
              <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">Featured</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {featured.map((item) => <MarketplaceCard key={item.id} item={item} onClick={() => setSelected(item)} />)}
              </div>
            </div>
          )}

          <div>
            {featured.length > 0 && filter === "all" && !search && <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3">All Content</h2>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(filter === "all" && !search ? regular : filtered).map((item) => <MarketplaceCard key={item.id} item={item} onClick={() => setSelected(item)} />)}
            </div>
          </div>
        </>
      )}

      <AnimatePresence>
        {selected && <MarketplaceDetail item={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}