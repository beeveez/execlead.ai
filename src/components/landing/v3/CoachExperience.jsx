import React from 'react';
import CoachPreviewCard from '@/components/landing/product/CoachPreviewCard';

export default function CoachExperience() {
  return <section className="border-t border-white/5 bg-white/[0.015] px-6 py-20 lg:px-8" aria-labelledby="coach-experience-title">
    <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
      <CoachPreviewCard />
      <div className="lg:order-2"><p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-indigo-400">EXEC™ AI Executive Coach</p><h2 id="coach-experience-title" className="text-3xl font-bold md:text-4xl">An AI coach that challenges your thinking.</h2><p className="mt-4 text-sm leading-7 text-white/55">EXEC™ challenges assumptions, tests executive reasoning, pushes decision quality, and provides structured leadership feedback.</p><ul className="mt-5 space-y-2 text-sm text-white/70"><li>Challenges reasoning</li><li>Tests judgment</li><li>Identifies capability gaps</li><li>Develops executive thinking</li></ul></div>
    </div>
  </section>;
}