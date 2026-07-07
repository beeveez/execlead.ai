import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Building2, Search, Filter, X, Loader2, Database } from "lucide-react";
import CompanyCollectionCard from "./CompanyCollectionCard";
import CompanyCollectionDetail from "./CompanyCollectionDetail";
import {
  COMPANY_CATEGORIES,
  RESOURCE_TYPES,
  buildCollection,
  searchCollections,
  filterCollections,
  getUniqueValues,
} from "@/lib/companyMarketplace";

const ACCESS_OPTIONS = [
  { value: "all", label: "All Access" },
  { value: "owned", label: "Owned" },
  { value: "not_owned", label: "Not Owned" },
];

const PRICE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
  { value: "enterprise", label: "Enterprise" },
];

export default function CompanyCollections({ isEnterprise, ownedCollectionNames, onFilterMarketplace }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [industry, setIndustry] = useState("All");
  const [country, setCountry] = useState("All");
  const [resourceType, setResourceType] = useState("All");
  const [access, setAccess] = useState("all");
  const [price, setPrice] = useState("all");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const results = await base44.entities.Company.filter({
          status: "approved",
        }, "-quality_score", 500);
        setCompanies(results || []);
      } catch (e) {
        setCompanies([]);
      }
      setLoading(false);
    };
    load();
  }, []);

  const collections = useMemo(
    () => companies.map((c) => buildCollection(c, ownedCollectionNames, isEnterprise)),
    [companies, ownedCollectionNames, isEnterprise]
  );

  const industries = useMemo(() => getUniqueValues(collections, "industry"), [collections]);
  const countries = useMemo(() => getUniqueValues(collections, "country"), [collections]);

  const filtered = useMemo(() => {
    let result = searchCollections(collections, search);
    result = filterCollections(result, { category, industry, country, resourceType, access, price });
    return result;
  }, [collections, search, category, industry, country, resourceType, access, price]);

  const hasActiveFilter =
    search || category !== "All" || industry !== "All" || country !== "All" ||
    resourceType !== "All" || access !== "all" || price !== "all";

  const clearAll = () => {
    setSearch(""); setCategory("All"); setIndustry("All"); setCountry("All");
    setResourceType("All"); setAccess("all"); setPrice("all");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Building2 size={14} className="text-cyan-400" />
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Company Collections</h2>
          <span className="text-[10px] text-white/20 bg-white/5 px-2 py-0.5 rounded-full">
            {collections.length} organizations
          </span>
        </div>
        {loading && <Loader2 size={14} className="animate-spin text-white/30" />}
      </div>

      {/* Sync indicator */}
      <div className="flex items-center gap-2 mb-3 text-[11px] text-white/30">
        <Database size={11} className="text-emerald-400" />
        <span>Synced with Company Intelligence — new organizations appear automatically</span>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by company, industry, technology, country, leadership style, cloud, or executive role..."
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
        />
      </div>

      {/* Category Chips */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Filter size={14} className="text-white/30" />
        <button
          onClick={() => setCategory("All")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${category === "All" ? "bg-cyan-500/15 text-cyan-400" : "bg-white/5 text-white/40 hover:text-white/70"}`}
        >
          All Categories
        </button>
        {COMPANY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${category === cat ? "bg-cyan-500/15 text-cyan-400" : "bg-white/5 text-white/40 hover:text-white/70"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <select value={industry} onChange={(e) => setIndustry(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/60 focus:outline-none focus:ring-1 focus:ring-cyan-500/50">
          {industries.map((v) => <option key={v} value={v} className="bg-[#0d0d14]">{v === "All" ? "All Industries" : v}</option>)}
        </select>
        <select value={country} onChange={(e) => setCountry(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/60 focus:outline-none focus:ring-1 focus:ring-cyan-500/50">
          {countries.map((v) => <option key={v} value={v} className="bg-[#0d0d14]">{v === "All" ? "All Countries" : v}</option>)}
        </select>
        <select value={resourceType} onChange={(e) => setResourceType(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/60 focus:outline-none focus:ring-1 focus:ring-cyan-500/50">
          <option value="All" className="bg-[#0d0d14]">All Resource Types</option>
          {RESOURCE_TYPES.map((rt) => <option key={rt.key} value={rt.key} className="bg-[#0d0d14]">{rt.label}</option>)}
        </select>
        <div className="flex gap-1">
          {ACCESS_OPTIONS.map((a) => (
            <button key={a.value} onClick={() => setAccess(a.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${access === a.value ? "bg-cyan-500/15 text-cyan-400" : "bg-white/5 text-white/40 hover:text-white/70"}`}>
              {a.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {PRICE_OPTIONS.map((p) => (
            <button key={p.value} onClick={() => setPrice(p.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${price === p.value ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-white/40 hover:text-white/70"}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters + Result Count */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-white/30">
          {filtered.length} {filtered.length === 1 ? "collection" : "collections"} available
        </span>
        {hasActiveFilter && (
          <button onClick={clearAll} className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors">
            <X size={12} /> Clear filters
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <Building2 size={28} className="mx-auto text-white/10 mb-3" />
          <p className="text-white/40 text-sm mb-1">No company collections match your filters.</p>
          <button onClick={clearAll} className="text-cyan-400 text-xs hover:text-cyan-300 transition-colors">Clear all filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((c) => (
            <CompanyCollectionCard key={c.id} collection={c} onClick={() => setSelected(c)} />
          ))}
        </div>
      )}

      <CompanyCollectionDetail
        collection={selected}
        onClose={() => setSelected(null)}
        onFilterMarketplace={onFilterMarketplace}
      />
    </div>
  );
}