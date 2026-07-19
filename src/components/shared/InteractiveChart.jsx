import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

/**
 * InteractiveChart™ — Universal Chart Intelligence
 *
 * Every chart opens a detailed analysis view.
 * The entire chart surface is clickable.
 *
 * Props:
 *   title       — chart heading
 *   to          — analysis route
 *   onClick      — open analysis drawer/modal
 *   comingSoon   — { purpose, status, availability }
 *   className    — extra classes
 */
export default function InteractiveChart({
  title,
  to,
  onClick,
  comingSoon,
  className = '',
  children,
}) {
  const hasInteraction = to || onClick || comingSoon;
  const baseClasses = cn(
    'group relative block rounded-2xl bg-white/[0.02] border border-white/5 p-5 transition-all duration-300',
    'hover:shadow-lg hover:-translate-y-0.5 hover:border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40',
    className
  );

  const header = (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-white font-semibold text-sm">{title}</h3>
      {hasInteraction && !comingSoon && (
        <ArrowRight size={14} className="text-white/20 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
      )}
    </div>
  );

  if (comingSoon) {
    return (
      <div className={cn(baseClasses, 'cursor-default')} data-cursor-label="Coming Soon" tabIndex={0}>
        {header}
        {children}
        <div className="mt-3">
          <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] text-blue-400 font-medium uppercase tracking-wider">Coming Soon</span>
          {comingSoon.purpose && <p className="text-xs text-white/40 mt-2">{comingSoon.purpose}</p>}
        </div>
      </div>
    );
  }

  if (!hasInteraction) {
    if (import.meta.env?.DEV) {
      console.warn('[Platform UX Rule] InteractiveChart rendered without interaction:', title);
    }
    return <div className={cn(baseClasses, 'cursor-default')}>{header}{children}</div>;
  }

  if (to) {
    return (
      <Link to={to} className={cn(baseClasses, 'cursor-pointer')} data-cursor-label="View Analysis" aria-label={`${title} analysis`} tabIndex={0}>
        {header}{children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(e); } }}
      className={cn(baseClasses, 'cursor-pointer text-left w-full')}
      data-cursor-label="View Analysis"
      aria-label={`${title} analysis`}
      tabIndex={0}
    >
      {header}{children}
    </button>
  );
}