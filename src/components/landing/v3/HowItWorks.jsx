import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Gauge, Sparkles, Brain, Swords, ShieldCheck, Network, BookOpen, FolderOpen, Crown, ArrowRight } from 'lucide-react';

const STEPS = [
  { icon: Target, title: 'Choose Leadership Goal', desc: 'Select your executive track and target role. Every module personalizes instantly.', to: '/assessment' },
  { icon: Gauge, title: 'Executive Readiness™', desc: 'A 10-minute, evidence-based assessment reveals your leadership gaps.', to: '/assessment' },
  { icon: Sparkles, title: 'AI Analysis', desc: 'EXEC™ analyzes your answers and builds a personalized leadership profile.', to: '/dashboard' },
  { icon: Brain, title: 'Executive Coaching', desc: 'Practice executive thinking with an AI coach that challenges your assumptions.', to: '/coach' },
  { icon: Swords, title: 'Executive Simulations', desc: 'Rehearse real executive decisions with measurable, evidence-based feedback.', to: '/simulator' },
  { icon: ShieldCheck, title: 'Evidence Collection', desc: 'Every action generates verified leadership evidence in your Evidence Vault™.', to: '/evidence-vault' },
  { icon: Network, title: 'Executive Identity™', desc: 'Your evidence compounds into one verified Executive Identity.', to: '/executive-identity-graph' },
  { icon: BookOpen, title: 'Executive Success Story™', desc: 'Transform verified achievements into an executive narrative.', to: '/executive-success-stories' },
  { icon: FolderOpen, title: 'Executive Portfolio™', desc: 'A shareable, evidence-backed portfolio that proves executive readiness.', to: '/executive-portfolio' },
  { icon: Crown, title: 'Executive Ready™', desc: 'Continuously develop — and prove — your executive leadership.', to: '/dashboard' },
];

export default function HowItWorks({ authed }) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timer = useRef(null);
  const step = STEPS[active];
  const Icon = step.icon;

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => setActive((a) => (a + 1) % STEPS.length), 2800);
    return () => clearInterval(timer.current);
  }, [playing]);

  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 border-t border-white/5 bg-white/[0.015]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">How EXECLEAD.AI Works</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">One Continuous Executive Journey.</h2>
          <p className="text-white/45 max-w-2xl mx-auto text-sm">Ten connected steps — from your first assessment to a verified executive identity. Explore any step.</p>
        </div>

        {/* Progress rail */}
        <div className="relative mb-8">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-white/8" />
          <motion.div className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-accent-orange to-amber-400" animate={{ width: `${((active + 1) / STEPS.length) * 100}%` }} transition={{ duration: 0.5 }} />
          <div className="relative flex gap-1 overflow-x-auto pb-2 -mx-1 px-1" onMouseEnter={() => setPlaying(false)} onMouseLeave={() => setPlaying(true)}>
            {STEPS.map((s, i) => {
              const SIcon = s.icon;
              const on = i === active;
              const done = i < active;
              return (
                <button key={s.title} onClick={() => { setActive(i); setPlaying(false); }} className="shrink-0 flex flex-col items-center group" style={{ minWidth: 56 }}>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border-2 ${on ? 'bg-accent-orange border-accent-orange scale-110' : done ? 'bg-accent-orange/20 border-accent-orange/40' : 'bg-[#0d0d14] border-white/15 group-hover:border-white/30'}`}>
                    <SIcon size={14} className={on ? 'text-white' : done ? 'text-accent-orange' : 'text-white/40'} />
                  </span>
                  <span className={`text-[8.5px] mt-1.5 leading-tight text-center max-w-[64px] ${on ? 'text-white' : 'text-white/35'}`}>{s.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active step detail */}
        <motion.div key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          className="rounded-2xl border border-accent-orange/20 bg-gradient-to-br from-accent-orange/[0.06] to-transparent p-6 md:p-8 max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent-orange/15 flex items-center justify-center"><Icon size={22} className="text-accent-orange" /></div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-accent-orange/70 font-semibold">Step {active + 1} of {STEPS.length}</div>
              <h3 className="text-xl font-bold text-white">{step.title}</h3>
            </div>
          </div>
          <p className="text-sm text-white/60 leading-relaxed mb-5">{step.desc}</p>
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <button key={i} onClick={() => { setActive(i); setPlaying(false); }} className={`h-1.5 rounded-full transition-all ${i === active ? 'w-5 bg-accent-orange' : 'w-1.5 bg-white/20'}`} />
              ))}
            </div>
            <Link to={authed ? step.to : '/beta'} className="inline-flex items-center gap-1.5 text-sm text-accent-orange hover:text-accent-orange/80 transition-colors font-medium">Explore <ArrowRight size={14} /></Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}