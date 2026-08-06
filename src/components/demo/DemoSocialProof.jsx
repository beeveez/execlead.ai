import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { BrandRegistry } from '@/lib/brandRegistry';

export default function DemoSocialProof() {
  const COPY = BrandRegistry.marketing.demo.socialProof;
  return (
    <section className="py-16 md:py-20 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-3xl mx-auto rounded-2xl border border-accent-orange/20 bg-gradient-to-br from-accent-orange/[0.06] to-transparent p-6 md:p-8">
        <h2 className="text-center text-2xl md:text-3xl font-bold mb-6">{COPY.heading}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {COPY.points.map((p, i) => (
            <motion.div key={p} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="flex items-center gap-2.5 text-sm text-white/75">
              <div className="w-6 h-6 rounded-full bg-accent-orange/15 flex items-center justify-center shrink-0"><Check size={13} className="text-accent-orange" /></div>
              {p}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}