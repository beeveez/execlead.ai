import React from 'react';
import ReadinessPreviewCard from '@/components/landing/product/ReadinessPreviewCard';

export default function ReadinessExperience() {
  return <section className="border-t border-white/5 px-6 py-20 lg:px-8" aria-labelledby="readiness-experience-title">
    <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
      <div><p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-accent-orange">Executive Readiness™</p><h2 id="readiness-experience-title" className="text-3xl font-bold md:text-4xl">Know where you stand before you take the next step.</h2><p className="mt-4 text-sm leading-7 text-white/55">Executive Readiness establishes a baseline across leadership capabilities and identifies the areas that require development.</p><p className="mt-5 text-sm font-medium text-white/80">Your readiness profile becomes the starting point for the Executive Leadership Journey.</p></div>
      <ReadinessPreviewCard />
    </div>
  </section>;
}