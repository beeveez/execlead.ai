import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { usePricingCatalog } from "@/hooks/usePricingCatalog";
import { ArrowRight, Sparkles, Building2, Calculator, ShieldCheck } from "lucide-react";
import Logo from "@/components/layout/Logo";
import PricingTiers from "@/components/pricing/PricingTiers";
import EnterpriseValue from "@/components/pricing/EnterpriseValue";
import FeatureShowcase from "@/components/pricing/FeatureShowcase";
import ComparisonTable from "@/components/pricing/ComparisonTable";
import RoiCalculator from "@/components/pricing/RoiCalculator";
import EnterpriseCalculator from "@/components/pricing/EnterpriseCalculator";
import SocialProof from "@/components/pricing/SocialProof";
import Faq from "@/components/pricing/Faq";
import FoundingMember from "@/components/pricing/FoundingMember";
import TrustBadges from "@/components/pricing/TrustBadges";
import BookDemoForm from "@/components/pricing/BookDemoForm";
import ShareYourJourney from "@/components/pricing/ShareYourJourney";
import ReferralProgram from "@/components/referral/ReferralProgram";
import { captureReferralCode } from "@/lib/socialShare";

export default function Pricing() {
  const [authed, setAuthed] = useState(false);
  const { plans, cycle, setCycle, getPrice } = usePricingCatalog();

  useEffect(() => {
    captureReferralCode();
    base44.auth.isAuthenticated().then(setAuthed).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#08080d] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#08080d]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link to="/"><Logo aiTagClass="ml-1" /></Link>
          <div className="flex items-center gap-3">
            {authed ? (
              <Link to="/dashboard" className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="text-sm text-white/50 hover:text-white transition-colors">Sign In</Link>
                <Link to="/register" className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Start Free</Link>
              </>
            )}
          </div>
        </div>
      </nav>

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
          <PricingTiers plans={plans} cycle={cycle} getPrice={getPrice} authed={authed} />
        </div>
      </section>

      {/* Founding Member Program */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <FoundingMember />
        </div>
      </section>

      {/* Share Your Journey */}
      <section className="py-20 px-4 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <ShareYourJourney authed={authed} />
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
          <EnterpriseValue />
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything You Get</h2>
            <p className="text-white/40 max-w-2xl mx-auto text-lg">Organized by plan — see exactly what's included at each tier without scrolling through endless checklists.</p>
          </div>
          <FeatureShowcase />
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Compare Capabilities</h2>
            <p className="text-white/40 text-lg">Every capability, side by side.</p>
          </div>
          <ComparisonTable />
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
          <RoiCalculator />
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
          <EnterpriseCalculator />
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Leadership Success Stories</h2>
            <p className="text-white/40 max-w-2xl mx-auto text-lg">Organizations across industries trust EXECLEAD.AI to develop their next generation of leaders.</p>
          </div>
          <SocialProof />
        </div>
      </section>

      {/* Refer & Earn */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <ReferralProgram authed={authed} />
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
          <BookDemoForm />
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
          <TrustBadges />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-white/40 text-lg">Everything you need to know before getting started.</p>
          </div>
          <Faq />
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

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Link to="/"><Logo aiTagClass="ml-1" /></Link>
          <p className="text-white/30 text-xs mt-1">Develop Executive Leaders. Not Interview Candidates.</p>
          <div className="mt-8 pt-8 border-t border-white/5 text-center text-white/20 text-xs">© 2026 EXECLEAD.AI. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}