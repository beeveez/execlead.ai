import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import {
  disableCountdownSound,
  enableCountdownSound,
  isCountdownSoundEnabled,
  playCountdownComplete,
  playCountdownTick,
} from '@/lib/countdownAudio';

export default function CountdownSoundControl({ timeLeft }) {
  const [enabled, setEnabled] = useState(isCountdownSoundEnabled);
  const previousSeconds = useRef(timeLeft.seconds);
  const wasLive = useRef(timeLeft.isLive);

  useEffect(() => {
    const sync = () => { previousSeconds.current = timeLeft.seconds; };
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, [timeLeft.seconds]);

  useEffect(() => {
    if (!enabled || document.visibilityState !== 'visible') {
      previousSeconds.current = timeLeft.seconds;
      wasLive.current = timeLeft.isLive;
      return;
    }
    if (timeLeft.isLive && !wasLive.current) playCountdownComplete();
    else if (!timeLeft.isLive && timeLeft.seconds !== previousSeconds.current) playCountdownTick();
    previousSeconds.current = timeLeft.seconds;
    wasLive.current = timeLeft.isLive;
  }, [enabled, timeLeft.isLive, timeLeft.seconds]);

  const toggle = async () => {
    if (enabled) {
      disableCountdownSound();
      setEnabled(false);
    } else {
      await enableCountdownSound();
      previousSeconds.current = timeLeft.seconds;
      setEnabled(true);
    }
  };

  const Icon = enabled ? Volume2 : VolumeX;
  return <button type="button" onClick={toggle} aria-pressed={enabled} className="mx-auto mt-5 inline-flex min-h-11 items-center gap-2 rounded-md border border-launch-muted/25 px-3.5 text-xs font-medium text-launch-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-launch-accent">
    <Icon size={15} aria-hidden="true" /> Countdown Sound
  </button>;
}