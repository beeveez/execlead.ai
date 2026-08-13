import React from "react";

export default function OnboardingShell({ step, children }) {
  const percent = Math.round((step / 3) * 100);
  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:py-12">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-6 text-center"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-orange">Unified Onboarding Orchestrator™</p><h1 className="mt-2 text-2xl font-bold sm:text-3xl">Your Executive Journey Starts Here</h1><p className="mt-2 text-sm text-muted-foreground">A focused setup that takes less than 5 minutes.</p></header>
        <div className="mb-5"><div className="mb-2 flex justify-between text-xs text-muted-foreground"><span>Step {step} of 3</span><span>{percent}%</span></div><div role="progressbar" aria-label={`Onboarding step ${step} of 3`} aria-valuenow={step} aria-valuemin="1" aria-valuemax="3" className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-accent-orange" style={{ width: `${percent}%` }} /></div></div>
        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7">{children}</section>
      </div>
    </main>
  );
}