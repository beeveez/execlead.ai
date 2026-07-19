import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

/**
 * InteractiveRoadmap™ — Universal Roadmap Item
 *
 * Every roadmap entry, milestone, and release item is clickable.
 * Opens detail: objectives, dependencies, timeline, progress, owner.
 *
 * Props:
 *   phase       — phase label (e.g. "RC1")
 *   title       — roadmap item title
 *   status      — 'done' | 'in_progress' | 'planned' | 'blocked'
 *   to          — detail route
 *   onClick      — detail handler
 *   comingSoon   — { purpose, status, availability }
 */
const STATUS_STYLES = {
  done: { dot: 'bg-emerald-400', label: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  in_progress: { dot: 'bg-amber-400', label: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  planned: { dot: 'bg-blue-400', label: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  blocked: { dot: 'bg-red-400', label: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
};

export default function InteractiveRoadmap({
  phase,
  title,
  status = 'planned',
  to,
  onClick,
  comingSoon,
  className = '',
  children,
}) {
  const hasInteraction = to || onClick || comingSoon;
  const s = STATUS_STYLES[status] || STATUS_STYLES.planned;
  const baseClasses = cn(
    'group relative block rounded-xl bg-white/[0.02] border border-white/5 p-4 transition-all duration-300',
    'hover:shadow-lg hover:-translate-y-0.5 hover:border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40',
    className
  );

  const content = (
    <>
      <div className="flex items-center justify-between mb-2">
        {phase && <span className="text-white/30 text-xs font-mono">{phase}</span>}
        <span className={cn('flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider', s.label)}>
          <span className={cn('w-1.5 h-1.5 rounded-full', s.dot)} />
          {status.replace(/_/g, ' ')}
        </span>
      </div>
      {title && <h4 className="text-white font-semibold text-sm group-hover:text-amber-400 transition-colors">{title}</h4>}
      {children}
      {hasInteraction && !comingSoon && (
        <div className="mt-3 flex items-center gap-1 text-[11px] text-white/30 group-hover:text-amber-400 transition-colors">
          View Details <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      )}
      {comingSoon && (
        <span className="inline-block mt-2 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] text-blue-400 font-medium uppercase tracking-wider">Coming Soon</span>
      )}
    </>
  );

  if (comingSoon) {
    return <div className={cn(baseClasses, 'cursor-default')} data-cursor-label="Coming Soon" tabIndex={0}>{content}</div>;
  }

  if (!hasInteraction) {
    if (import.meta.env?.DEV) {
      console.warn('[Platform UX Rule] InteractiveRoadmap rendered without interaction:', title);
    }
    return <div className={cn(baseClasses, 'cursor-default')}>{content}</div>;
  }

  if (to) {
    return (
      <Link to={to} className={cn(baseClasses, 'cursor-pointer')} data-cursor-label="Open Roadmap" aria-label={title} tabIndex={0}>
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
      data-cursor-label="Open Roadmap"
      aria-label={title}
      tabIndex={0}
    >
      {content}
    </button>
  );
}