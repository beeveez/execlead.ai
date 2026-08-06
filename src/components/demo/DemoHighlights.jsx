import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Gauge, Sparkles, PlayCircle, Fingerprint, Trophy, ShieldCheck, ArrowRight, X } from 'lucide-react';
import { BrandRegistry } from '@/lib/brandRegistry';

const ICONS = { Gauge, Sparkles, PlayCircle, Fingerprint, Trophy, ShieldCheck };

export default function DemoHighlights() {
  const CARDS = BrandRegistry.marketing.demo.highlights;
  const [active, setActive] = useState(null);
  const ActiveIcon = active ? ICONS[active.icon] || Sparkles : Sparkles;

  return (
    <section className="py-16 md:py-20 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">Interactive Highlights</div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Explore the Platform in Action</h2>
          <p className="text-white/45 text-sm max-w-xl mx-auto">Tap any module to see what's inside.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CARDS.map((c, i) => {
            const Icon = ICONS[c.icon] || Sparkles;
            return (
              <motion.button key={c.title} onClick={() => setActive(c)} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} className="text-left rounded-2xl border border-white/8 bg-white/[0.02] hover:border-accent-orange/30 hover:bg-accent-orange/[0.04] p-5 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-accent-orange/10 flex items-center justify-center mb-3"><Icon size={18} className="text-accent-orange" /></div>
                <h3 className="text-white font-semibold text-sm mb-1.5">{c.title}</h3>
                <p className="text-white/45 text-xs leading-relaxed mb-3">{c.desc}</p>
                <span className="inline-flex items-center gap-1 text-[11px] text-accent-orange/80 font-medium">Learn more <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" /></span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActive(null)} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0d0d14] p-6">
              <button onClick={() => setActive(null)} aria-label="Close" className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60"><X size={16} /></button>
              <div className="w-12 h-12 rounded-xl bg-accent-orange/10 flex items-center justify-center mb-4"><ActiveIcon size={22} className="text-accent-orange" /></div>
              <h3 className="text-lg font-bold text-white mb-2">{active.title}</h3>
              <p className="text-sm text-white/55 leading-relaxed mb-5">{active.desc}</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link to={active.route} onClick={() => setActive(null)} className="flex-1 text-center bg-accent-orange hover:bg-accent-orange/90 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors inline-flex items-center justify-center gap-1.5">Open Module <ArrowRight size={14} /></Link>
                <button onClick={() => setActive(null)} className="text-center bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-sm px-4 py-2.5 rounded-xl transition-colors">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}