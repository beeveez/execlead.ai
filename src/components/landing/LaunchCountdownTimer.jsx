import React from 'react';

const UNITS = [
  ['months', 'Months'],
  ['calendarDays', 'Days'],
  ['hours', 'Hours'],
  ['minutes', 'Minutes'],
  ['seconds', 'Seconds'],
];

export default function LaunchCountdownTimer({ timeLeft, milestone }) {
  const accessibleTime = UNITS.map(([key, label]) => `${timeLeft[key]} ${label}`).join(', ');

  return <div className="launch-countdown-grid" role="timer" aria-live="off" aria-label={`${milestone} begins in ${accessibleTime}`}>
    {UNITS.map(([key, label]) => {
      const value = String(timeLeft[key]).padStart(2, '0');
      return <div key={key} className="launch-countdown-unit"><span key={value} className="launch-countdown-value countdown-digit-change">{value}</span><span className="launch-countdown-label">{label}</span></div>;
    })}
  </div>;
}