import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * InteractiveProgress™ — Universal Progress Intelligence
 *
 * Every progress bar, health indicator, and completion meter is clickable.
 * Opens breakdown: what's complete, what's remaining, blockers, estimated completion.
 *
 * Props:
 *   label       — progress label
 *   value       — current value (0-100)
 *   to          — breakdown route
 *   onClick      — breakdown handler
 *   comingSoon   — { purpose, status, availability }
 *   colorOverride — override color class
 */
export default function InteractiveProgress({
  label,
  value = 0,
  to,
  onClick,
  comingSoon,
  colorOverride,
  className = '',
}) {
  const hasInteraction = to || onClick || comingSoon;
  const color = colorOverride || (
    value >= 90 ? 'bg-emerald-400'
      : value >= 70 ? 'bg-amber-400'
      : value >= 50 ? 'bg-orange-400'
      : 'bg-red-400'
  );
  const textColor = colorOverride?.replace('bg-', 'text-') || (
    value >= 90 ? 'text-emerald-400'
      : value >= 70 ? 'text-amber-400'
      : value >= 50 ? 'text-orange-400'
      : 'text-red-400'
  );

  const content = (
    <>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-white/50 text-xs font-medium">{label}</span>
        <span className={cn('text-xs font-bold', textColor)}>{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </>
  );

  if (comingSoon) {
    return (
      <div className={cn('rounded-lg p-3 bg-white/[0.02] border border-white/5', className)} data-cursor-label="Coming Soon" tabIndex={0}>
        {content}
        <span className="inline-block mt-2 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] text-blue-400 font-medium uppercase tracking-wider">Coming Soon</span>
      </div>
    );
  }

  if (!hasInteraction) {
    if (import.meta.env?.DEV) {
      console.warn('[Platform UX Rule] InteractiveProgress rendered without interaction:', label);
    }
    return <div className={cn('rounded-lg p-3 bg-white/[0.02] border border-white/5', className)}>{content}</div>;
  }

  const baseClasses = cn(
    'group relative block rounded-lg p-3 bg-white/[0.02] border border-white/5 transition-all duration-300',
    'hover:shadow-md hover:border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40',
    className
  );

  if (to) {
    return (
      <Link to={to} className={cn(baseClasses, 'cursor-pointer')} data-cursor-label="View Breakdown" aria-label={`${label} breakdown`} tabIndex={0}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(e); } }}
      className={cn(baseClasses, 'cursor-pointer text-left w-full')}
      data-cursor-label="View Breakdown"
      aria-label={`${label} breakdown`}
      tabIndex={0}
    >
      {content}
    </button>
  );
}