import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import HeroProductPreview from '../HeroProductPreview';
import LeadershipJourneyModel from './LeadershipJourneyModel';

const TRUST = ['Personalized AI', 'Executive Simulations', 'Evidence-Based Growth', 'Executive Identity™', 'Private Beta'];

export default function NewHero({ authed, onWatchDemo }) {
  return (
    <section id="overview" className="relative pt-28 pb-16 md:pt-36 md:pb-24 px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-orange/20 rounded-full blur-[120px]" animate={{ x: [0, 50, 0], y: [0, 30, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px]" animate={{ x: [0, -40, 0], y: [0, 50, 0] }} transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }} />
        <svg className="absolute inset-0 w-full h-full opacity-[0.06]" preserveAspectRatio="xMidYMid slice">
          <g stroke="#f59e0b" strokeWidth="0.5" fill="#f59e0b">
            <line x1="10%" y1="20%" x2="30%" y2="60%" /><line x1="30%" y1="60%" x2="55%" y2="35%" />
            <line x1="55%" y1="35%" x2="80%" y2="55%" /><line x1="80%" y1="55%" x2="90%" y2="25%" />
          </g>
        </svg>
      </div>
      <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 items-center">
        <div className="w-full lg:w-[55%] text-center lg:text-left">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-orange/10 border border-accent-orange/25 rounded-full text-xs text-accent-orange font-semibold mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-orange animate-pulse" /> FOUNDING PRIVATE BETA™ · INVITATION ONLY
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="text-4xl md:text-5xl lg:text-[3.4rem] font-bold tracking-tight leading-[1.08] mb-5">
            The AI Executive Leadership<br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent">Operating System™</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.18 }} className="text-base md:text-lg text-white/60 max-w-2xl mx-auto lg:mx-0 mb-4 leading-relaxed">
            EXECLEAD.AI helps ambitious professionals become executive-ready leaders through AI-powered coaching, Executive Readiness™ assessment, realistic leadership simulations, and evidence-based development.
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.23 }} className="mx-auto mb-7 max-w-2xl text-sm text-white/45 lg:mx-0">Built for ambitious professionals developing toward leadership and executive roles across business, operations, finance, people, product, technology, and the public sector.</motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-5">
            <Link to="/assessment" className="w-full sm:w-auto bg-accent-orange hover:bg-accent-orange/90 text-white font-bold text-[15px] px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-orange/30">
              Take the Executive Readiness Assessment <ArrowRight size={18} />
            </Link>
            <Link to="/demo" className="w-full sm:w-auto bg-transparent hover:bg-white/5 border border-white/15 text-white/80 font-medium text-sm px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
              Watch Demo <ArrowRight size={15} />
            </Link>
          </motion.div>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.36 }} className="text-sm text-white/45 max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed">
            Leadership development informed by 20+ years of technology, enterprise operations, service delivery, governance, and team leadership experience.
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.45 }} className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2">
            {TRUST.map((t) => (
              <div key={t} className="flex items-center gap-1.5 text-[11px] text-white/45"><Check size={12} className="text-emerald-400/80" /> {t}</div>
            ))}
          </motion.div>
        </div>
        <div className="w-full lg:w-[45%]"><HeroProductPreview /></div>
      </div>
      <LeadershipJourneyModel />
    </section>
  );
}