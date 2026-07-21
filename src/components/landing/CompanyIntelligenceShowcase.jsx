import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import {
  Search, Building2, Sparkles, Users, Crown, Cloud, Brain,
  ArrowRight, Target, GitCompare, BadgeCheck, Plus, MapPin,
  ShieldCheck, TrendingUp, Lock,
} from "lucide-react";
import CompanyRequestModal from "@/components/companies/CompanyRequestModal";
import CompanyAvatar from "@/components/companies/CompanyAvatar";

const VALUE_PROPS = [
  { icon: Brain, title: "AI-Grade Intelligence", desc: "Executive-ready insights on strategy, leadership, and digital transformation." },
  { icon: ShieldCheck, title: "Governance Scores", desc: "AI maturity, cloud posture, and leadership benchmarks per organization." },
  { icon: TrendingUp, title: "Career Alignment", desc: "Set target companies, compare roles, and align your readiness roadmap." },
];

const SEARCH_EXAMPLES = ["Microsoft", "Accenture", "Google", "Amazon", "JPMorgan"];

export default function CompanyIntelligenceShowcase() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showRequest, setShowRequest] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await base44.entities.Company.filter({ status: "approved" }, "name", 500);
        // Featured: verified/partner companies first, then fill to 4
        const featured = list
          .filter(c => c.profile_status === "verified" || c.profile_status === "official_partner")
          .slice(0, 4);
        const picks = featured.length >= 4 ? featured : [...featured, ...list.filter(c => !featured.includes(c))].slice(0, 4);
        setCompanies(picks);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  const total = companies.length;

  const handleCompanyClick = (e, companyId) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate("/register");
    }
  };

  const exploreHref = isAuthenticated ? "/company-library" : "/register";

  const goSearch = () => {
    const dest = isAuthenticated ? "/company-library" : "/register";
    const params = isAuthenticated && search ? `?q=${encodeURIComponent(search)}` : "";
    window.location.href = `${dest}${params}`;
  };

  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 bg-white/[0.01]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs text-indigo-300 mb-5">
            <Sparkles size={12} /> Company Intelligence™ · Premium Preview
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Global Executive Company Intelligence
          </h2>
          <p className="text-white/40 max-w-3xl mx-auto leading-relaxed">
            Access executive-grade intelligence across Fortune 500, Global 2000, Big Four, FAANG, and leading enterprises — AI strategy, governance posture, leadership benchmarks, and career alignment in one place.
          </p>
        </div>

        {/* Value Proposition */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {VALUE_PROPS.map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-white/[0.02] border border-white/5 rounded-xl p-5"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
                <v.icon size={16} className="text-indigo-400" />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">{v.title}</h4>
              <p className="text-xs text-white/40 leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Search (teaser) */}
        <div className="max-w-2xl mx-auto mb-10">
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
              <button
                key={ex}
                onClick={() => { setSearch(ex); }}
                className="px-2.5 py-1 rounded-full text-[11px] text-white/40 bg-white/[0.03] border border-white/5 hover:text-indigo-300 hover:border-indigo-500/20 transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Company Cards (max 4) */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {companies.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={isAuthenticated ? `/company-library/${c.id}` : "/register"}
                  onClick={(e) => handleCompanyClick(e, c.id)}
                  className="group block bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/5 rounded-2xl p-5 hover:border-indigo-500/20 hover:from-white/[0.06] transition-all duration-300 h-full"
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

                  {/* CTA */}
                  <div className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    {isAuthenticated ? (
                      <>View Intelligence <ArrowRight size={12} /></>
                    ) : (
                      <><Lock size={12} /> Unlock Intelligence <ArrowRight size={12} /></>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Premium gate notice for guests */}
        {!isAuthenticated && (
          <div className="flex items-center justify-center gap-2 mb-6 text-white/30 text-xs">
            <Lock size={12} />
            <span>Full intelligence on 126+ organizations available after free signup</span>
          </div>
        )}

        {/* Bottom CTA row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to={exploreHref} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
            {isAuthenticated ? <>Explore All Organizations <ArrowRight size={16} /></> : <>Create Free Account <ArrowRight size={16} /></>}
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