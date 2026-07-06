import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Building2, Search, Loader2, GitCompare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CompanyCard from "@/components/companies/CompanyCard";
import CompanyFilters from "@/components/companies/CompanyFilters";

const EMPTY_FILTERS = { industry: "", country: "", company_size: "", leadership_style: "", executive_level_focus: "", work_model: "" };

export default function Companies() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [compareIds, setCompareIds] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await base44.entities.Company.filter({ status: "approved" }, "name", 500);
        setCompanies(list);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  const handleFilterChange = (field, value) => {
    if (field === "reset") { setFilters(EMPTY_FILTERS); return; }
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const filtered = companies.filter(c => {
    const q = search.toLowerCase();
    if (q && !c.name.toLowerCase().includes(q) && !(c.industry || "").toLowerCase().includes(q) && !(c.country || "").toLowerCase().includes(q)) return false;
    if (filters.industry && c.industry !== filters.industry) return false;
    if (filters.country && c.country !== filters.country) return false;
    if (filters.company_size && c.company_size !== filters.company_size) return false;
    if (filters.leadership_style && c.leadership_style !== filters.leadership_style) return false;
    if (filters.executive_level_focus && c.executive_level_focus !== filters.executive_level_focus) return false;
    if (filters.work_model === "remote" && !c.remote_work_friendly) return false;
    if (filters.work_model === "hybrid" && !c.hybrid_work_friendly) return false;
    return true;
  });

  const toggleCompare = (company) => {
    setCompareIds(prev => prev.includes(company.id) ? prev.filter(id => id !== company.id) : prev.length >= 4 ? prev : [...prev, company.id]);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <Building2 size={12} className="text-violet-400" /> Company Intelligence Library
          </div>
          <h1 className="text-2xl font-bold text-white">{companies.length} Organizations</h1>
          <p className="text-white/40 text-sm mt-1">Executive intelligence across Fortune 500, Global 2000, consulting, and emerging enterprises.</p>
        </div>
        {compareIds.length >= 2 && (
          <button onClick={() => navigate(`/companies/compare?ids=${compareIds.join(",")}`)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium transition-colors">
            <GitCompare size={16} /> Compare ({compareIds.length})
          </button>
        )}
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by company, industry, or country..." className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-violet-500/50" />
      </div>

      <CompanyFilters companies={companies} filters={filters} onChange={handleFilterChange} />

      {compareIds.length > 0 && compareIds.length < 2 && (
        <p className="text-xs text-white/40">Select at least 2 companies to compare (max 4).</p>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
          <Building2 size={24} className="mx-auto text-white/20 mb-2" />
          <p className="text-white/30 text-sm">No companies match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(c => (
            <CompanyCard key={c.id} company={c} selected={compareIds.includes(c.id)} onToggleCompare={toggleCompare} />
          ))}
        </div>
      )}
    </div>
  );
}