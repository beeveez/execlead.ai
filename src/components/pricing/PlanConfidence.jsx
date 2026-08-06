import React from 'react';
import { motion } from 'framer-motion';
import { Clock, User, Compass, Map } from 'lucide-react';
import { PLAN_CONFIDENCE } from '@/lib/pricingContent';

const PLANS = [
  { id: 'free', name: 'Free' },
  { id: 'professional', name: 'Professional' },
  { id: 'executive', name: 'Executive' },
  { id: 'enterprise', name: 'Enterprise' },
];

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-accent-orange/10 flex items-center justify-center shrink-0"><Icon size={13} className="text-accent-orange" /></div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-white/30 font-semibold">{label}</div>
        <div className="text-white/70 text-xs leading-relaxed">{value}</div>
      </div>
    </div>
  );
}

export default function PlanConfidence() {
  return (
    <section className="px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">Plan Confidence™</div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Know What to Expect Before You Start</h2>
          <p className="text-white/45 text-sm max-w-xl mx-auto">Every plan, clearly mapped — so you can choose with confidence.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((p, i) => {
            const c = PLAN_CONFIDENCE[p.id];
            if (!c) return null;
            return (
              <motion.div key={p.id} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
                <h3 className="text-white font-semibold text-sm mb-4">{p.name}</h3>
                <div className="space-y-3">
                  <Row icon={User} label="Best for" value={c.bestFor} />
                  <Row icon={Clock} label="Weekly commitment" value={c.commitment} />
                  <Row icon={Compass} label="Experience level" value={c.experience} />
                  <Row icon={Map} label="Expected journey" value={c.journey} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}