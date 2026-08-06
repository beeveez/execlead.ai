import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { BrandRegistry } from '@/lib/brandRegistry';

export default function DemoHero({ authed }) {
  const COPY = BrandRegistry.marketing.demo;
  const primaryTo = authed ? '/assessment' : '/beta';
  return (
    <section className="relative pt-32 md:pt-40 pb-12 px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-orange/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px]" />
      </div>
      <div className="relative max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-orange/10 border border-accent-orange/25 rounded-full text-xs text-accent-orange font-semibold mb-5">
          <Sparkles size={12} /> {COPY.title}
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-4">
          {COPY.hero.headline}
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-base md:text-lg text-white/60 max-w-2xl mx-auto mb-3 leading-relaxed">
          {COPY.hero.supporting}
        </motion.p>
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.18 }} className="text-sm text-white/45 max-w-2xl mx-auto mb-8 leading-relaxed">
          {COPY.subtitle}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.26 }} className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to={primaryTo} className="w-full sm:w-auto bg-accent-orange hover:bg-accent-orange/90 text-white font-semibold px-7 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-orange/25">
            {COPY.hero.primaryCta} <ArrowRight size={17} />
          </Link>
          <Link to="/beta" className="w-full sm:w-auto bg-transparent hover:bg-white/5 border border-white/15 text-white/80 font-medium px-7 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
            {COPY.hero.secondaryCta} <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}