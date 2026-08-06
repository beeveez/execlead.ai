import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { BrandRegistry } from '@/lib/brandRegistry';

export default function DemoWalkthrough() {
  const SECTIONS = BrandRegistry.marketing.demo.walkthrough;
  return (
    <section className="py-16 md:py-20 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">Guided Walkthrough</div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">A Guided Tour of the Platform</h2>
          <p className="text-white/45 text-sm max-w-xl mx-auto">Six modules. One continuous leadership journey.</p>
        </div>
        <div className="space-y-4">
          {SECTIONS.map((s, i) => (
            <motion.div key={s.n} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 md:p-6 flex flex-col md:flex-row md:items-start gap-4">
              <div className="flex items-center gap-3 md:w-72 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-accent-orange/10 border border-accent-orange/20 flex items-center justify-center text-accent-orange font-bold">{s.n}</div>
                <h3 className="text-base md:text-lg font-semibold text-white">{s.title}</h3>
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {s.items.map((it) => (
                  <div key={it} className="flex items-center gap-2 text-sm text-white/60">
                    <Check size={14} className="text-accent-orange/80 shrink-0" /> {it}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}