import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { ArrowRight, Building2 } from "lucide-react";
import HeroSection from "@/components/landing/HeroSection";
import AssessmentSection from "@/components/landing/AssessmentSection";
import ReadinessReportPreview from "@/components/landing/ReadinessReportPreview";
import ExecutiveTransformation from "@/components/landing/ExecutiveTransformation";
import PlatformRepositionSection from "@/components/landing/PlatformRepositionSection";
import WhyProfessionalsUseSection from "@/components/landing/WhyProfessionalsUseSection";
import LandingBetaCTA from "@/components/landing/LandingBetaCTA";
import ProductDemo from "@/components/landing/ProductDemo";
import PricingTiers from "@/components/pricing/PricingTiers";
import { usePricingCatalog } from "@/hooks/usePricingCatalog";
import { captureReferralAttribution } from "@/lib/referralEngine";

/**
 * Landing — Executive Readiness First funnel.
 * Each section answers one question:
 *   S1 Hero       — Why should I care?
 *   S2 Assessment — What happens first?
 *   S3 Report     — What do I receive?
 *   S4 Journey    — How do I improve?
 *   S5 Platform   — How does it work?
 *   S6 Why        — Why choose us?
 *   S7 Pricing    — How do I join?
 *   S8 Beta       — Why now?
 * Reference & educational content lives on /platform.
 */
export default function Landing() {
  const [authed, setAuthed] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const { plans: pricingPlans, cycle, setCycle, getPrice } = usePricingCatalog();

  useEffect(() => {
    (async () => { try { setAuthed(await base44.auth.isAuthenticated()); } catch (e) {} })();
  }, []);
  useEffect(() => { captureReferralAttribution(); }, []);

  return (
    <>
      {/* S1 — Hero */}
      <HeroSection authed={authed} onWatchDemo={() => setShowDemo(true)} />
      <ProductDemo open={showDemo} onClose={() => setShowDemo(false)} />

      {/* S2 — What happens first */}
      <AssessmentSection authed={authed} />

      {/* S3 — What you receive (the signature report preview) */}
      <ReadinessReportPreview />

      {/* S4 — How do I improve */}
      <ExecutiveTransformation />

      {/* S5 — How does it work */}
      <PlatformRepositionSection />

      {/* S6 — Why professionals choose us */}
      <WhyProfessionalsUseSection />

      {/* S7 — Pricing */}
      <section id="pricing" className="py-20 md:py-28 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Pricing</h2>
            <p className="text-white/40 max-w-xl mx-auto text-sm">Future General Availability pricing. Current access is invitation-only through the Founding Private Beta™.</p>
          </div>
          <div className="flex items-center justify-center gap-3 mb-10">
            <button onClick={() => setCycle("monthly")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${cycle === "monthly" ? "bg-accent-orange/15 text-accent-orange" : "text-white/40 hover:text-white/70"}`}>Monthly</button>
            <button onClick={() => setCycle("annual")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${cycle === "annual" ? "bg-accent-orange/15 text-accent-orange" : "text-white/40 hover:text-white/70"}`}>Annual <span className="text-emerald-400 text-xs">Save 20%</span></button>
          </div>
          <PricingTiers plans={pricingPlans} cycle={cycle} getPrice={getPrice} authed={authed} />
          <div className="text-center mt-8">
            <Link to="/pricing" className="inline-flex items-center gap-1 text-sm text-accent-orange hover:text-accent-orange/80 transition-colors">Compare all features <ArrowRight size={14} /></Link>
            <Link to="/platform" className="ml-4 inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/70 transition-colors"><Building2 size={14} /> Explore the full platform</Link>
          </div>
        </div>
      </section>

      {/* S8 — Why now */}
      <LandingBetaCTA authed={authed} />
    </>
  );
}