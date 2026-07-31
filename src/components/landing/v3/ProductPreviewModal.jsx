import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, ArrowRight, Maximize2 } from 'lucide-react';
import { MockFrame } from './ProductMockups';

export default function ProductPreviewModal({ item, open, onClose, authed, onWatchDemo }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);

  if (!mounted) return null;
  const Icon = item?.icon;

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }} transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0d0d14] shadow-2xl">
            <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 z-10"><X size={16} /></button>
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-accent-orange/15 flex items-center justify-center">{Icon && <Icon size={20} className="text-accent-orange" />}</div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-accent-orange/80 font-semibold">Product Preview™</div>
                  <h3 className="text-xl font-bold text-white leading-tight">{item.title}</h3>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 mb-5"><MockFrame variant={item.variant} /></div>
              <p className="text-sm text-white/70 leading-relaxed mb-4">{item.sentence}</p>
              <div className="rounded-xl bg-white/[0.03] border border-white/8 p-4 mb-4">
                <div className="text-[10px] uppercase tracking-wider text-white/35 font-semibold mb-1.5">Business Value</div>
                <p className="text-[12.5px] text-white/65 leading-relaxed">{item.businessValue}</p>
              </div>
              <div className="mb-5">
                <div className="text-[10px] uppercase tracking-wider text-white/35 font-semibold mb-2">Related Modules</div>
                <div className="flex flex-wrap gap-2">
                  {item.related.map((r) => (
                    <span key={r} className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] text-white/65">{r}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button onClick={() => { onWatchDemo?.(item.relatedScene); onClose(); }} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-transparent border border-white/15 hover:bg-white/5 text-white/80 text-sm font-medium transition-colors"><Play size={14} /> {item.relatedLabel || 'Watch Demo'}</button>
                <Link to={authed ? item.to : '/platform'} onClick={onClose} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-white text-sm font-semibold transition-colors">
                  {authed ? 'Open Workspace' : 'Open Interactive Preview'} <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}