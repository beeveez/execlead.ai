import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { BrandRegistry } from '@/lib/brandRegistry';

export default function DemoFinalCTA({ authed }) {
  const COPY = BrandRegistry.marketing.demo.finalCta;
  const primaryTo = authed ? '/assessment' : '/beta';
  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-3xl mx-auto text-center">
        <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-2xl md:text-4xl font-bold mb-3">{COPY.heading}</motion.h2>
        <p className="text-white/45 text-sm mb-8">{BrandRegistry.tagline}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to={primaryTo} className="w-full sm:w-auto bg-accent-orange hover:bg-accent-orange/90 text-white font-semibold px-7 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-orange/25">
            {COPY.primary} <ArrowRight size={17} />
          </Link>
          <Link to="/beta" className="w-full sm:w-auto bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 text-amber-400 font-semibold px-7 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
            {COPY.secondary} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}