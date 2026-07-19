import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

/**
 * InteractiveWidget™ — Universal Dashboard Widget
 *
 * Every dashboard widget (panel, section, summary card) is fully clickable.
 * The entire widget surface acts as one click target.
 *
 * Props:
 *   title       — widget heading
 *   icon        — lucide icon component
 *   to          — navigation route
 *   onClick      — action / modal / drawer handler
 *   comingSoon   — { purpose, status, availability }
 *   empty        — true for empty/beta-preparing state
 *   badge        — optional badge text
 *   className    — extra classes
 */
export default function InteractiveWidget({
  title,
  icon: Icon,
  to,
  onClick,
  comingSoon,
  empty,
  badge,
  className = '',
  children,
}) {
  const hasInteraction = to || onClick || comingSoon || empty;
  const baseClasses = cn(
    'group relative block rounded-2xl bg-white/[0.02] border border-white/5 p-5 transition-all duration-300',
    'hover:shadow-lg hover:-translate-y-0.5 hover:border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40',
    className
  );

  const header = (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} className="text-amber-400" />}
        {title && <h3 className="text-white font-semibold text-sm">{title}</h3>}
      </div>
      {badge && (
        <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[10px] text-white/50 font-medium uppercase tracking-wider">{badge}</span>
      )}
    </div>
  );

  const body = (
    <>
      {header}
      {children}
      {hasInteraction && !comingSoon && !empty && (
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-1 text-[11px] text-white/30 group-hover:text-amber-400 transition-colors">
          Open Details <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
        </div>
      )}
      {comingSoon && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] text-blue-400 font-medium uppercase tracking-wider">Coming Soon</span>
          {comingSoon.purpose && <p className="text-xs text-white/40 mt-2">{comingSoon.purpose}</p>}
        </div>
      )}
      {empty && (
        <p className="text-sm text-white/40 mt-2">
          This content is currently being prepared as part of the EXECLEAD.AI Private Beta.
        </p>
      )}
    </>
  );

  if (!hasInteraction) {
    if (import.meta.env?.DEV) {
      console.warn('[Platform UX Rule] InteractiveWidget rendered without interaction:', title);
    }
    return <div className={cn(baseClasses, 'cursor-default')}>{body}</div>;
  }

  if (to) {
    return (
      <Link to={to} className={cn(baseClasses, 'cursor-pointer')} data-cursor-label="Open Widget" aria-label={title} tabIndex={0}>
        {body}
      </Link>
    );
  }

  if (comingSoon || empty) {
    return <div className={cn(baseClasses, 'cursor-default')} data-cursor-label={comingSoon ? 'Coming Soon' : 'Being Prepared'} tabIndex={0}>{body}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(e); } }}
      className={cn(baseClasses, 'cursor-pointer text-left w-full')}
      data-cursor-label="Open Widget"
      aria-label={title}
      tabIndex={0}
    >
      {body}
    </button>
  );
}