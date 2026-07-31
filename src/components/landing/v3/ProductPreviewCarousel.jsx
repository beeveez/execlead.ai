import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Maximize2 } from 'lucide-react';
import { PREVIEWS, MockFrame } from './ProductMockups';
import ProductPreviewModal from './ProductPreviewModal';

export default function ProductPreviewCarousel({ authed, onWatchDemo }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const next = useCallback(() => setIdx((i) => (i + 1) % PREVIEWS.length), []);
  const prev = () => setIdx((i) => (i - 1 + PREVIEWS.length) % PREVIEWS.length);
  useEffect(() => { const t = setInterval(next, 6000); return () => clearInterval(t); }, [next]);
  const p = PREVIEWS[idx];
  const Icon = p.icon;
  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">Product Experience</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Real Product. Not Conceptual Artwork.</h2>
          <p className="text-white/45 max-w-2xl mx-auto text-sm">Click any module to open a full Product Preview™.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div key={idx} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.35 }}>
                <button onClick={() => setSelected(p)} className="group block w-full text-left relative">
                  <MockFrame variant={p.variant} />
                  <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[11px] text-white/80 backdrop-blur-sm"><Maximize2 size={12} /> Open Preview</span>
                  </div>
                </button>
              </motion.div>
            </AnimatePresence>
            <div className="flex items-center justify-center gap-2 mt-5">
              <button onClick={prev} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-white/60 transition-colors"><ChevronLeft size={16} /></button>
              <div className="flex gap-1.5">
                {PREVIEWS.map((_, i) => (
                  <button key={i} onClick={() => setIdx(i)} className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-6 bg-accent-orange' : 'w-1.5 bg-white/20'}`} />
                ))}
              </div>
              <button onClick={next} className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-white/60 transition-colors"><ChevronRight size={16} /></button>
            </div>
          </div>
          <div>
            <AnimatePresence mode="wait">
              <motion.div key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                <div className="w-11 h-11 rounded-xl bg-accent-orange/15 flex items-center justify-center mb-4"><Icon size={20} className="text-accent-orange" /></div>
                <h3 className="text-2xl font-bold mb-3">{p.title}</h3>
                <p className="text-white/55 leading-relaxed mb-6">{p.sentence}</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelected(p)} className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors font-medium"><Maximize2 size={14} /> Open Product Preview™</button>
                  <Link to={authed ? p.to : '/beta'} className="inline-flex items-center gap-1.5 text-sm text-accent-orange hover:text-accent-orange/80 transition-colors font-medium">Explore <ArrowRight size={14} /></Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      <ProductPreviewModal item={selected} open={!!selected} onClose={() => setSelected(null)} authed={authed} onWatchDemo={onWatchDemo} />
    </section>
  );
}