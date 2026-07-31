import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, Sparkles } from 'lucide-react';

const ACTIVATION_STEPS = [
  'Creating Leadership Profile',
  'Personalizing Competency Framework',
  'Preparing Executive Coach™',
  'Building Leadership Roadmap',
  'Configuring Executive Simulations™',
  'Loading Company Intelligence™',
  'Preparing Executive Journey™',
];

/**
 * EXEC™ Activation Experience — a premium 1.5–2s activation sequence shown
 * before launching the assessment. Runs through steps then calls onFinish.
 */
export default function ExecActivationSequence({ open, onFinish }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) { setStep(0); setDone(false); return; }
    if (step >= ACTIVATION_STEPS.length) {
      setDone(true);
      const t = setTimeout(onFinish, 650);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), 230);
    return () => clearTimeout(t);
  }, [open, step, onFinish]);

  if (!open) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0f]/90 backdrop-blur-sm px-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-2xl bg-[#0d0d14] border border-accent-orange/30 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-9 h-9 rounded-xl bg-accent-orange/15 flex items-center justify-center"><Sparkles size={17} className="text-accent-orange" /></div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/40">Initializing</div>
            <div className="text-sm font-semibold text-white">EXEC™ Activation</div>
          </div>
        </div>
        <div className="space-y-2.5 mb-4">
          {ACTIVATION_STEPS.map((s, i) => {
            const complete = i < step;
            const active = i === step;
            return (
              <motion.div key={s} initial={{ opacity: 0.3 }} animate={{ opacity: complete || active ? 1 : 0.3 }} transition={{ duration: 0.2 }}
                className="flex items-center gap-2.5">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${complete ? 'bg-emerald-500/20 text-emerald-400' : active ? 'bg-accent-orange/20' : 'bg-white/5'}`}>
                  {complete ? <Check size={10} /> : active ? <Loader2 size={10} className="animate-spin text-accent-orange" /> : ''}
                </span>
                <span className={`text-[12px] ${complete ? 'text-white/80' : active ? 'text-white' : 'text-white/40'}`}>{s}</span>
              </motion.div>
            );
          })}
        </div>
        {done && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="text-center text-[12px] text-accent-orange font-semibold pt-3 border-t border-white/8">Ready. Launching Assessment…</motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}