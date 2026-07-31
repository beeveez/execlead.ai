import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ShieldCheck, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';

// Executive Outcome Wall™ — replaces static testimonials with anonymous/named
// success cards generated automatically from verified ExecutiveOutcome records.
// Every card carries evidence confidence + provenance. No fabricated metrics.
export default function ExecutiveOutcomeWall() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await base44.functions.invoke('generateMarketingIntelligence', { scope: 'public' });
        if (active) setData(res.data);
      } catch (e) {
        if (active) setData(null);
      } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  const cards = data?.executiveOutcomeWall || [];
  const trust = data?.trust;

  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-full text-[11px] text-white/60 font-medium mb-4">
            <Sparkles size={12} className="text-accent-orange" /> Executive Outcome Wall™
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Real Executive Growth.<br className="hidden sm:block" /> Generated From Verified Evidence.</h2>
          <p className="text-sm text-white/45 max-w-xl mx-auto">No testimonials. No marketing copy. Every card is generated automatically from a member's verified Executive Outcomes™.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-white/40"><Loader2 size={20} className="animate-spin" /></div>
        ) : cards.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
            <TrendingUp size={28} className="text-white/30 mx-auto mb-3" />
            <p className="text-sm text-white/55 font-medium">Outcome stories appear here as members publish their growth.</p>
            <p className="text-[11px] text-white/30 mt-1">Powered by the Evidence-Led Marketing Engine™ — nothing is fabricated.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((c, i) => (
              <motion.div key={c.id || i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-accent-orange/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] text-white/50 font-medium">{c.role}</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">{c.visibility === 'named' ? 'Named' : 'Anonymous'}</span>
                </div>
                <div className="flex items-center justify-center gap-3 py-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white/50">{c.from}</div>
                    <div className="text-[9px] text-white/30 uppercase tracking-wider">Before</div>
                  </div>
                  <ArrowRight size={16} className="text-accent-orange" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent-orange">{c.to}</div>
                    <div className="text-[9px] text-white/30 uppercase tracking-wider">After</div>
                  </div>
                </div>
                <div className="text-center text-[12px] text-white/80 font-medium mt-1">{c.label}</div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/8">
                  <span className="text-[10px] text-white/40">Evidence Confidence</span>
                  <span className="text-[11px] font-semibold text-emerald-400">{c.evidenceConfidence}%</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {trust && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] text-white/35">
            <span className="flex items-center gap-1"><ShieldCheck size={11} className="text-emerald-400/70" /> Source: {trust.source}</span>
            <span>·</span>
            <span>Verification: {trust.verification}</span>
            <span>·</span>
            <span>Last Updated: {new Date(trust.lastUpdated).toLocaleDateString()}</span>
            <span>·</span>
            <span>Generated From: verified platform evidence</span>
            <span>·</span>
            <span>AI Assisted: {String(trust.aiAssisted)}</span>
            <span>·</span>
            <span>v{trust.version}</span>
          </div>
        )}
      </div>
    </section>
  );
}