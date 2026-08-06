import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Gauge, PlayCircle, Fingerprint, Trophy, Building2, ArrowRight } from 'lucide-react';

const CARDS = [
  { title: 'Personalized AI Executive Coach™', desc: 'Context-aware coaching modeled on former CIOs, COOs, and CFOs — available on demand.', route: '/coach', icon: Sparkles },
  { title: 'Executive Readiness™', desc: 'An evidence-based readiness score with gap analysis and a personalized growth roadmap.', route: '/executive-readiness', icon: Gauge },
  { title: 'Leadership Simulations™', desc: 'Realistic executive scenarios that measure judgment under real business pressure.', route: '/simulator', icon: PlayCircle },
  { title: 'Executive Identity™', desc: 'A verified, evidence-backed executive identity and portfolio that travels with you.', route: '/executive-portfolio', icon: Fingerprint },
  { title: 'Executive Success Stories™', desc: 'Evidence-generated narratives of real leadership growth — not testimonials, proof.', route: '/executive-success-stories', icon: Trophy },
  { title: 'Enterprise-ready architecture', desc: 'Governance, security, and scalability built for organizations from day one.', route: '/for-enterprise', icon: Building2 },
];

export default function WhyChooseExecLead() {
  return (
    <section className="py-16 md:py-24 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">Why Professionals Choose EXECLEAD.AI</div>
          <h2 className="text-2xl md:text-4xl font-bold mb-3">One Platform. Every Step of the Journey.</h2>
          <p className="text-white/45 max-w-2xl mx-auto text-sm">The capabilities ambitious professionals rely on to assess, develop, and prove executive leadership.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CARDS.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div key={c.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                <Link to={c.route} className="group block h-full rounded-2xl border border-white/8 bg-white/[0.02] hover:border-accent-orange/30 hover:bg-accent-orange/[0.04] p-5 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-accent-orange/10 flex items-center justify-center mb-3"><Icon size={18} className="text-accent-orange" /></div>
                  <h3 className="text-white font-semibold text-sm mb-1.5">{c.title}</h3>
                  <p className="text-white/45 text-xs leading-relaxed mb-3">{c.desc}</p>
                  <span className="inline-flex items-center gap-1 text-[11px] text-accent-orange/80 font-medium">Explore <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" /></span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}