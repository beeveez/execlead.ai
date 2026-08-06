import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Star, Clock } from 'lucide-react';
import {
  FOUNDING_EXECUTIVE_BETA,
  GA_FUTURE_PLAN_LABELS,
  PREDICTIVE_MEMBERSHIP_PATH,
  BETA_OPTIONS_ANALYSIS,
  FOUNDING_MEMBER_MESSAGING,
} from '@/lib/membershipRecommendationEngine';
import { usePricingCatalog } from '@/hooks/usePricingCatalog';

function PriceLabel({ plan, cycle }) {
  if (!plan || plan.monthlyPrice === 0) return null;
  const price = cycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
  return <span>US${price}/month{cycle === 'annual' ? ' · billed annually' : ''}</span>;
}

export default function BetaMembershipRecommendation({ futurePlanId }) {
  const { getPlanById, cycle } = usePricingCatalog();
  const professional = getPlanById('professional');
  const executive = getPlanById('executive');
  const gaCards = [
    { plan: professional, meta: GA_FUTURE_PLAN_LABELS.professional, future: futurePlanId === 'professional' },
    { plan: executive, meta: GA_FUTURE_PLAN_LABELS.executive, future: futurePlanId === 'executive' },
  ].filter((c) => c.plan);

  return (
    <div className="space-y-8">
      {/* ⭐ Primary — Founding Executive Beta */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/[0.08] via-amber-500/[0.03] to-transparent p-6"
      >
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full text-[11px] text-amber-300 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> {FOUNDING_EXECUTIVE_BETA.status}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded-full text-[11px] text-white/70 font-medium">
            <Star size={11} className="text-amber-400" /> Recommended
          </span>
        </div>
        <h3 className="text-xl font-bold text-white mb-1.5">{FOUNDING_EXECUTIVE_BETA.headline}</h3>
        <p className="text-white/55 text-sm leading-relaxed mb-4">{FOUNDING_EXECUTIVE_BETA.description}</p>
        <ul className="grid sm:grid-cols-2 gap-2 mb-5">
          {FOUNDING_EXECUTIVE_BETA.benefits.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-white/75">
              <Check size={14} className="text-emerald-400 mt-0.5 shrink-0" /> {b}
            </li>
          ))}
        </ul>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to={FOUNDING_EXECUTIVE_BETA.primaryCta.href}
            className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
          >
            {FOUNDING_EXECUTIVE_BETA.primaryCta.label} <ArrowRight size={15} />
          </Link>
          <Link
            to={FOUNDING_EXECUTIVE_BETA.secondaryCta.href}
            className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/15 text-white/75 font-medium text-sm px-5 py-2.5 rounded-xl transition-colors"
          >
            {FOUNDING_EXECUTIVE_BETA.secondaryCta.label}
          </Link>
        </div>
        <p className="text-white/40 text-xs mt-4 italic">{FOUNDING_MEMBER_MESSAGING}</p>
      </motion.div>

      {/* GA future plans */}
      <div>
        <div className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mb-3">
          Future General Availability Plans
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {gaCards.map(({ plan, meta, future }) => (
            <div
              key={plan.id}
              className={`rounded-xl border p-4 ${
                future ? 'border-indigo-500/40 bg-indigo-500/[0.05]' : 'border-white/10 bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-white font-semibold text-sm">{plan.name}</div>
                {future && <span className="text-[10px] text-indigo-300 font-medium">Your Future Plan</span>}
              </div>
              <div className="text-white/60 text-xs mb-1.5">
                <PriceLabel plan={plan} cycle={cycle} />
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[10px] text-white/50 mb-2.5">
                {meta.badge}
              </span>
              <p className="text-white/50 text-xs leading-relaxed mb-3">{meta.description}</p>
              <Link
                to="/beta"
                className="inline-flex items-center gap-1 text-xs text-accent-orange hover:text-accent-orange/80 transition-colors"
              >
                {meta.cta} <ArrowRight size={12} />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Predictive Membership Path™ */}
      <div>
        <div className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mb-3 flex items-center gap-1.5">
          <Clock size={12} /> Predictive Membership Path™
        </div>
        <ol className="relative pl-6 border-l border-white/10 space-y-3">
          {PREDICTIVE_MEMBERSHIP_PATH.map((step, i) => (
            <li key={step.id} className="relative">
              <span className="absolute -left-[1.55rem] flex items-center justify-center w-5 h-5 rounded-full bg-white/5 border border-white/15 text-[10px] text-white/50 font-medium">
                {i + 1}
              </span>
              <span className="text-sm text-white/70">{step.label}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Executive Options Analysis™ */}
      <div>
        <div className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mb-3">
          Executive Options Analysis™
        </div>
        <div className="space-y-2.5">
          {BETA_OPTIONS_ANALYSIS.map((opt) => (
            <div
              key={opt.id}
              className={`rounded-xl border p-4 ${
                opt.recommended ? 'border-amber-500/30 bg-amber-500/[0.04]' : 'border-white/10 bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-white/40 font-semibold">#{opt.rank}</span>
                  <span className="text-white font-semibold text-sm">{opt.name}</span>
                  {opt.recommended && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 rounded-full text-[10px] text-amber-300 font-semibold">
                      <Star size={9} /> Recommended
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-white/50">{opt.status}</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 mb-2.5">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-emerald-400/70 font-semibold mb-1">Pros</div>
                  <ul className="space-y-1">
                    {opt.pros.map((p) => (
                      <li key={p} className="flex items-start gap-1.5 text-xs text-white/65">
                        <Check size={12} className="text-emerald-400 mt-0.5 shrink-0" /> {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-rose-400/70 font-semibold mb-1">Cons</div>
                  <ul className="space-y-1">
                    {opt.cons.map((c) => (
                      <li key={c} className="flex items-start gap-1.5 text-xs text-white/55">
                        <span className="text-rose-400/70 mt-0.5">•</span> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-white/45 pt-2 border-t border-white/5">
                <span>Risk: <span className="text-white/70">{opt.risk}</span></span>
                {opt.confidence !== undefined && (
                  <span>Confidence: <span className="text-white/70">{opt.confidence}%</span></span>
                )}
                <span>Availability: <span className="text-white/70">{opt.availability}</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}