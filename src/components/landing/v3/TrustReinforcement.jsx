import React from 'react';
import { motion } from 'framer-motion';
import {
  BadgeCheck,
  Gauge,
  Eye,
  ShieldCheck,
  Fingerprint,
  Lock,
} from 'lucide-react';

/**
 * Trust Reinforcement™ — compact trust strip directly above pricing.
 */
const PILLARS = [
  { icon: BadgeCheck, label: 'Evidence-Based Development', desc: 'Growth backed by verified leadership evidence.' },
  { icon: Gauge, label: 'Executive Readiness Tracking', desc: 'Continuous measurement of readiness over time.' },
  { icon: Eye, label: 'AI Decision Transparency', desc: 'Explainable AI guidance you can inspect.' },
  { icon: ShieldCheck, label: 'Responsible AI Governance', desc: 'Guardrails, reviews, and accountable AI use.' },
  { icon: Fingerprint, label: 'Executive Identity Protection', desc: 'Your identity, evidence, and reputation protected.' },
  { icon: Lock, label: 'Enterprise Privacy & Security', desc: 'Enterprise-grade privacy and security by design.' },
];

export default function TrustReinforcement() {
  return (
    <section id="trust" className="py-12 md:py-14 px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <div className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mb-1.5">
            Trust & Responsibility
          </div>
          <h2 className="text-lg md:text-xl font-semibold text-white/85">Built for accountable leadership intelligence</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-center"
            >
              <p.icon size={18} className="text-cyan-400 mx-auto mb-2" />
              <div className="text-[11px] font-semibold text-white/80 leading-tight">{p.label}</div>
              <div className="text-[10px] text-white/40 mt-1.5 leading-relaxed">{p.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}