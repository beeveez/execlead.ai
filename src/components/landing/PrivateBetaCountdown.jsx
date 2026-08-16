import React from 'react';
import { Link } from 'react-router-dom';
import LaunchCountdownTimer from '@/components/landing/LaunchCountdownTimer';
import usePrivateBetaCountdown from '@/hooks/usePrivateBetaCountdown';
import { PRIVATE_BETA_LAUNCH_AT, PRIVATE_BETA_LAUNCH_LABEL } from '@/lib/privateBetaLaunch';

export default function PrivateBetaCountdown() {
  const timeLeft = usePrivateBetaCountdown();

  return (
    <section className="private-beta-countdown relative isolate overflow-hidden px-6 py-20 sm:py-24 lg:py-28" aria-labelledby="private-beta-countdown-title">
      <div className="relative z-10 mx-auto max-w-6xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-launch-accent sm:tracking-[0.42em]">
          EXECLEAD.AI Private Beta
        </p>
        {timeLeft.isLive ? (
          <div className="mt-10" aria-live="polite">
            <h2 id="private-beta-countdown-title" className="font-display text-4xl font-semibold tracking-[0.12em] text-launch-foreground sm:text-5xl lg:text-6xl">Private Beta Is Live</h2>
            <p className="mt-5 text-base text-launch-muted sm:text-lg">Welcome to EXECLEAD.AI.</p>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/login" className="rounded-md bg-launch-accent px-7 py-3 text-sm font-semibold text-launch-background">Enter EXECLEAD.AI</Link>
              <Link to="/platform" className="rounded-md border border-launch-muted/30 px-7 py-3 text-sm font-semibold text-launch-foreground">Learn More</Link>
            </div>
          </div>
        ) : (
          <>
            <h2 id="private-beta-countdown-title" className="sr-only">Countdown to the EXECLEAD.AI Private Beta</h2>
            <div className="mt-10 sm:mt-12"><LaunchCountdownTimer timeLeft={timeLeft} /></div>
            <time dateTime={PRIVATE_BETA_LAUNCH_AT} className="mt-10 block font-display text-sm uppercase tracking-[0.28em] text-launch-foreground sm:text-base">{PRIVATE_BETA_LAUNCH_LABEL}</time>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-launch-muted sm:text-base">The Executive Leadership Operating System™ Private Beta begins soon.</p>
          </>
        )}
      </div>
    </section>
  );
}