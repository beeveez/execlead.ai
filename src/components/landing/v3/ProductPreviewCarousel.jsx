import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Gauge, Brain, Swords, Network, BookOpen, FolderOpen, LineChart, MessageSquare, Compass } from 'lucide-react';

const PREVIEWS = [
  { title: 'Leadership Path Selection', sentence: 'Choose your executive destination and personalize every module.', to: '/assessment', icon: Compass, variant: 'path' },
  { title: 'Executive Readiness Assessment™', sentence: 'A 10-minute assessment that reveals your leadership gaps.', to: '/assessment', icon: Gauge, variant: 'assessment' },
  { title: 'Executive Dashboard™', sentence: 'Your living command center for executive growth.', to: '/dashboard', icon: LineChart, variant: 'dashboard' },
  { title: 'AI Executive Coach™', sentence: 'Practice executive thinking through adaptive dialogue.', to: '/coach', icon: Brain, variant: 'coach' },
  { title: 'Executive Simulations™', sentence: 'Real executive decisions with measurable outcomes.', to: '/simulator', icon: Swords, variant: 'simulations' },
  { title: 'Executive Identity Graph™', sentence: 'One verified executive identity powering every professional experience.', to: '/executive-identity-graph', icon: Network, variant: 'identity' },
  { title: 'Executive Success Stories™', sentence: 'Transform achievements into executive narratives.', to: '/executive-success-stories', icon: BookOpen, variant: 'stories' },
  { title: 'Executive Portfolio™', sentence: 'A shareable, evidence-backed executive portfolio.', to: '/executive-portfolio', icon: FolderOpen, variant: 'portfolio' },
  { title: 'Outcome Intelligence™', sentence: 'Track real executive development over time.', to: '/outcome-intelligence', icon: LineChart, variant: 'outcome' },
  { title: 'Executive Concierge™', sentence: 'Your AI executive concierge, always one message away.', to: '/dashboard', icon: MessageSquare, variant: 'concierge' },
];

function Chrome({ children }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#0d0d14] overflow-hidden">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/8 bg-white/[0.02]">
        <span className="w-2 h-2 rounded-full bg-white/15" />
        <span className="w-2 h-2 rounded-full bg-white/15" />
        <span className="w-2 h-2 rounded-full bg-white/15" />
        <span className="ml-2 text-[9px] text-white/30">execlead.ai</span>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

const Bar = ({ w, dim }) => <div className={`h-1.5 rounded ${dim ? 'bg-white/10' : 'bg-white/20'}`} style={{ width: w }} />;

function MockFrame({ variant }) {
  switch (variant) {
    case 'path':
      return (
        <Chrome>
          <div className="grid grid-cols-3 gap-1.5">
            <div className="rounded-md bg-accent-orange/15 border border-accent-orange/40 p-2"><div className="w-4 h-4 rounded bg-accent-orange/30 mb-1" /><Bar w="80%" /></div>
            <div className="rounded-md bg-white/5 border border-white/10 p-2"><div className="w-4 h-4 rounded bg-white/15 mb-1" /><Bar w="60%" dim /></div>
            <div className="rounded-md bg-white/5 border border-white/10 p-2"><div className="w-4 h-4 rounded bg-white/15 mb-1" /><Bar w="60%" dim /></div>
          </div>
        </Chrome>
      );
    case 'assessment':
      return (
        <Chrome>
          <div className="space-y-1.5">
            <Bar w="75%" />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`flex items-center gap-1.5 rounded-md p-1.5 ${i === 1 ? 'bg-accent-orange/10 border border-accent-orange/30' : 'bg-white/5 border border-white/8'}`}>
                <span className={`w-2.5 h-2.5 rounded-full border ${i === 1 ? 'border-accent-orange bg-accent-orange' : 'border-white/25'}`} />
                <Bar w="70%" dim />
              </div>
            ))}
          </div>
        </Chrome>
      );
    case 'dashboard':
      return (
        <Chrome>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-full border-4 border-accent-orange/40 flex items-center justify-center text-[10px] font-bold text-accent-orange">82</div>
              <div className="flex-1 grid grid-cols-2 gap-1 ml-2">
                <div className="h-6 rounded bg-white/5" /><div className="h-6 rounded bg-white/5" /><div className="h-6 rounded bg-white/5" /><div className="h-6 rounded bg-white/5" />
              </div>
            </div>
            <div className="h-10 rounded bg-white/5 flex items-end gap-1 px-1">
              {[40, 60, 45, 70, 55, 80].map((h, i) => <div key={i} className="flex-1 bg-accent-orange/40 rounded-t" style={{ height: `${h}%` }} />)}
            </div>
          </div>
        </Chrome>
      );
    case 'coach':
      return (
        <Chrome>
          <div className="space-y-2">
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-lg rounded-br-sm bg-accent-orange/15 border border-accent-orange/20 px-2 py-1.5 w-40">
                <Bar w="90%" /><div className="h-1.5" /><Bar w="60%" dim />
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg rounded-bl-sm bg-white/5 border border-white/10 px-2 py-1.5 w-44">
                <Bar w="95%" /><div className="h-1.5" /><Bar w="75%" dim />
              </div>
            </div>
          </div>
        </Chrome>
      );
    case 'simulations':
      return (
        <Chrome>
          <div className="space-y-1.5">
            <Bar w="66%" />
            <div className="grid grid-cols-2 gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="rounded-md bg-white/5 border border-white/8 p-1.5"><Bar w="70%" /><div className="h-1" /><Bar w="50%" dim /></div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="text-[9px] text-white/40">Decision Quality</div>
              <div className="text-[10px] font-bold text-emerald-400">88</div>
            </div>
          </div>
        </Chrome>
      );
    case 'identity':
      return (
        <Chrome>
          <div className="relative h-24 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-accent-orange/25 border border-accent-orange/40 flex items-center justify-center text-[9px] font-bold text-accent-orange z-10">EI</div>
            <div className="absolute w-6 h-6 rounded-full bg-white/8 border border-white/15" style={{ top: '15%', left: '18%' }} />
            <div className="absolute w-6 h-6 rounded-full bg-white/8 border border-white/15" style={{ top: '20%', right: '16%' }} />
            <div className="absolute w-6 h-6 rounded-full bg-white/8 border border-white/15" style={{ bottom: '15%', left: '22%' }} />
            <div className="absolute w-6 h-6 rounded-full bg-white/8 border border-white/15" style={{ bottom: '18%', right: '20%' }} />
            <svg className="absolute inset-0 w-full h-full" stroke="#f59e0b" strokeWidth="0.5" opacity="0.4">
              <line x1="50%" y1="50%" x2="24%" y2="25%" /><line x1="50%" y1="50%" x2="76%" y2="30%" />
              <line x1="50%" y1="50%" x2="28%" y2="75%" /><line x1="50%" y1="50%" x2="74%" y2="72%" />
            </svg>
          </div>
        </Chrome>
      );
    case 'stories':
      return (
        <Chrome>
          <div className="space-y-1.5">
            <Bar w="50%" />
            <Bar w="100%" dim /><Bar w="85%" dim /><Bar w="75%" dim />
            <div className="flex items-center gap-1.5 pt-1">
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[8px]">Verified</span>
              <span className="px-1.5 py-0.5 rounded-full bg-white/8 text-white/50 text-[8px]">Evidence-Based</span>
            </div>
          </div>
        </Chrome>
      );
    case 'portfolio':
      return (
        <Chrome>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-full bg-white/10" />
              <div className="flex-1"><Bar w="60%" /><div className="h-1" /><Bar w="40%" dim /></div>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <div className="h-8 rounded bg-white/5 border border-white/8" /><div className="h-8 rounded bg-white/5 border border-white/8" /><div className="h-8 rounded bg-white/5 border border-white/8" />
            </div>
          </div>
        </Chrome>
      );
    case 'outcome':
      return (
        <Chrome>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-1.5">
              <div className="rounded-md bg-white/5 p-1.5"><div className="text-[8px] text-white/40">Readiness</div><div className="text-[12px] font-bold text-emerald-400">+18</div></div>
              <div className="rounded-md bg-white/5 p-1.5"><div className="text-[8px] text-white/40">Evidence</div><div className="text-[12px] font-bold text-accent-orange">+34</div></div>
            </div>
            <div className="h-12 rounded bg-white/5 flex items-end gap-1 px-2">
              {[30, 45, 40, 60, 55, 75, 70, 85].map((h, i) => <div key={i} className="flex-1 bg-gradient-to-t from-indigo-500/40 to-accent-orange/40 rounded-t" style={{ height: `${h}%` }} />)}
            </div>
          </div>
        </Chrome>
      );
    case 'concierge':
      return (
        <Chrome>
          <div className="space-y-1.5">
            <div className="rounded-lg bg-white/5 border border-white/10 px-2 py-1.5"><Bar w="90%" /><div className="h-1" /><Bar w="70%" dim /></div>
            <div className="grid grid-cols-2 gap-1">
              <div className="rounded-md bg-accent-orange/10 border border-accent-orange/20 px-1.5 py-1 text-[8px] text-accent-orange">Review roadmap</div>
              <div className="rounded-md bg-accent-orange/10 border border-accent-orange/20 px-1.5 py-1 text-[8px] text-accent-orange">Open simulator</div>
            </div>
          </div>
        </Chrome>
      );
    default:
      return <Chrome><div className="h-20" /></Chrome>;
  }
}

export default function ProductPreviewCarousel({ authed }) {
  const [idx, setIdx] = useState(0);
  const next = useCallback(() => setIdx((i) => (i + 1) % PREVIEWS.length), []);
  const prev = () => setIdx((i) => (i - 1 + PREVIEWS.length) % PREVIEWS.length);
  useEffect(() => { const t = setInterval(next, 6000); return () => clearInterval(t); }, [next]);
  const p = PREVIEWS[idx];
  const Icon = p.icon;
  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">The Product</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">One Platform. The Complete Executive Journey.</h2>
          <p className="text-white/45 max-w-2xl mx-auto text-sm">Every module is connected — and every module adapts to your leadership path.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div key={idx} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.35 }}>
                <MockFrame variant={p.variant} />
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
                <Link to={authed ? p.to : '/beta'} className="inline-flex items-center gap-1.5 text-sm text-accent-orange hover:text-accent-orange/80 transition-colors font-medium">
                  Explore {p.title.replace('™', '')} <ArrowRight size={14} />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}