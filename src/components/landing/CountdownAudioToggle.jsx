import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function CountdownAudioToggle({ seconds, isLive }) {
  const [enabled, setEnabled] = useState(false);
  const [audioError, setAudioError] = useState('');
  const audioContext = useRef(null);
  const previousSecond = useRef(seconds);

  useEffect(() => () => audioContext.current?.close(), []);

  useEffect(() => {
    if (!enabled || isLive) {
      previousSecond.current = seconds;
      return;
    }
    if (previousSecond.current !== seconds && audioContext.current?.state === 'running') {
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
  }, [enabled, isLive, seconds]);

  const toggleAudio = async () => {
    if (enabled) {
      setEnabled(false);
      return;
    }
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) throw new Error('Web Audio unavailable');
      if (!audioContext.current || audioContext.current.state === 'closed') audioContext.current = new AudioContextClass();
      if (audioContext.current.state !== 'running') await audioContext.current.resume();
      previousSecond.current = seconds;
      setAudioError('');
      setEnabled(true);
    } catch {
      audioContext.current = null;
      setAudioError('Tick sound unavailable — try again');
      setEnabled(false);
    }
  };

  const label = audioError || `Turn tick sound ${enabled ? 'off' : 'on'}`;
  return <button type="button" onClick={toggleAudio} aria-pressed={enabled} aria-label={label} title={label} className="tap-target mt-5 inline-flex items-center gap-2 rounded-md border border-launch-muted/30 px-3 py-2 text-xs font-medium text-launch-muted hover:border-launch-muted/60 hover:text-launch-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-launch-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-launch-background">
    {enabled ? <Volume2 size={15} aria-hidden="true" /> : <VolumeX size={15} aria-hidden="true" />}{audioError || (enabled ? 'Tick sound on' : 'Tick sound off')}
  </button>;
}