import React from 'react';

const UNITS = [
  ['days', 'Days'],
  ['hours', 'Hours'],
  ['minutes', 'Minutes'],
  ['seconds', 'Seconds'],
];

export default function LaunchCountdownTimer({ timeLeft }) {
  const accessibleTime = UNITS.map(([key, label]) => `${timeLeft[key]} ${label}`).join(', ');

  return (
    <div className="launch-countdown-grid" role="timer" aria-label={`Private Beta launches in ${accessibleTime}`}>
      {UNITS.map(([key, label]) => {
        const value = String(timeLeft[key]).padStart(2, '0');
        return (
          <div key={key} className="launch-countdown-unit">
            <span key={value} className="countdown-digit-change block font-display text-5xl font-light leading-none tracking-[0.16em] text-launch-foreground sm:text-6xl md:text-7xl lg:text-8xl">
              {value}
            </span>
            <span className="mt-4 block text-[10px] font-semibold uppercase tracking-[0.32em] text-launch-muted sm:text-xs">
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}