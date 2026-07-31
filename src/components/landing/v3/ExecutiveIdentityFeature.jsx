import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Network, BookOpen, Cpu, FolderOpen, Award, RefreshCw, ArrowRight } from 'lucide-react';

const PILLARS = [
  { icon: BookOpen, title: 'Executive Success Stories™', desc: 'Transform verified achievements into executive narratives.', to: '/executive-success-stories' },
  { icon: Network, title: 'Executive Identity Graph™', desc: 'One verified identity powering every professional experience.', to: '/executive-identity-graph' },
  { icon: Cpu, title: 'Executive Identity Operating System™', desc: 'The engine that keeps your identity consistent across every audience.', to: '/executive-identity-graph' },
  { icon: FolderOpen, title: 'Executive Portfolio™', desc: 'A shareable, evidence-backed executive portfolio.', to: '/executive-portfolio' },
  { icon: Award, title: 'Executive Brand™', desc: 'A consistent, audience-specific executive positioning.', to: '/brand-center' },
  { icon: RefreshCw, title: 'Living Executive Profile™', desc: 'An identity that evolves with every coaching session and simulation.', to: '/executive-identity-graph' },
];

export default function ExecutiveIdentityFeature({ authed }) {
  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">Executive Identity</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Your Executive Identity Evolves With You.</h2>
          <p className="text-white/45 max-w-2xl mx-auto text-sm">Not a static profile. A living, evidence-based executive identity — with real analytics and a real timeline — that compounds with every leadership action.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PILLARS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div key={p.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                <Link to={authed ? p.to : '/beta'} className="group block rounded-2xl border border-white/8 bg-white/[0.02] hover:border-accent-orange/25 hover:bg-white/[0.04] p-5 transition-all h-full">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/15 to-accent-orange/10 flex items-center justify-center mb-3"><Icon size={18} className="text-accent-orange" /></div>
                  <div className="text-[13px] font-semibold text-white mb-1.5">{p.title}</div>
                  <p className="text-[11.5px] text-white/45 leading-relaxed">{p.desc}</p>
                  <div className="flex items-center gap-1 text-[11px] text-accent-orange mt-3 opacity-0 group-hover:opacity-100 transition-opacity">Explore <ArrowRight size={12} /></div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}