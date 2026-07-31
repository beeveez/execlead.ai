import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { usePricingCatalog } from '@/hooks/usePricingCatalog';
import { captureReferralAttribution } from '@/lib/referralEngine';
import NewHero from '@/components/landing/v3/NewHero';
import ProductPreviewCarousel from '@/components/landing/v3/ProductPreviewCarousel';
import WhyExecLead from '@/components/landing/v3/WhyExecLead';
import HowItWorks from '@/components/landing/v3/HowItWorks';
import ExecutiveReadinessFeature from '@/components/landing/v3/ExecutiveReadinessFeature';
import ExecutiveCoachFeature from '@/components/landing/v3/ExecutiveCoachFeature';
import ExecutiveSimulationsFeature from '@/components/landing/v3/ExecutiveSimulationsFeature';
import ExecutiveIdentityFeature from '@/components/landing/v3/ExecutiveIdentityFeature';
import OutcomeIntelligenceFeature from '@/components/landing/v3/OutcomeIntelligenceFeature';
import FoundingBetaSection from '@/components/landing/v3/FoundingBetaSection';
import SocialProofLive from '@/components/landing/v3/SocialProofLive';
import FinalCTA from '@/components/landing/v3/FinalCTA';
import ProductDemo from '@/components/landing/ProductDemo';
import PricingTiers from '@/components/pricing/PricingTiers';

/**
 * Landing v3.0 — Product-first experience.
 * A guided tour of the Executive Leadership Operating System™.
 */
export default function Landing() {
  const [authed, setAuthed] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const { plans: pricingPlans, cycle, setCycle, getPrice } = usePricingCatalog();

  useEffect(() => { (async () => { try { setAuthed(await base44.auth.isAuthenticated()); } catch (e) {} })(); }, []);
  useEffect(() => { captureReferralAttribution(); }, []);

  return (
    <>
      {/* S1 — Hero */}
      <NewHero authed={authed} onWatchDemo={() => setShowDemo(true)} />
      <ProductDemo open={showDemo} onClose={() => setShowDemo(false)} />

      {/* S2 — Product preview carousel */}
      <ProductPreviewCarousel authed={authed} />

      {/* S3 — Why EXECLEAD.AI */}
      <WhyExecLead />

      {/* S4 — How it works */}
      <HowItWorks authed={authed} />

      {/* S5 — Executive Readiness */}
      <ExecutiveReadinessFeature authed={authed} />

      {/* S6 — Executive AI Coach */}
      <ExecutiveCoachFeature authed={authed} />

      {/* S7 — Executive Simulations */}
      <ExecutiveSimulationsFeature authed={authed} />

      {/* S8 — Executive Identity */}
      <ExecutiveIdentityFeature authed={authed} />

      {/* S9 — Outcome Intelligence */}
      <OutcomeIntelligenceFeature authed={authed} />

      {/* S10 — Founding Private Beta */}
      <FoundingBetaSection authed={authed} />

      {/* S11 — Social proof / live stats */}
      <SocialProofLive />

      {/* S12 — Pricing */}
      <section id="pricing" className="py-20 md:py-28 px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">Pricing</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Invest in Becoming Executive Ready.</h2>
            <p className="text-white/40 max-w-xl mx-auto text-sm">Future General Availability pricing. Current access is invitation-only through the Founding Private Beta™. The <span className="text-accent-orange font-medium">Executive</span> plan is the most popular path for ambitious leaders.</p>
          </div>
          <div className="flex items-center justify-center gap-3 mb-10">
            <button onClick={() => setCycle('monthly')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${cycle === 'monthly' ? 'bg-accent-orange/15 text-accent-orange' : 'text-white/40 hover:text-white/70'}`}>Monthly</button>
            <button onClick={() => setCycle('annual')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${cycle === 'annual' ? 'bg-accent-orange/15 text-accent-orange' : 'text-white/40 hover:text-white/70'}`}>Annual <span className="text-emerald-400 text-xs">Save 20%</span></button>
          </div>
          <PricingTiers plans={pricingPlans} cycle={cycle} getPrice={getPrice} authed={authed} />
          <div className="text-center mt-8">
            <Link to="/pricing" className="inline-flex items-center gap-1 text-sm text-accent-orange hover:text-accent-orange/80 transition-colors">Compare all features <ArrowRight size={14} /></Link>
            <Link to="/platform" className="ml-4 inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/70 transition-colors"><Building2 size={14} /> Explore the full platform</Link>
          </div>
        </div>
      </section>

      {/* S13 — Final CTA */}
      <FinalCTA authed={authed} />
    </>
  );
}