import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { captureReferralAttribution } from '@/lib/referralEngine';
import NewHero from '@/components/landing/v3/NewHero';
import PrivateBetaCountdown from '@/components/landing/PrivateBetaCountdown';
import ValueTest30 from '@/components/landing/v3/ValueTest30';
import ProductTangibility from '@/components/landing/v3/ProductTangibility';
import ReadinessExperience from '@/components/landing/v3/ReadinessExperience';
import CoachExperience from '@/components/landing/v3/CoachExperience';
import FlagshipSimulationHero from '@/components/landing/v3/FlagshipSimulationHero';
import InteractiveSimulationPreview from '@/components/landing/v3/InteractiveSimulationPreview';
import EvidenceEngine from '@/components/landing/v3/EvidenceEngine';
import IdentityExperience from '@/components/landing/v3/IdentityExperience';
import SimulationDifferentiation from '@/components/landing/v3/SimulationDifferentiation';
import TwoFrontDoors from '@/components/landing/v3/TwoFrontDoors';
import FounderSection from '@/components/landing/v3/FounderSection';
import PrivateBetaInvitation from '@/components/landing/v3/PrivateBetaInvitation';
import FinalConversion from '@/components/landing/v3/FinalConversion';

/**
 * Landing Experience — one continuous product narrative.
 * Hero → Interactive Simulation → Individual vs Enterprise → Outcome Cards
 * → Why EXECLEAD.AI → Success Stories → Pricing.
 * No page directory, no internal indexes.
 */
export default function Landing() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => { (async () => { try { setAuthed(await base44.auth.isAuthenticated()); } catch (e) {} })(); }, []);
  useEffect(() => { captureReferralAttribution(); }, []);

  return (
    <>
      <NewHero authed={authed} />
      <PrivateBetaCountdown authed={authed} />
      <ValueTest30 />
      <ProductTangibility />
      <ReadinessExperience />
      <CoachExperience />
      <FlagshipSimulationHero authed={authed} />
      <InteractiveSimulationPreview authed={authed} />
      <EvidenceEngine />
      <IdentityExperience />
      <SimulationDifferentiation />
      <TwoFrontDoors authed={authed} />
      <FounderSection />

      <PrivateBetaInvitation authed={authed} />
      <FinalConversion authed={authed} />
    </>
  );
}