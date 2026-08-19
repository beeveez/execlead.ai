import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { usePricingCatalog } from '@/hooks/usePricingCatalog';
import { captureReferralAttribution } from '@/lib/referralEngine';
import NewHero from '@/components/landing/v3/NewHero';
import PrivateBetaCountdown from '@/components/landing/PrivateBetaCountdown';
import ValueTest30 from '@/components/landing/v3/ValueTest30';
import ProductTangibility from '@/components/landing/v3/ProductTangibility';
import FlagshipSimulationHero from '@/components/landing/v3/FlagshipSimulationHero';
import InteractiveSimulationPreview from '@/components/landing/v3/InteractiveSimulationPreview';
import EvidenceEngine from '@/components/landing/v3/EvidenceEngine';
import SimulationDifferentiation from '@/components/landing/v3/SimulationDifferentiation';
import TwoFrontDoors from '@/components/landing/v3/TwoFrontDoors';
import CustomerJourney from '@/components/landing/v3/CustomerJourney';
import WhyNow from '@/components/landing/v3/WhyNow';
import EnterpriseScale from '@/components/landing/v3/EnterpriseScale';
import TrustReinforcement from '@/components/landing/v3/TrustReinforcement';
import FounderSection from '@/components/landing/v3/FounderSection';
import PrivateBetaInvitation from '@/components/landing/v3/PrivateBetaInvitation';
import FinalConversion from '@/components/landing/v3/FinalConversion';
import PricingTiers from '@/components/pricing/PricingTiers';

/**
 * Landing Experience — one continuous product narrative.
 * Hero → Interactive Simulation → Individual vs Enterprise → Outcome Cards
 * → Why EXECLEAD.AI → Success Stories → Pricing.
 * No page directory, no internal indexes.
 */
export default function Landing() {
  const [authed, setAuthed] = useState(false);
  const { plans: pricingPlans, cycle, setCycle, getPrice } = usePricingCatalog();

  useEffect(() => { (async () => { try { setAuthed(await base44.auth.isAuthenticated()); } catch (e) {} })(); }, []);
  useEffect(() => { captureReferralAttribution(); }, []);

  return (
    <>
      <NewHero authed={authed} />
      <PrivateBetaCountdown authed={authed} />
      <ValueTest30 />
      <ProductTangibility />
      <FlagshipSimulationHero authed={authed} />
      <InteractiveSimulationPreview authed={authed} />
      <EvidenceEngine />
      <SimulationDifferentiation />
      <TwoFrontDoors authed={authed} />
      <CustomerJourney />
      <WhyNow />
      <EnterpriseScale />
      <TrustReinforcement />
      <FounderSection />

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-28 px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-block mb-4 px-3 py-1.5 bg-amber-500/10 border border-amber-500/25 rounded-full text-[11px] text-amber-300 font-medium">
              General Availability Pricing Preview — Private Beta access is currently invitation-only.
            </div>
            <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">Pricing</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Invest in Becoming Executive Ready.</h2>
            <p className="text-white/40 max-w-xl mx-auto text-sm">Future General Availability pricing. Current access is invitation-only through the Founding Private Beta™.</p>
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
      <PrivateBetaInvitation authed={authed} />
      <FinalConversion authed={authed} />
    </>
  );
}