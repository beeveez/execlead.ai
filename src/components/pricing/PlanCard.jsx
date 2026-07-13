import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { PLAN_CONTENT } from "@/lib/pricingContent";
import { getPlanCta, getCurrentPlatformMode } from "@/lib/launchMode";
import FounderPriceBadge from "./FounderPriceBadge";

const fmt = (n) => {
  const r = Math.round(n * 100) / 100;
  return `$${r % 1 === 0 ? r.toString() : r.toFixed(2)}`;
};

export default function PlanCard({ plan, cycle, getPrice, calculatePrice, isFounder, currentPlanId, authed, index, betaMode, onReserve }) {
  const content = PLAN_CONTENT[plan.id];
  if (!content) return null;

  const price = getPrice(plan);
  const founderPricing = calculatePrice(plan, cycle);
  const isCustom = plan.customPricing;
  const isExecutive = plan.id === "executive";
  const isFree = plan.id === "free";
  const isCurrentPlan = currentPlanId === plan.id;
  const annualSavings = plan.monthlyPrice * 12 - plan.annualPrice;
  const showAnnualSavings = cycle === "annual" && annualSavings > 0;

  // Founder savings — always based on monthly prices per the entitlement formula
  const monthlyCalc = calculatePrice(plan, "monthly");
  const monthlySavings = Math.round((monthlyCalc.originalPrice - monthlyCalc.finalPrice) * 100) / 100;
  const founderAnnualSavings = Math.round(monthlySavings * 12 * 100) / 100;

  const showFounderPricing = founderPricing.applied && !isCustom && !isFree;
  const showFounderCard = showFounderPricing || (isCustom && founderPricing.isFounder);
  const platformMode = getCurrentPlatformMode();
  const betaActive = platformMode.isBeta;
  const betaCta = betaActive ? getPlanCta(plan.id) : content.cta;
  const betaLink = betaActive ? `/beta?tier=${plan.id === "free" ? "founding_beta" : plan.id === "professional" ? "founding_beta" : plan.id === "executive" ? "exec_beta" : "enterprise_beta"}` : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className={`relative rounded-2xl flex flex-col bg-gradient-to-b ${content.glow} to-transparent border ${
        showFounderCard
          ? "border-amber-500/30 shadow-[0_0_24px_rgba(245,158,11,0.06)]"
          : isExecutive
            ? "border-purple-500/40 ring-1 ring-purple-500/15"
            : content.ring
      }`}
    >
      {/* Beta Badge */}
      {betaActive && (
        <div className="absolute -top-3 left-4 bg-purple-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md whitespace-nowrap flex items-center gap-1" title="Pricing shown reflects planned General Availability subscriptions. Current access is invitation-only.">
          🟣 {platformMode.label} · Invitation Only
        </div>
      )}

      {/* Badges */}
      {showFounderPricing && (
        <div className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md whitespace-nowrap">
          🏆 LIFETIME
        </div>
      )}
      {isExecutive && !showFounderPricing && !isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap shadow-lg">
          Most Popular
        </div>
      )}
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap shadow-lg flex items-center gap-1">
          <Check size={12} /> Your Current Plan
        </div>
      )}

      <div className="p-6 flex flex-col flex-1">
        <div className="text-2xl mb-2">{plan.icon}</div>
        <h3 className="text-white font-bold text-lg">{plan.name}</h3>
        <p className={`text-sm font-medium ${content.accent} mt-1 min-h-[2.5rem]`}>{content.headline}</p>

        {/* Price Area */}
        <div className="mt-5 mb-1">
          {isCustom ? (
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">Custom</span>
            </div>
          ) : isFree ? (
            <div>
              <span className="text-3xl font-bold text-white">Free</span>
              <p className="text-white/30 text-xs mt-1">Included for everyone</p>
            </div>
          ) : showFounderPricing ? (
            <div className="space-y-2.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl font-bold text-amber-400 tracking-tight">{fmt(founderPricing.finalPrice)}</span>
                <span className="text-white/30 text-sm">/{cycle === "monthly" ? "month" : "year"}</span>
              </div>
              <FounderPriceBadge
                regularPrice={monthlyCalc.originalPrice}
                founderPrice={monthlyCalc.finalPrice}
                monthlySavings={monthlySavings}
                annualSavings={founderAnnualSavings}
                isProtected={founderPricing.protected}
              />
              <div className="bg-amber-500/[0.04] border border-amber-500/10 rounded-lg p-2.5 space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-white/40">Regular Price</span>
                  <span className="text-white/50 line-through">{fmt(monthlyCalc.originalPrice)}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-white/40">You Save</span>
                  <span className="text-emerald-400 font-medium">{fmt(monthlySavings)}/month</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-white/40">Annual Savings</span>
                  <span className="text-emerald-400 font-medium">{fmt(founderAnnualSavings)}/year</span>
                </div>
              </div>
              {cycle === "annual" && (
                <p className="text-white/30 text-[10px]">Billed annually at {fmt(founderPricing.finalPrice)}/year</p>
              )}
            </div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white tracking-tight">{price === 0 ? "Free" : fmt(price)}</span>
              {price !== 0 && <span className="text-white/30 text-sm">/{cycle === "monthly" ? "month" : "year"}</span>}
            </div>
          )}
        </div>

        {/* Subtext */}
        <div className="min-h-[1.5rem]">
          {isFree && isFounder ? (
            <p className="text-amber-400/60 text-xs">Upgrade anytime while keeping your Founder benefits.</p>
          ) : showFounderPricing ? null : showAnnualSavings ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 rounded-md text-emerald-400 text-xs font-medium">
              Save {fmt(annualSavings)}/year
            </span>
          ) : (
            <p className="text-white/30 text-xs">
              {isCustom ? `Starting at ${content.startingUsers} users` : cycle === "annual" && price !== 0 ? "Billed annually" : price === 0 ? "Free forever" : "Billed monthly"}
            </p>
          )}
        </div>

        {/* Enterprise Founder Benefit */}
        {isCustom && founderPricing.isFounder && (
          <div className="mt-3 bg-amber-500/[0.04] border border-amber-500/15 rounded-lg p-3">
            <div className="text-amber-400 text-xs font-semibold mb-1">🏆 Founding Member Benefit</div>
            <p className="text-white/50 text-xs leading-relaxed mb-2">
              Your approved enterprise proposal automatically receives a {founderPricing.discount}% lifetime discount before billing.
            </p>
            <ul className="space-y-1">
              <li className="flex items-center gap-1.5 text-[11px] text-white/40">
                <Check size={12} className="text-amber-400" /> Lifetime protected pricing
              </li>
              <li className="flex items-center gap-1.5 text-[11px] text-white/40">
                <Check size={12} className="text-amber-400" /> Applies to approved proposals
              </li>
              <li className="flex items-center gap-1.5 text-[11px] text-white/40">
                <Check size={12} className="text-amber-400" /> Automatically calculated
              </li>
            </ul>
          </div>
        )}

        {/* Founder Pricing Applied indicator for current plan */}
        {isCurrentPlan && isFounder && !isFree && !isCustom && (
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 rounded-md text-amber-400 text-xs font-medium w-fit">
            🏆 Founder Pricing Applied
          </div>
        )}

        {/* Audience Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5 min-h-[3rem]">
          {content.audience.slice(0, 4).map(a => (
            <span key={a} className="px-2 py-0.5 bg-white/5 rounded-md text-white/40 text-[10px] font-medium">{a}</span>
          ))}
          {content.audience.length > 4 && <span className="px-2 py-0.5 text-white/30 text-[10px]">+{content.audience.length - 4}</span>}
        </div>

        {/* Benefits */}
        <ul className="mt-5 space-y-2.5 flex-1">
          {content.benefits.map((benefit, j) => (
            <li key={j} className="flex items-start gap-2 text-sm text-white/60">
              <Check size={15} className={`${showFounderPricing ? "text-amber-400" : content.accent} mt-0.5 flex-shrink-0`} />
              {benefit}
            </li>
          ))}
        </ul>

        {/* ROI */}
        <div className="mt-5 bg-white/[0.03] border border-white/5 rounded-lg p-3 flex items-start gap-2">
          <Sparkles size={14} className={`${content.accent} flex-shrink-0 mt-0.5`} />
          <p className="text-white/50 text-xs leading-relaxed">{content.roi}</p>
        </div>

        {/* CTA */}
        <div className="mt-5">
          {isCurrentPlan ? (
            <div className="flex items-center justify-center w-full py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">
              <Check size={16} className="mr-1.5" /> Active Plan
            </div>
          ) : betaActive ? (
            <Link
              to={betaLink}
              className={`flex items-center justify-center gap-1.5 w-full py-3 rounded-xl text-sm font-semibold transition-colors ${
                isCustom
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : isExecutive
                    ? "bg-purple-500 hover:bg-purple-600 text-white"
                    : isFree
                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                      : plan.id === "professional"
                        ? "bg-indigo-500 hover:bg-indigo-600 text-white"
                        : "bg-white/5 hover:bg-white/10 text-white/80 border border-white/10"
              }`}
            >
              {betaCta} <ArrowRight size={14} />
            </Link>
          ) : isCustom ? (
            <div className="space-y-2">
              <Link to={authed ? "/cpq" : "/register?redirect=/dashboard"} className="flex items-center justify-center gap-1.5 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors">
                {content.cta} <ArrowRight size={14} />
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <Link to="#demo" className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition-colors">
                  Book Demo
                </Link>
                <a href="mailto:sales@execlead.ai" className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition-colors">
                  Talk to Sales
                </a>
              </div>
            </div>
          ) : (
            <Link
              to={authed ? "/billing" : "/register?redirect=/dashboard"}
              className={`flex items-center justify-center gap-1.5 w-full py-3 rounded-xl text-sm font-semibold transition-colors ${
                showFounderPricing
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white"
                  : isExecutive
                    ? "bg-purple-500 hover:bg-purple-600 text-white"
                    : plan.id === "professional"
                      ? "bg-indigo-500 hover:bg-indigo-600 text-white"
                      : "bg-white/5 hover:bg-white/10 text-white/80 border border-white/10"
              }`}
            >
              {content.cta} <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}