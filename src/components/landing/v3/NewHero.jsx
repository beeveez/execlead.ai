import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Check } from 'lucide-react';
import HeroProductPreview from '../HeroProductPreview';

const TRUST = ['Personalized AI', 'Executive Simulations', 'Evidence-Based Growth', 'Executive Identity™', 'Private Beta'];

export default function NewHero({ authed, onWatchDemo }) {
  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 px-6 lg:px-8 overflow-hidden">
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
            Become the Executive Every <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent">Organization Wants to Hire.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.18 }} className="text-base md:text-lg text-white/60 max-w-2xl mx-auto lg:mx-0 mb-7 leading-relaxed">
            Measure your Executive Readiness™, discover leadership gaps, practice real executive decisions,
            build an evidence-based Executive Identity, and continuously grow into executive leadership.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-8">
            <Link to={authed ? '/assessment' : '/beta'} className="w-full sm:w-auto bg-accent-orange hover:bg-accent-orange/90 text-white font-semibold px-7 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-orange/25">
              Start Executive Readiness Assessment™ <ArrowRight size={17} />
            </Link>
            <button onClick={onWatchDemo} className="w-full sm:w-auto bg-transparent hover:bg-white/5 border border-white/15 text-white/80 font-medium px-7 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
              <Play size={16} /> Watch 90-Second Platform Demo
            </button>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.45 }} className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2">
            {TRUST.map((t) => (
              <div key={t} className="flex items-center gap-1.5 text-[11px] text-white/45"><Check size={12} className="text-emerald-400/80" /> {t}</div>
            ))}
          </motion.div>
        </div>
        <div className="w-full lg:w-[45%]"><HeroProductPreview /></div>
      </div>
    </section>
  );
}