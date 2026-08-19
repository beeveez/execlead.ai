import React from 'react';
import ReadinessPreviewCard from '@/components/landing/product/ReadinessPreviewCard';
import CoachPreviewCard from '@/components/landing/product/CoachPreviewCard';
import IdentityPreviewCard from '@/components/landing/product/IdentityPreviewCard';

export default function ProductTangibility() {
  return <section id="platform" className="border-t border-white/5 px-6 py-20 lg:px-8" aria-labelledby="platform-experience-title">
    <div className="mx-auto max-w-7xl">
      <div className="mb-12 text-center">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-accent-orange">Experience the Platform</p>
        <h2 id="platform-experience-title" className="text-3xl font-bold md:text-5xl">Experience the Executive Journey</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-white/50 md:text-base">From assessment to evidence-backed executive identity.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <ReadinessPreviewCard />
        <CoachPreviewCard />
        <IdentityPreviewCard />
      </div>
    </div>
  </section>;
}