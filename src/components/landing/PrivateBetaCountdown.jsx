import React from 'react';
import { Link } from 'react-router-dom';
import LaunchCountdownTimer from '@/components/landing/LaunchCountdownTimer';
import usePrivateBetaCountdown from '@/hooks/usePrivateBetaCountdown';
import { getLaunchCountdownPhase } from '@/lib/launchCountdownExperience';
import { PRIVATE_BETA_LAUNCH_AT, PRIVATE_BETA_LAUNCH_LABEL, PRIVATE_BETA_MILESTONE } from '@/lib/privateBetaLaunch';
import { buildSignInUrl } from '@/lib/sessionRestore';

const actionClass = 'inline-flex min-h-11 items-center justify-center rounded-md px-7 py-3 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-launch-accent';

export default function PrivateBetaCountdown({ authed = false }) {
  const timeLeft = usePrivateBetaCountdown();
  const phase = getLaunchCountdownPhase(timeLeft);
  const primaryPath = authed ? '/assessment' : buildSignInUrl('/assessment');

  return <section className={`private-beta-countdown ${phase.compact ? 'launch-phase-final' : ''} relative isolate overflow-hidden px-4 py-16 sm:px-6 sm:py-24 lg:py-28`} aria-labelledby="private-beta-countdown-title">
    <div className="launch-architecture" aria-hidden="true"><span/><span/><span/></div>
    <div className="relative z-10 mx-auto max-w-6xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.36em] text-launch-foreground sm:tracking-[0.5em]">EXECLEAD.AI</p>
      <h2 id="private-beta-countdown-title" className="mx-auto mt-6 max-w-4xl font-display text-3xl font-semibold tracking-tight text-launch-foreground sm:text-5xl lg:text-6xl">{phase.live ? phase.label : 'The Executive Journey Is About to Begin'}</h2>
      <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-launch-muted sm:text-base">Assess where you stand. Discover what separates you from executive leadership. Build the capabilities to get there.</p>
      {phase.live ? <div className="mt-8" aria-live="polite"><p className="text-base text-launch-muted sm:text-lg">{phase.message}</p><Link to={primaryPath} className={`${actionClass} mt-8 bg-launch-accent text-launch-background`}>Begin Your Executive Journey</Link></div> : <>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-launch-muted" aria-live="polite">{phase.label}</p>
        <div className="mt-10 sm:mt-14"><LaunchCountdownTimer timeLeft={timeLeft} milestone={PRIVATE_BETA_MILESTONE}/></div>
        <div className="mt-10"><p className="font-display text-base font-semibold uppercase tracking-[0.3em] text-launch-foreground sm:text-lg">PRIVATE BETA LAUNCH</p><time dateTime={PRIVATE_BETA_LAUNCH_AT} className="mt-2 block text-sm font-medium tracking-[0.16em] text-launch-foreground/80 sm:text-base">{PRIVATE_BETA_LAUNCH_LABEL}</time><p className="mx-auto mt-5 max-w-xl text-sm font-medium leading-6 text-launch-muted sm:text-base">Founding Executive Beta</p><p className="mt-4 text-sm font-medium text-launch-foreground">One Leadership Journey. One AI Platform.</p></div>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link to="/beta" className={`${actionClass} bg-launch-accent text-launch-background`}>Apply for Private Beta</Link><Link to={primaryPath} className={`${actionClass} border border-launch-muted/40 text-launch-foreground`}>Take the Readiness Assessment</Link></div>
      </>}
    </div>
  </section>;
}