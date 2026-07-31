import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';

export default function FinalCTA({ authed }) {
  return (
    <section className="py-24 md:py-32 px-6 lg:px-8 border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-orange/10 rounded-full blur-[140px]" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
      </div>
      <div className="relative max-w-3xl mx-auto text-center">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
          Your Executive Leadership Journey <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent">Starts Today.</span>
        </motion.h2>
        <p className="text-base text-white/55 max-w-2xl mx-auto mb-8 leading-relaxed">
          Join the Founding Private Beta and experience the world's first Executive Leadership Operating System.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <Link to={authed ? '/assessment' : '/beta'} className="w-full sm:w-auto bg-accent-orange hover:bg-accent-orange/90 text-white font-semibold px-7 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-orange/25">
            Start Executive Readiness Assessment™ <ArrowRight size={17} />
          </Link>
          <Link to="/beta" className="w-full sm:w-auto bg-transparent hover:bg-white/5 border border-white/15 text-white/80 font-medium px-7 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
            <Zap size={15} /> Apply for Founding Membership
          </Link>
        </div>
        <div className="text-center text-[11px] text-white/30 tracking-wide">
          One Leadership Journey. One AI Platform. <span className="text-accent-orange/70">Become the Executive Every Organization Wants to Hire.</span>
        </div>
      </div>
    </section>
  );
}