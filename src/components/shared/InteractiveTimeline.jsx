import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * InteractiveTimeline™ — Universal Timeline Item
 *
 * Every timeline event, roadmap entry, and history item is clickable.
 * Opens detail view, event page, or drill-down.
 *
 * Props:
 *   date        — timestamp or date label
 *   title       — event title
 *   to          — detail route
 *   onClick      — detail handler
 *   comingSoon   — { purpose, status, availability }
 *   icon        — lucide icon component
 *   statusColor — color class for the dot/icon
 */
export default function InteractiveTimeline({
  date,
  title,
  to,
  onClick,
  comingSoon,
  icon: Icon,
  statusColor = 'text-amber-400',
  className = '',
  children,
}) {
  const hasInteraction = to || onClick || comingSoon;
  const baseClasses = cn(
    'group relative flex items-start gap-4 rounded-xl p-3 transition-all duration-300',
    'hover:bg-white/[0.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40',
    className
  );

  const dot = (
    <div className={cn('w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0', statusColor)}>
      {Icon ? <Icon size={14} /> : <span className="w-2 h-2 rounded-full bg-current" />}
    </div>
  );

  const body = (
    <div className="flex-1 min-w-0">
      {date && <p className="text-white/30 text-xs mb-0.5">{date}</p>}
      {title && <p className="text-white/70 text-sm font-medium group-hover:text-amber-400 transition-colors">{title}</p>}
      {children}
      {comingSoon && (
        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] text-blue-400 font-medium uppercase tracking-wider">Coming Soon</span>
      )}
    </div>
  );

  if (!hasInteraction) {
    if (import.meta.env?.DEV) {
      console.warn('[Platform UX Rule] InteractiveTimeline rendered without interaction:', title);
    }
    return <div className={cn(baseClasses, 'cursor-default')}>{dot}{body}</div>;
  }

  if (comingSoon) {
    return <div className={cn(baseClasses, 'cursor-default')} data-cursor-label="Coming Soon" tabIndex={0}>{dot}{body}</div>;
  }

  if (to) {
    return (
      <Link to={to} className={cn(baseClasses, 'cursor-pointer')} data-cursor-label="Open Event" aria-label={title} tabIndex={0}>
        {dot}{body}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(e); } }}
      className={cn(baseClasses, 'cursor-pointer text-left w-full')}
      data-cursor-label="Open Event"
      aria-label={title}
      tabIndex={0}
    >
      {dot}{body}
    </button>
  );
}