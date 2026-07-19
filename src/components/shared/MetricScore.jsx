import React from 'react';

/**
 * MetricScore™ — Platform Metric Score Design Standard™ v1.0
 * ----------------------------------------------------------------
 * STANDARD:
 *   • Numeric value is ALWAYS neutral (text-foreground) — never green/amber/red
 *   • Progress bar / ring uses semantic colors
 *   • Label is neutral gray (text-muted-foreground)
 *
 * Props:
 *   label   — small uppercase label
 *   value   — the numeric value to display (string or number)
 *   unit    — optional unit suffix (e.g. "%", "/100")
 *   score   — 0–100 score used to determine progress bar color (default: value)
 *   size    — "sm" | "md" | "lg" (default "md")
 *
 * Usage:
 *   <MetricScore label="Platform Health" value={95} unit="/100" score={95} />
 *   <MetricScore label="Security" value="87%" score={87} size="sm" />
 */
export default function MetricScore({ label, value, unit, score, size = 'md' }) {
  const s = score != null ? score : (typeof value === 'number' ? value : 0);
  const color = s >= 90 ? '#10b981' : s >= 70 ? '#f59e0b' : '#ef4444';
  const valueSize = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-lg';

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className={`${valueSize} font-bold text-foreground`}>{value}</span>
        {unit && <span className="text-[10px] text-muted-foreground">{unit}</span>}
      </div>
      <div className="mt-1.5 h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(s, 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}