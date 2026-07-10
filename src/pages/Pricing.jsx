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
import { useLaunchMode } from "@/lib/launchMode";

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
            <span className="text-white/50 text-xs font-medium">The Executive Leadership Operating System</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
            Invest in <span className="text-indigo-400">Leaders</span>,<br />Not Just Software
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-white/40 text-lg max-w-2xl mx-auto leading-relaxed">
            You're not buying a tool. You're investing in the development of executive leaders and the future capability of your organization.
          </motion.p>
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
          {betaBillingMode && (
            <div className="max-w-3xl mx-auto mb-8 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-3">
              <Rocket size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-amber-400 font-semibold text-sm mb-1">{launchMode?.label} — Founding Membership Sales Opening Soon</h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  EXECLEAD.AI is currently in Public Beta. Premium plans are visible but payments aren't live yet. <span className="text-amber-400 font-medium">Reserve your Founding Membership today</span> — you'll be invited to activate your subscription when payments go live.
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
              <span className="text-emerald-400 text-xs font-medium">Enterprise Outcomes</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">What You Achieve</h2>
            <p className="text-white/40 max-w-2xl mx-auto text-lg">Not features. Business outcomes. This is what organizations gain when they invest in leadership transformation.</p>
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
              <span className="text-indigo-400 text-xs font-medium">ROI Calculator</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Measure Your Return</h2>
            <p className="text-white/40 max-w-2xl mx-auto text-lg">See how leadership development translates to measurable business impact — reduced coaching costs, lower turnover, stronger internal mobility, and productivity gains.</p>
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
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Leadership Success Stories</h2>
            <p className="text-white/40 max-w-2xl mx-auto text-lg">Organizations across industries trust EXECLEAD.AI to develop their next generation of leaders.</p>
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
            <p className="text-white/40 max-w-2xl mx-auto text-lg">Your data is protected with the same standards trusted by the world's largest organizations.</p>
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
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-emerald-500/5 border border-white/10 rounded-3xl p-12 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Begin Your Leadership Journey</h2>
            <p className="text-white/40 mb-8 max-w-xl mx-auto text-lg">Start free today. Upgrade when you're ready to go all-in on your executive development. Enterprise solutions for organizations of any size.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to={authed ? "/dashboard" : "/register"} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-8 py-3.5 rounded-xl transition-colors">
                {authed ? "Go to Dashboard" : "Start Free"} <ArrowRight size={18} />
              </Link>
              <Link to="/cpq" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-medium px-8 py-3.5 rounded-xl transition-colors">
                Configure Proposal <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </>
  );
}