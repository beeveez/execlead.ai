import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import {
  Search, Building2, Sparkles, Globe, Users, Crown, Cloud, Brain,
  ArrowRight, Target, GitCompare, Bookmark, BadgeCheck, Plus, MapPin, TrendingUp,
} from "lucide-react";
import CompanyRequestModal from "@/components/companies/CompanyRequestModal";
import CompanyAvatar from "@/components/companies/CompanyAvatar";

const CATEGORIES = [
  "Technology", "Cloud Providers", "Consulting", "Financial Services", "Healthcare",
  "Manufacturing", "Retail", "Energy", "Government", "Telecommunications",
  "Big Four", "FAANG", "Magnificent Seven", "Fortune 500", "Fortune Global 500", "Forbes Global 2000",
];

const SEARCH_EXAMPLES = [
  "Microsoft", "Accenture", "ServiceNow", "Top AI companies", "Healthcare organizations",
  "Companies hiring CIOs", "Cloud-first companies", "Companies using Azure", "Fortune 100",
];

const STATS = [
  { value: "126", label: "Organizations Today" },
  { value: "500+", label: "By Q4 2026" },
  { value: "2,000+", label: "Planned" },
  { value: "Weekly", label: "Updated" },
];

export default function CompanyIntelligenceShowcase() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showRequest, setShowRequest] = useState(false);

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

  const total = companies.length;
  const filtered = activeCategory === "All" ? companies.slice(0, 8) : companies.filter(c => (c.category || "").toLowerCase().includes(activeCategory.toLowerCase()) || (c.industry || "").toLowerCase().includes(activeCategory.toLowerCase())).slice(0, 8);

  const goSearch = () => {
    const params = search ? `?q=${encodeURIComponent(search)}` : "";
    window.location.href = `/company-library${params}`;
  };

  return (
    <section className="py-20 md:py-28 px-4 bg-white/[0.01]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs text-indigo-300 mb-5">
            <Sparkles size={12} /> Global Executive Company Intelligence 4.0
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Global Executive Company Intelligence
          </h2>
          <p className="text-white/40 max-w-3xl mx-auto leading-relaxed">
            Access executive intelligence across Fortune 500, Fortune Global 500, Forbes Global 2000, Big Four, FAANG, government agencies, consulting firms, and leading enterprises.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {STATS.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">{s.value}</div>
              <div className="text-white/30 text-xs mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* AI Search */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && goSearch()}
              placeholder="Search any company..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/30"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            {SEARCH_EXAMPLES.map(ex => (
              <button key={ex} onClick={() => { setSearch(ex); }} className="px-2.5 py-1 rounded-full text-[11px] text-white/40 bg-white/[0.03] border border-white/5 hover:text-indigo-300 hover:border-indigo-500/20 transition-colors">
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Category Collections */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button onClick={() => setActiveCategory("All")} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeCategory === "All" ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30" : "bg-white/[0.03] text-white/40 border border-white/5 hover:text-white/70"}`}>All</button>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeCategory === cat ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30" : "bg-white/[0.03] text-white/40 border border-white/5 hover:text-white/70"}`}>{cat}</button>
          ))}
        </div>

        {/* Premium Company Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Building2 size={28} className="mx-auto text-white/20 mb-2" />
            <p className="text-white/40 text-sm">No organizations in this collection yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {filtered.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/5 rounded-2xl p-5 hover:border-indigo-500/20 hover:from-white/[0.06] transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <CompanyAvatar company={c} size="md" />
                  {(c.profile_status === "verified" || c.profile_status === "official_partner") && (
                    <BadgeCheck size={16} className="text-emerald-400" />
                  )}
                </div>

                {/* Name + meta */}
                <h3 className="text-white font-semibold text-sm mb-1 truncate">{c.name}</h3>
                <div className="space-y-1 text-[11px] text-white/40 mb-4">
                  {c.industry && <div className="flex items-center gap-1"><Building2 size={10} /> {c.industry}</div>}
                  {c.country && <div className="flex items-center gap-1"><MapPin size={10} /> {c.country}</div>}
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-1.5 mb-4">
                  {c.employee_count > 0 && <Stat icon={Users} label="Employees" value={c.employee_count >= 1000 ? `${(c.employee_count / 1000).toFixed(0)}K` : c.employee_count} />}
                  {c.fortune_ranking && <Stat icon={Crown} label="Fortune" value={c.fortune_ranking} />}
                  <Stat icon={Cloud} label="Cloud" value={c.cloud_provider || "—"} />
                  <Stat icon={Brain} label="AI" value={c.ai_strategy ? "Active" : "—"} />
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {c.company_type && <span className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 text-white/40 border border-white/5 uppercase">{c.company_type}</span>}
                  {c.leadership_style && <span className="px-1.5 py-0.5 rounded text-[9px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 truncate max-w-full">{c.leadership_style}</span>}
                </div>

                {/* Actions */}
                <div className="space-y-1.5">
                  <Link to={`/company-library/${c.id}`} className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium transition-colors">
                    View Intelligence <ArrowRight size={12} />
                  </Link>
                  <div className="grid grid-cols-3 gap-1">
                    <Link to="/company-library" className="flex items-center justify-center py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors" title="Set as Target"><Target size={12} /></Link>
                    <Link to="/company-library" className="flex items-center justify-center py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors" title="Compare"><GitCompare size={12} /></Link>
                    <button className="flex items-center justify-center py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors" title="Save"><Bookmark size={12} /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Bottom CTA row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/company-library" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
            Explore All {total || ""} Organizations <ArrowRight size={16} />
          </Link>
          <button onClick={() => setShowRequest(true)} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-sm font-medium transition-colors">
            <Plus size={16} /> Request Company Intelligence
          </button>
        </div>

        {/* Legal compliance */}
        <p className="text-center text-white/20 text-[11px] mt-8 max-w-2xl mx-auto leading-relaxed">
          Company names, trademarks, and logos remain the property of their respective owners. EXECLEAD.AI provides independent executive intelligence and is not affiliated with or endorsed by organizations listed unless explicitly stated.
        </p>
      </div>

      {showRequest && <CompanyRequestModal open={showRequest} onClose={() => setShowRequest(false)} />}
    </section>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="bg-white/[0.02] rounded-lg px-2 py-1.5">
      <div className="flex items-center gap-1 text-white/30 text-[9px] uppercase tracking-wider"><Icon size={9} /> {label}</div>
      <div className="text-white/70 text-[11px] font-medium truncate">{value}</div>
    </div>
  );
}