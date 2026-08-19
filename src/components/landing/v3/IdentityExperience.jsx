import React from 'react';
import IdentityPreviewCard from '@/components/landing/product/IdentityPreviewCard';

export default function IdentityExperience() {
  return <section className="border-t border-white/5 px-6 py-20 lg:px-8" aria-labelledby="identity-experience-title">
    <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
      <div><p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-cyan-400">Executive Identity™</p><h2 id="identity-experience-title" className="text-3xl font-bold md:text-4xl">Your leadership story should be built from what you have actually demonstrated.</h2><p className="mt-4 text-sm leading-7 text-white/55">Executive Identity connects leadership capability, demonstrated evidence, development progress, and professional positioning into an evolving executive profile.</p></div>
      <IdentityPreviewCard />
    </div>
  </section>;
}