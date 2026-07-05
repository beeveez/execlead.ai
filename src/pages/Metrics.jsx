import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { METRICS_LIBRARY } from "@/lib/constants";
import { BarChart3, Search, Loader2, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

export default function Metrics() {
  const [search, setSearch] = useState("");
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  const filtered = METRICS_LIBRARY.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.fullName.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(METRICS_LIBRARY.map(m => m.category))];

  const loadDetail = async (metric) => {
    setSelectedMetric(metric);
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide a comprehensive executive briefing on the metric "${metric.fullName} (${metric.name})".

Structure your response with these sections:

## Definition
Clear, executive-level definition.

## Executive Importance
Why should a ${metric.category} executive care about this metric?

## Business Impact
How does this metric directly impact business outcomes, revenue, and client satisfaction?

## Interview Example
Give a strong example of how to discuss this metric in an executive interview. Include specific numbers and context.

## Improvement Strategy
3-4 actionable strategies to improve this metric in a managed services / IT operations environment.

## Red Flags
What values or trends signal problems?

Be specific, practical, and executive-level. Use real-world examples.`,
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
          <BarChart3 size={12} className="text-emerald-400" />
          Global Metrics Library
        </div>
        <h1 className="text-2xl font-bold text-white">{METRICS_LIBRARY.length} Executive Metrics</h1>
      </div>

      <AnimatePresence mode="wait">
        {!selectedMetric ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search metrics..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
            </div>

            {categories.map(cat => {
              const catMetrics = filtered.filter(m => m.category === cat);
              if (catMetrics.length === 0) return null;
              return (
                <div key={cat}>
                  <h2 className="text-xs font-medium text-white/30 uppercase tracking-wider mb-2">{cat}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {catMetrics.map(m => (
                      <button
                        key={m.id}
                        onClick={() => loadDetail(m)}
                        className="group flex items-center gap-3 px-4 py-3 bg-white/[0.03] hover:bg-emerald-500/5 border border-white/5 hover:border-emerald-500/15 rounded-lg text-left transition-all"
                      >
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-xs flex-shrink-0">
                          {m.name.slice(0, 3)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">{m.name}</div>
                          <div className="text-xs text-white/30">{m.fullName}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div key="detail" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <button
              onClick={() => { setSelectedMetric(null); setDetail(null); }}
              className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-4 transition-colors"
            >
              <X size={14} /> Back to all metrics
            </button>

            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold">
                  {selectedMetric.name.slice(0, 3)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedMetric.name}</h2>
                  <p className="text-white/40 text-sm">{selectedMetric.fullName}</p>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12 gap-3 text-white/40">
                  <Loader2 size={20} className="animate-spin" />
                  Loading executive briefing...
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