import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function CountdownAudioToggle({ seconds, isLive }) {
  const [enabled, setEnabled] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const audioContext = useRef(null);
  const previousSecond = useRef(seconds);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(preference.matches);
    updatePreference();
    preference.addEventListener('change', updatePreference);
    return () => preference.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => () => audioContext.current?.close(), []);

  useEffect(() => {
    if (!enabled || reducedMotion || isLive) {
      previousSecond.current = seconds;
      return;
    }
    if (previousSecond.current !== seconds && audioContext.current) {
      const context = audioContext.current;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = 680;
      gain.gain.setValueAtTime(0.018, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.025);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.025);
    }
    previousSecond.current = seconds;
  }, [enabled, isLive, reducedMotion, seconds]);

  const toggleAudio = async () => {
    if (reducedMotion) return;
    if (enabled) return setEnabled(false);
    audioContext.current ||= new (window.AudioContext || window.webkitAudioContext)();
    await audioContext.current.resume();
    previousSecond.current = seconds;
    setEnabled(true);
  };

  const label = reducedMotion ? 'Tick sound unavailable with reduced motion enabled' : `Turn tick sound ${enabled ? 'off' : 'on'}`;
  return <button type="button" onClick={toggleAudio} disabled={reducedMotion || isLive} aria-pressed={enabled} aria-label={label} title={label} className="tap-target mt-5 inline-flex items-center gap-2 rounded-md border border-launch-muted/30 px-3 py-2 text-xs font-medium text-launch-muted disabled:cursor-not-allowed disabled:opacity-50">
    {enabled ? <Volume2 size={15} aria-hidden="true" /> : <VolumeX size={15} aria-hidden="true" />}{enabled ? 'Tick sound on' : 'Tick sound off'}
  </button>;
}