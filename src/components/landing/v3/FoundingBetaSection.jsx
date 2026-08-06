import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cpu, Users, Layers, Server, RefreshCw, Crown, ArrowRight, Zap } from 'lucide-react';
import { BrandRegistry } from '@/lib/brandRegistry';

const WHO_ICONS = [Cpu, Users, Layers, Server, RefreshCw, Crown, Zap, ArrowRight];
const WHO = BrandRegistry.marketing.foundingBeta.audience.map((label, i) => ({ icon: WHO_ICONS[i], label }));
const COPY = BrandRegistry.marketing.foundingBeta;

export default function FoundingBetaSection({ authed }) {
  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-orange/10 border border-accent-orange/25 rounded-full text-xs text-accent-orange font-semibold mb-4">
            <Zap size={12} /> FOUNDING PRIVATE BETA™
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{COPY.heading}</h2>
          <p className="text-white/45 max-w-2xl mx-auto text-sm">{COPY.subhead}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto mb-10">
          {WHO.map((w, i) => {
            const Icon = w.icon;
            return (
              <motion.div key={w.label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] border border-white/8 p-3.5">
                <div className="w-8 h-8 rounded-lg bg-accent-orange/10 flex items-center justify-center shrink-0"><Icon size={15} className="text-accent-orange" /></div>
                <span className="text-[12px] font-medium text-white/75 leading-tight">{w.label}</span>
              </motion.div>
            );
          })}
        </div>
        <div className="max-w-2xl mx-auto rounded-2xl border border-accent-orange/25 bg-gradient-to-br from-accent-orange/[0.06] to-transparent p-6 text-center">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">{COPY.limitedBadge}</div>
          <p className="text-sm text-white/60 leading-relaxed mb-5">{COPY.limitedBody}</p>
          <Link to={authed ? '/assessment' : '/beta'} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-white text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-orange/25">
            {COPY.cta} <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}