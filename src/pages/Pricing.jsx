import React, { useState, useEffect, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { usePricingCatalog } from "@/hooks/usePricingCatalog";
import { ArrowRight, Sparkles, Building2, Calculator, ShieldCheck, Rocket } from "lucide-react";
import PricingTiers from "@/components/pricing/PricingTiers";
import PaymentTrust from "@/components/billing/PaymentTrust";
import DomainFAQ from "@/components/marketing/DomainFAQ";
import { captureReferralCode } from "@/lib/socialShare";
import { useLaunchMode, usePlatformLaunchMode } from "@/lib/launchMode";

// Below-the-fold sections are lazy-loaded so the hero + pricing tiers
// render immediately without waiting for their code or API calls.
const SectionFallback = () => (
  <div className="flex items-center justify-center h-40">
    <div className="w-6 h-6 border-2 border-white/10 border-t-indigo-400 rounded-full animate-spin" />
  </div>
);
const EnterpriseValue = lazy(() => import("@/components/pricing/EnterpriseValue"));
const FeatureShowcase = lazy(() => import("@/components/pricing/FeatureShowcase"));
const ComparisonTable = lazy(() => import("@/components/pricing/ComparisonTable"));
const RoiCalculator = lazy(() => import("@/components/pricing/RoiCalculator"));
const EnterpriseCalculator = lazy(() => import("@/components/pricing/EnterpriseCalculator"));
const SocialProof = lazy(() => import("@/components/pricing/SocialProof"));
const Faq = lazy(() => import("@/components/pricing/Faq"));
const FoundingMember = lazy(() => import("@/components/pricing/FoundingMember"));
const TrustBadges = lazy(() => import("@/components/pricing/TrustBadges"));
const BookDemoForm = lazy(() => import("@/components/pricing/BookDemoForm"));
const ShareYourJourney = lazy(() => import("@/components/pricing/ShareYourJourney"));
const ReferralProgram = lazy(() => import("@/components/referral/ReferralProgram"));

export default function Pricing() {
  const [authed, setAuthed] = useState(false);
  const { plans, cycle, setCycle, getPrice } = usePricingCatalog();
  const { betaBillingMode, launchMode } = useLaunchMode();
  const { mode, isBeta } = usePlatformLaunchMode();

  useEffect(() => {
    captureReferralCode();
    base44.auth.isAuthenticated().then(setAuthed).catch(() => {});
  }, []);

  return (
    <>

      {/* Hero */}
      <section className="pt-40 pb-12 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full mb-6">
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-white/50 text-xs font-medium">The Executive Leadership Operating System™</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
            Choose the Membership That Matches <span className="text-indigo-400">Your Leadership Journey</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed">
            Whether you're an aspiring manager, an experienced executive, or an enterprise transforming leadership at scale, EXECLEAD.AI provides a membership aligned to your leadership journey.
            </motion.p>
          {isBeta && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="inline-flex flex-col gap-1 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl mt-2">
              <span className="text-amber-400 text-sm font-semibold flex items-center gap-1.5">
                <Rocket size={14} /> Founding Private Beta™
              </span>
              <span className="text-white/40 text-xs">Membership plans shown represent planned General Availability pricing.</span>
              <span className="text-white/40 text-xs">Current platform access is by application and invitation only.</span>
            </motion.div>
          )}
        </div>
      </section>

      {/* Sticky Billing Toggle + Pricing Tiers */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="sticky top-16 z-30 -mx-4 px-4 py-3 bg-[#08080d]/90 backdrop-blur-xl border-y border-white/5 mb-10">
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setCycle("monthly")} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${cycle === "monthly" ? "bg-indigo-500/15 text-indigo-400" : "text-white/40 hover:text-white/70"}`}>Monthly</button>
              <button onClick={() => setCycle("annual")} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${cycle === "annual" ? "bg-indigo-500/15 text-indigo-400" : "text-white/40 hover:text-white/70"}`}>Annual <span className="text-emerald-400 text-xs ml-1">2 months free</span></button>
            </div>
          </div>
          {/* Beta Billing banner — shown when payment provider is not connected */}
          {isBeta && (
            <div className="max-w-3xl mx-auto mb-8 bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5 flex items-start gap-3">
              <Rocket size={20} className="text-purple-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-purple-400 font-semibold text-sm mb-1">🟣 {mode.label} ({mode.buildLabel || mode.version})</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  EXECLEAD.AI is currently in Founding Private Beta (Release Candidate 1). Pricing shown represents planned General Availability subscriptions. <span className="text-purple-400 font-medium">Current access is invitation-only.</span>
                </p>
              </div>
            </div>
          )}
          <div className="text-center mb-10">
            <p className="text-xl md:text-2xl font-medium text-white/80 mb-2">One Leadership Journey. One AI Platform.</p>
            <p className="text-white/40 text-sm max-w-xl mx-auto">Choose the membership that matches where you are today—and upgrade as your leadership journey evolves.</p>
          </div>
          <PricingTiers plans={plans} cycle={cycle} getPrice={getPrice} authed={authed} />
          <div className="max-w-2xl mx-auto mt-8">
            <PaymentTrust />
          </div>
        </div>
      </section>

      {/* Founding Member Program */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Suspense fallback={<SectionFallback />}><FoundingMember /></Suspense>
        </div>
      </section>

      {/* Share Your Journey */}
      <section className="py-20 px-4 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <Suspense fallback={<SectionFallback />}><ShareYourJourney authed={authed} /></Suspense>
        </div>
      </section>

      {/* Enterprise Value — Outcomes */}
      <section className="py-20 px-4 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4">
              <Building2 size={14} className="text-emerald-400" />
              <span className="text-emerald-400 text-xs font-medium">Target Outcomes</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-2">Expected Business Outcomes</h2>
            <p className="text-xl font-semibold text-indigo-400 mb-3">Invest in Leaders, Not Just Software.</p>
            <p className="text-white/40 max-w-2xl mx-auto text-lg">Target outcomes for organizations investing in leadership transformation. These represent product goals — not yet measured results.</p>
          </div>
          <Suspense fallback={<SectionFallback />}><EnterpriseValue /></Suspense>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything You Get</h2>
            <p className="text-white/40 max-w-2xl mx-auto text-lg">Organized by plan — see exactly what's included at each tier without scrolling through endless checklists.</p>
          </div>
          <Suspense fallback={<SectionFallback />}><FeatureShowcase /></Suspense>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Compare Capabilities</h2>
            <p className="text-white/40 text-lg">Every capability, side by side.</p>
          </div>
          <Suspense fallback={<SectionFallback />}><ComparisonTable /></Suspense>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-4">
              <Calculator size={14} className="text-indigo-400" />
              <span className="text-indigo-400 text-xs font-medium">Illustrative Example</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">ROI Illustration</h2>
            <p className="text-white/40 max-w-2xl mx-auto text-lg">Illustrative example showing how leadership development could translate to business impact. Figures are estimates based on industry assumptions, not measured results.</p>
          </div>
          <Suspense fallback={<SectionFallback />}><RoiCalculator /></Suspense>
        </div>
      </section>

      {/* Enterprise Estimator */}
      <section className="py-20 px-4 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4">
              <Building2 size={14} className="text-emerald-400" />
              <span className="text-emerald-400 text-xs font-medium">Enterprise Estimator</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Estimate Your Investment</h2>
            <p className="text-white/40 max-w-2xl mx-auto text-lg">Configure your ideal package and get an instant estimate. Adjust users, modules, AI, support, and contract length to see real-time pricing.</p>
          </div>
          <Suspense fallback={<SectionFallback />}><EnterpriseCalculator /></Suspense>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Beta Program Overview</h2>
            <p className="text-white/40 max-w-2xl mx-auto text-lg">EXECLEAD.AI is being built for organizations across industries. Here's an overview of the founding beta program.</p>
          </div>
          <Suspense fallback={<SectionFallback />}><SocialProof /></Suspense>
        </div>
      </section>

      {/* Refer & Earn */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Suspense fallback={<SectionFallback />}><ReferralProgram authed={authed} /></Suspense>
        </div>
      </section>

      {/* Book Demo */}
      <section id="demo" className="py-20 px-4 bg-white/[0.01] scroll-mt-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4">
              <Building2 size={14} className="text-emerald-400" />
              <span className="text-emerald-400 text-xs font-medium">Enterprise Demo</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Book a Demo</h2>
            <p className="text-white/40 text-lg">Tell us about your organization and we'll be in touch within 24 hours.</p>
          </div>
          <Suspense fallback={<SectionFallback />}><BookDemoForm /></Suspense>
        </div>
      </section>

      {/* Trust */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full mb-4">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span className="text-white/50 text-xs font-medium">Trust & Security</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Enterprise-Grade Trust</h2>
            <p className="text-white/40 max-w-2xl mx-auto text-lg">Our security architecture is designed to meet enterprise-grade standards as the platform matures toward General Availability.</p>
          </div>
          <Suspense fallback={<SectionFallback />}><TrustBadges /></Suspense>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-white/40 text-lg">Everything you need to know before getting started.</p>
          </div>
          <Suspense fallback={<SectionFallback />}><Faq /></Suspense>
          <div className="max-w-3xl mx-auto mt-8">
            <DomainFAQ />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="bg-gradient-to-br from-amber-500/10 via-indigo-500/5 to-emerald-500/5 border border-white/10 rounded-3xl p-12 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Join the Founding Private Beta™</h2>
            <p className="text-white/40 mb-8 max-w-xl mx-auto text-lg">Become one of the first executive professionals shaping an AI Executive Leadership Operating System. Invitation-only — apply today.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {authed ? (
                <Link to="/dashboard" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-8 py-3.5 rounded-xl transition-colors">
                  Go to Dashboard <ArrowRight size={18} />
                </Link>
              ) : (
                <Link to="/beta" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium px-8 py-3.5 rounded-xl transition-colors">
                  Apply for Private Beta™ <ArrowRight size={18} />
                </Link>
              )}
              <Link to="/beta?tier=enterprise_beta" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-medium px-8 py-3.5 rounded-xl transition-colors">
                Request Enterprise Beta™ <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </>
  );
}