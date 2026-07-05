import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { COMPANIES } from "@/lib/constants";
import { Building2, Search, Loader2, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

export default function Companies() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  const filtered = COMPANIES.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  const loadCompany = async (company) => {
    setSelected(company);
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide a comprehensive executive knowledge briefing on "${company}" for someone preparing for a leadership interview there.

Structure:

## Mission & Vision
The company's core mission and strategic vision.

## Culture & Values
Key cultural traits and leadership values that matter in interviews.

## Leadership Principles
How leaders are expected to think and act at ${company}.

## Business Model
How the company makes money, key revenue streams, and service delivery approach.

## Market Position
Where they sit competitively, key differentiators.

## Key Competitors
Top 3-5 competitors and how ${company} differentiates.

## Interview Expectations
What ${company} looks for in executive candidates. Common interview styles and questions.

## Technology Trends
Current technology focus areas and transformation initiatives.

## Customer Types
Typical client profiles and industry verticals.

## Global Presence
Geographic footprint and key markets.

Be specific, current, and practical. This should help someone walk into an interview sounding like an insider.`,
        add_context_from_internet: true,
        model: "gemini_3_flash"
      });
      setDetail(res);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Building2 size={12} className="text-violet-400" />
          Company Knowledge Base
        </div>
        <h1 className="text-2xl font-bold text-white">{COMPANIES.length} Organizations</h1>
      </div>

      <AnimatePresence mode="wait">
        {!selected ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search companies..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {filtered.map(c => (
                <button
                  key={c}
                  onClick={() => loadCompany(c)}
                  className="group px-4 py-4 bg-white/[0.03] hover:bg-violet-500/5 border border-white/5 hover:border-violet-500/15 rounded-xl text-left transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 font-bold text-xs mb-3">
                    {c.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-sm font-medium text-white/60 group-hover:text-white transition-colors">{c}</div>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="detail" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <button
              onClick={() => { setSelected(null); setDetail(null); }}
              className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-4 transition-colors"
            >
              <X size={14} /> Back to all companies
            </button>

            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 font-bold text-lg">
                  {selected.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selected}</h2>
                  <p className="text-white/40 text-sm">Executive Knowledge Briefing</p>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12 gap-3 text-white/40">
                  <Loader2 size={20} className="animate-spin" />
                  Researching {selected}...
                </div>
              ) : detail ? (
                <div className="text-white/70 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{detail}</ReactMarkdown>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}