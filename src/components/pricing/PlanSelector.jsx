import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Compass } from 'lucide-react';
import { PLAN_CONTENT } from '@/lib/pricingContent';
import { usePlatformLaunchMode } from '@/lib/launchMode';
import { GOAL_TO_FUTURE_PLAN } from '@/lib/membershipRecommendationEngine';
import BetaMembershipRecommendation from './BetaMembershipRecommendation';

const OPTIONS = [
  { id: 'explore', label: "I'm exploring executive leadership", plan: 'free', reason: "Start free and discover your Executive Readiness™ before investing in your growth." },
  { id: 'first', label: "I want my first leadership role", plan: 'professional', reason: "Build measurable leadership capability through AI coaching, simulations, and personalized learning." },
  { id: 'director', label: "I want to become a Director", plan: 'executive', reason: "Continuously measure, develop, and prove Executive Readiness™ for senior leadership." },
  { id: 'lead', label: "I lead a team", plan: 'executive', reason: "Develop the executive capabilities organizations expect from team leaders and managers." },
  { id: 'develop', label: "I develop leaders", plan: 'enterprise', reason: "Create measurable leadership intelligence across your entire organization." },
];

const PLAN_LINK = {
  free: '/register?redirect=/dashboard',
  professional: '/register?redirect=/dashboard',
  executive: '/register?redirect=/dashboard',
  enterprise: '/for-enterprise',
};

export default function PlanSelector() {
  const [selected, setSelected] = useState(null);
  const { isBeta } = usePlatformLaunchMode();
  const rec = selected ? OPTIONS.find((o) => o.id === selected) : null;

  return (
    <section className="px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs text-indigo-400 font-medium mb-3">
            <Compass size={13} /> Plan Finder
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Which Plan Is Right For Me?</h2>
          <p className="text-white/45 text-sm max-w-xl mx-auto">Pick the statement that fits you — we'll recommend the right starting point on your leadership journey.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              onClick={() => setSelected(o.id)}
              className={`text-left rounded-xl border px-4 py-3 text-sm transition-all ${
                selected === o.id
                  ? 'border-accent-orange/40 bg-accent-orange/[0.06] text-white'
                  : 'border-white/10 bg-white/[0.02] text-white/65 hover:border-white/25 hover:bg-white/[0.04]'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {rec && (
            isBeta ? (
              <motion.div
                key={`beta-${rec.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <BetaMembershipRecommendation futurePlanId={GOAL_TO_FUTURE_PLAN[rec.id]} />
              </motion.div>
            ) : (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-accent-orange/25 bg-gradient-to-br from-accent-orange/[0.06] to-transparent p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1">
                  <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-1">Recommended</div>
                  <h3 className="text-white font-semibold text-base mb-1">{PLAN_CONTENT[rec.plan]?.headline}</h3>
                  <p className="text-white/55 text-sm leading-relaxed">{rec.reason}</p>
                </div>
                <Link
                  to={PLAN_LINK[rec.plan]}
                  className="shrink-0 bg-accent-orange hover:bg-accent-orange/90 text-white font-semibold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors"
                >
                  {PLAN_CONTENT[rec.plan]?.cta || 'Get Started'} <ArrowRight size={15} />
                </Link>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}