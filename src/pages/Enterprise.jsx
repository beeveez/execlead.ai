import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, BarChart3, Sparkles, ShieldCheck, ArrowRight, Users, Gauge } from 'lucide-react';
import { BrandRegistry } from '@/lib/brandRegistry';

const SECTIONS = [
  { icon: Users, title: 'Why organizations choose EXECLEAD.AI', body: 'A single platform to assess, develop, and prove executive readiness across your leadership pipeline — not another learning library.' },
  { icon: Building2, title: 'Leadership development at scale', body: 'Deploy consistent executive development across teams, departments, and geographies with cohort-level visibility.' },
  { icon: Gauge, title: 'Executive readiness analytics', body: 'Measure readiness, gaps, and growth across your organization with evidence-based dashboards — not activity metrics.' },
  { icon: Sparkles, title: 'AI-powered coaching', body: 'Personalized, context-aware executive coaching for every leader, modeled on former CIOs, COOs, and CFOs.' },
  { icon: ShieldCheck, title: 'Enterprise governance', body: 'Role-based access, audit trails, SSO, and data governance designed for regulated industries from day one.' },
  { icon: BarChart3, title: 'Trust Center', body: 'Public transparency into security, responsible AI, availability, and roadmap — verify before you buy.', route: '/trust-center' },
];

export default function Enterprise() {
  return (
    <div className="bg-[#0a0a0f] pt-28 pb-20 px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-orange/10 border border-accent-orange/25 rounded-full text-xs text-accent-orange font-semibold mb-5">
          <Building2 size={12} /> Enterprise Platform™
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-4">
          Develop Leaders at Scale.
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-base md:text-lg text-white/60 max-w-2xl mb-8 leading-relaxed">
          EXECLEAD.AI helps organizations build the next generation of executive leaders — with evidence-based Executive Readiness™, AI coaching, and enterprise-grade governance.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="flex flex-col sm:flex-row gap-3 mb-14">
          <Link to="/contact" className="bg-accent-orange hover:bg-accent-orange/90 text-white font-semibold px-7 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5">
            Book Enterprise Demo <ArrowRight size={17} />
          </Link>
          <Link to="/contact" className="bg-transparent hover:bg-white/5 border border-white/15 text-white/80 font-medium px-7 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
            Contact Sales <ArrowRight size={16} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-14">
          {SECTIONS.map((s, i) => {
            const Icon = s.icon;
            const inner = (
              <div className="h-full rounded-2xl border border-white/8 bg-white/[0.02] hover:border-accent-orange/25 hover:bg-accent-orange/[0.03] p-6 transition-all">
                <div className="w-10 h-10 rounded-xl bg-accent-orange/10 flex items-center justify-center mb-3"><Icon size={18} className="text-accent-orange" /></div>
                <h3 className="text-white font-semibold text-sm mb-1.5">{s.title}</h3>
                <p className="text-white/45 text-xs leading-relaxed">{s.body}</p>
              </div>
            );
            return (
              <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                {s.route ? <Link to={s.route} className="block">{inner}</Link> : inner}
              </motion.div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-accent-orange/20 bg-gradient-to-br from-accent-orange/[0.06] to-transparent p-6 md:p-8 text-center">
          <h2 className="text-xl md:text-2xl font-bold mb-2">Ready to build your leadership pipeline?</h2>
          <p className="text-white/45 text-sm mb-6 max-w-xl mx-auto">{BrandRegistry.tagline}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/contact" className="bg-accent-orange hover:bg-accent-orange/90 text-white font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">Book Enterprise Demo <ArrowRight size={16} /></Link>
            <Link to="/trust-center" className="bg-white/5 hover:bg-white/10 border border-white/15 text-white/80 font-medium px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">Visit Trust Center <ArrowRight size={15} /></Link>
          </div>
        </div>
      </div>
    </div>
  );
}