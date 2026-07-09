import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { COUNTRIES } from "@/lib/payments";
import { Trophy, Users, Globe, Crown, ArrowRight, Loader2, Search, MapPin, X, Award, Shield, Sparkles, ChevronDown } from "lucide-react";
import FounderCard from "@/components/founding/FounderCard";
import FoundersWallStats from "@/components/founding/FoundersWallStats";
import FoundersWallTimeline from "@/components/founding/FoundersWallTimeline";

function countryFlag(code) {
  if (!code || code.length !== 2) return "🌍";
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)));
}

const BENEFITS = [
  { icon: "💰", label: "Lifetime Discount" },
  { icon: "🏰", label: "Founder Portal" },
  { icon: "⚡", label: "Priority Feature Access" },
  { icon: "🎉", label: "Exclusive Events" },
  { icon: "👥", label: "Founder Community" },
  { icon: "🗳️", label: "Roadmap Voting" },
  { icon: "🧪", label: "Beta Features" },
  { icon: "🏆", label: "Recognition Wall" },
];

export default function FoundersWall() {
  const [data, setData] = useState({ members: [], stats: null, milestones: [] });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [prefFilter, setPrefFilter] = useState("all");

  useEffect(() => {
    base44.functions.invoke("reserveFoundingMembership", { action: "wall" })
      .then((res) => {
        const d = res.data || res;
        setData({ members: d.members || [], stats: d.stats || null, milestones: d.milestones || [] });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Build country + industry lists from data
  const countryCounts = {};
  data.members.forEach((m) => {
    if (m.country) countryCounts[m.country] = (countryCounts[m.country] || 0) + 1;
  });
  const countries = Object.entries(countryCounts)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count);

  const industries = [...new Set(data.members.map((m) => m.industry).filter(Boolean))].sort();

  // Filter members
  const filtered = data.members.filter((m) => {
    if (selectedCountry && m.country !== selectedCountry) return false;
    if (selectedIndustry && m.industry !== selectedIndustry) return false;
    if (prefFilter !== "all" && m.display_preference !== prefFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const haystack = `${m.full_name} ${m.company} ${m.profession} ${m.founding_member_number} ${m.country} ${m.industry}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  // Featured founders
  const featured = filtered.filter((m) => m.featured).slice(0, 3);
  const rest = filtered.filter((m) => !m.featured);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Hero */}
      <section className="relative pt-32 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full mb-6"
          >
            <Crown size={14} className="text-amber-400" />
            <span className="text-amber-400 text-xs font-medium">The Founding Chapter — Permanent Recognition</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold tracking-tight mb-4 leading-[1.1]"
          >
            The <span className="gold-shimmer">Founders Wall</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed"
          >
            A permanent historical record of the visionaries who believed in EXECLEAD.AI before public commercialization. These are the people who shaped our platform.
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 pb-12">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-amber-400" /></div>
          ) : (
            <FoundersWallStats stats={data.stats} />
          )}
        </div>
      </section>

      {/* Global Founders — Interactive Country Selector */}
      {!loading && countries.length > 0 && (
        <section className="px-4 pb-12">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Globe size={16} className="text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Global Founders</h3>
                {selectedCountry && (
                  <button onClick={() => setSelectedCountry("")} className="ml-auto flex items-center gap-1 text-xs text-white/40 hover:text-white/60">
                    <X size={12} /> Clear filter
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {countries.map(({ code, count }) => (
                  <button
                    key={code}
                    onClick={() => setSelectedCountry(selectedCountry === code ? "" : code)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedCountry === code
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-white/5 text-white/50 hover:bg-white/10 border border-transparent"
                    }`}
                  >
                    <span className="text-base">{countryFlag(code)}</span>
                    <span>{COUNTRIES.find((c) => c.code === code)?.name || code}</span>
                    <span className="text-amber-400/60">{count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Search + Filters */}
      {!loading && data.members.length > 0 && (
        <section className="px-4 pb-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, company, profession, or founder number…"
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 transition-all"
                />
              </div>
              {industries.length > 0 && (
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="" className="bg-[#0d0d14]">All Industries</option>
                  {industries.map((ind) => <option key={ind} value={ind} className="bg-[#0d0d14]">{ind}</option>)}
                </select>
              )}
              <select
                value={prefFilter}
                onChange={(e) => setPrefFilter(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 focus:outline-none focus:border-amber-500/50"
              >
                <option value="all" className="bg-[#0d0d14]">All Profiles</option>
                <option value="public" className="bg-[#0d0d14]">Public</option>
                <option value="private" className="bg-[#0d0d14]">Private</option>
                <option value="anonymous" className="bg-[#0d0d14]">Anonymous</option>
              </select>
            </div>
            <p className="text-white/30 text-xs mt-2">
              Showing {filtered.length} founder{filtered.length !== 1 ? "s" : ""}
              {selectedCountry && ` from ${COUNTRIES.find((c) => c.code === selectedCountry)?.name || selectedCountry}`}
            </p>
          </div>
        </section>
      )}

      {/* Founder Cards */}
      <section className="px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-amber-400" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Trophy size={32} className="text-amber-400/30 mx-auto mb-3" />
              <p className="text-white/30 text-sm">
                {data.members.length === 0 ? "No founders have joined the wall yet." : "No founders match your filters."}
              </p>
              {data.members.length === 0 && (
                <Link to="/pricing" className="inline-flex items-center gap-1.5 mt-4 text-amber-400 text-sm hover:underline">
                  Reserve your spot <ArrowRight size={14} />
                </Link>
              )}
            </div>
          ) : (
            <>
              {featured.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Crown size={14} className="text-amber-400" />
                    <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Featured Founders</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featured.map((m) => <FounderCard key={m.founding_member_number} founder={m} countries={COUNTRIES} featured />)}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rest.map((m) => <FounderCard key={m.founding_member_number} founder={m} countries={COUNTRIES} />)}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Timeline */}
      {!loading && data.milestones.length > 0 && (
        <section className="px-4 pb-20 bg-white/[0.01] py-16">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Founder Milestones</h2>
              <p className="text-white/40 text-sm">The journey of the EXECLEAD.AI founding chapter.</p>
            </div>
            <FoundersWallTimeline milestones={data.milestones} />
          </div>
        </section>
      )}

      {/* Founder Benefits */}
      <section className="px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full mb-4">
              <Award size={14} className="text-amber-400" />
              <span className="text-amber-400 text-xs font-medium">Lifetime Benefits</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">What Founders Earn</h2>
            <p className="text-white/40 text-sm">Permanent benefits reserved for the founding chapter.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {BENEFITS.map((b) => (
              <div key={b.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">{b.icon}</div>
                <div className="text-white/60 text-xs font-medium">{b.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-3xl p-8 md:p-12 text-center"
          >
            <Shield size={28} className="text-amber-400 mx-auto mb-3" />
            <h2 className="text-2xl md:text-4xl font-bold mb-3">Become Part of EXECLEAD.AI History</h2>
            <p className="text-white/40 mb-8 max-w-xl mx-auto">
              Founder numbers are immutable and permanent. Once the founding chapter closes, these numbers become part of each founder's executive identity — forever.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/pricing" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-medium px-8 py-3.5 rounded-xl transition-colors">
                <Trophy size={18} /> Reserve Your Founding Membership
              </Link>
              <Link to="/about" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-medium px-8 py-3.5 rounded-xl transition-colors">
                About EXECLEAD.AI
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}