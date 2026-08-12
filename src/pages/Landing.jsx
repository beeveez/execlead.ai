import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { usePricingCatalog } from '@/hooks/usePricingCatalog';
import { captureReferralAttribution } from '@/lib/referralEngine';
import NewHero from '@/components/landing/v3/NewHero';
import ProductDemo from '@/components/landing/ProductDemo';
import InteractiveSimulationPreview from '@/components/landing/v3/InteractiveSimulationPreview';
import FlagshipSimulationHero from '@/components/landing/v3/FlagshipSimulationHero';
import SimulationDifferentiation from '@/components/landing/v3/SimulationDifferentiation';
import TwoFrontDoors from '@/components/landing/v3/TwoFrontDoors';
import OutcomeExperienceCards from '@/components/landing/v3/OutcomeExperienceCards';
import WhyChooseExecLead from '@/components/landing/v3/WhyChooseExecLead';
import CustomerEvidence from '@/components/landing/v3/CustomerEvidence';
import HowExecLeadWorks from '@/components/landing/v3/HowExecLeadWorks';
import CustomerJourney from '@/components/landing/v3/CustomerJourney';
import ExecutiveOutcomeWall from '@/components/landing/v3/ExecutiveOutcomeWall';
import FounderSection from '@/components/landing/v3/FounderSection';
import ValueTest30 from '@/components/landing/v3/ValueTest30';
import ProductTangibility from '@/components/landing/v3/ProductTangibility';
import DifferentiationBlock from '@/components/landing/v3/DifferentiationBlock';
import ReadinessSnapshot from '@/components/landing/v3/ReadinessSnapshot';
import TrustReinforcement from '@/components/landing/v3/TrustReinforcement';
import PricingTiers from '@/components/pricing/PricingTiers';

/**
 * Landing Experience — one continuous product narrative.
 * Hero → Interactive Simulation → Individual vs Enterprise → Outcome Cards
 * → Why EXECLEAD.AI → Success Stories → Pricing.
 * No page directory, no internal indexes.
 */
export default function Landing() {
  const [authed, setAuthed] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [demoStartScene, setDemoStartScene] = useState(null);
  const { plans: pricingPlans, cycle, setCycle, getPrice } = usePricingCatalog();
  const openDemo = (sceneId) => {
    setDemoStartScene(sceneId || null);
    if (sceneId) { try { base44.analytics.track({ eventName: 'demo_related', properties: { scene: sceneId } }); } catch (e) {} }
    setShowDemo(true);
  };

  useEffect(() => { (async () => { try { setAuthed(await base44.auth.isAuthenticated()); } catch (e) {} })(); }, []);
  useEffect(() => { captureReferralAttribution(); }, []);

  return (
    <>
      {/* Brand hero */}
      <NewHero authed={authed} onWatchDemo={openDemo} />

      {/* 30-Second Value Test™ */}
      <ValueTest30 />

      {/* Product Tangibility™ — See the Platform in Action */}
      <ProductTangibility />

      {/* Flagship Executive Simulation — primary product demonstration */}
      <FlagshipSimulationHero authed={authed} />

      {/* Why professionals choose EXECLEAD.AI */}
      <WhyChooseExecLead />

      {/* Customer Evidence Layer™ — verified platform metrics */}
      <CustomerEvidence />

      <ProductDemo open={showDemo} onClose={() => setShowDemo(false)} startSceneId={demoStartScene} authed={authed} />

      {/* Interactive Executive Simulation */}
      <InteractiveSimulationPreview authed={authed} />

      {/* Why this is different */}
      <SimulationDifferentiation />

      {/* Differentiation Block™ */}
      <DifferentiationBlock />

      {/* Individual vs Enterprise */}
      <TwoFrontDoors authed={authed} />

      {/* Three outcome paths */}
      <OutcomeExperienceCards authed={authed} />

      {/* What makes EXECLEAD.AI different — comparison + flow */}
      <HowExecLeadWorks />

      {/* Success Stories (evidence-generated) */}
      <ExecutiveOutcomeWall />

      {/* One continuous customer journey */}
      <CustomerJourney />

      {/* Founder story */}
      <FounderSection />

      {/* Micro-Conversion CTA™ */}
      <ReadinessSnapshot />

      {/* Trust Reinforcement™ — directly above pricing */}
      <TrustReinforcement />

      {/* Pricing */}
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
          </div>
        </div>
      </section>
    </>
  );
}