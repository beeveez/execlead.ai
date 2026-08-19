import React from 'react';
import { splitCountdownDays } from '@/lib/launchCountdownExperience';

const UNITS = [
  ['months', 'Months'],
  ['days', 'Days'],
  ['hours', 'Hours'],
  ['minutes', 'Minutes'],
  ['seconds', 'Seconds'],
];

export default function LaunchCountdownTimer({ timeLeft, milestone }) {
  const calendar = splitCountdownDays(timeLeft.days);
  const values = { ...timeLeft, ...calendar };
  const accessibleTime = UNITS.map(([key, label]) => `${values[key]} ${label}`).join(', ');

  return <div className="launch-countdown-grid" role="timer" aria-live="off" aria-label={`${milestone} begins in ${accessibleTime}`}>
    {UNITS.map(([key, label]) => {
      const value = String(values[key]).padStart(2, '0');
      return <div key={key} className="launch-countdown-unit"><span key={value} className="launch-countdown-value countdown-digit-change">{value}</span><span className="launch-countdown-label">{label}</span></div>;
    })}
  </div>;
}