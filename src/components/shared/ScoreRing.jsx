import React from 'react';

/**
 * ScoreRing™ — Platform Score Visualization Standard™ v1.0
 * ----------------------------------------------------------------
 * STANDARD:
 *   • Score number is ALWAYS neutral (text-foreground) — never green/orange/red
 *   • The circular ring communicates health via semantic colors
 *   • Status label uses semantic colors
 *   • Label text is neutral gray (text-muted-foreground)
 *
 * Props:
 *   score     — number (0–100)
 *   size      — px size of the ring (default 80)
 *   stroke    — ring stroke width (default 6)
 *   label     — small uppercase label below the number (default 'Score')
 *   showLabel — whether to render the label (default true)
 *   threshold — { healthy: 90, warning: 70 } overrides
 *
 * Usage:
 *   <ScoreRing score={88} label="Health" />
 *   <ScoreRing score={100} label="Guardian" size={48} />
 */
export default function ScoreRing({ score, size = 80, stroke = 6, label = 'Score', showLabel = true, thresholds }) {
  const t = thresholds || { healthy: 90, warning: 70 };
  const clamped = Math.max(0, Math.min(100, score));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  const ringColor = clamped >= t.healthy ? '#10b981' : clamped >= t.warning ? '#f59e0b' : '#ef4444';
  const statusText = clamped >= t.healthy ? 'Operational' : clamped >= t.warning ? 'Warning' : 'Critical';
  const statusColor = clamped >= t.healthy ? 'text-emerald-400' : clamped >= t.warning ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-bold text-foreground leading-none"
            style={{ fontSize: size * 0.32 }}
          >
            {clamped}
          </span>
          {showLabel && (
            <span
              className="text-muted-foreground uppercase tracking-wider font-medium mt-0.5"
              style={{ fontSize: size * 0.1 }}
            >
              {label}
            </span>
          )}
        </div>
      </div>
      {showLabel && (
        <span className={`text-[10px] font-semibold mt-1.5 ${statusColor}`}>
          {statusText}
        </span>
      )}
    </div>
  );
}