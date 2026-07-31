import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, Map, Award, Infinity, Headphones, DollarSign, Users, ArrowRight, Zap } from 'lucide-react';

const BENEFITS = [
  { icon: Rocket, title: 'Early Access', desc: 'Be first to experience the Executive Leadership Operating System™.' },
  { icon: Map, title: 'Influence Roadmap', desc: 'Shape the features and modules that matter to your journey.' },
  { icon: Award, title: 'Founding Badge', desc: 'A permanent Founding Member badge on your Executive Identity.' },
  { icon: Infinity, title: 'Lifetime Recognition', desc: 'Your contribution to the platform is recognized forever.' },
  { icon: Headphones, title: 'Priority Support', desc: 'Direct access to the team building EXECLEAD.AI.' },
  { icon: DollarSign, title: 'Exclusive Pricing', desc: 'Founding pricing locked in for life — never available again.' },
  { icon: Users, title: 'Founding Community', desc: 'Join a curated group of future executive leaders.' },
];

export default function FoundingBetaBenefits({ authed }) {
  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-orange/10 border border-accent-orange/25 rounded-full text-xs text-accent-orange font-semibold mb-4">
            <Zap size={12} /> FOUNDING PRIVATE BETA™
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Founding Membership. Limited. Lifetime.</h2>
          <p className="text-white/45 max-w-2xl mx-auto text-sm">Founding Members shape the product and receive Founding benefits for life.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto mb-10">
          {BENEFITS.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div key={b.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.02] p-5">
                <div className="w-10 h-10 rounded-xl bg-accent-orange/15 flex items-center justify-center shrink-0"><Icon size={18} className="text-accent-orange" /></div>
                <div>
                  <div className="text-[13px] font-semibold text-white mb-1">{b.title}</div>
                  <p className="text-[11.5px] text-white/45 leading-relaxed">{b.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="text-center">
          <Link to={authed ? '/assessment' : '/beta'} className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-white text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-orange/25">
            Apply for Founding Membership <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}