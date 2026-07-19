import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * InteractiveCard™ — Platform UX Rule Enforcer
 *
 * Every visual card in EXECLEAD.AI MUST satisfy ONE of:
 *   ✓ Opens a dedicated page   → pass `to="/route"`
 *   ✓ Opens a modal/drawer      → pass `onClick={handler}`
 *   ✓ Opens inline expandable   → pass `onClick={handler}` + `expandable`
 *   ✓ Executes an action         → pass `onClick={handler}`
 *   ✓ Opens a drill-down         → pass `onClick={handler}`
 *   ✓ Downloads content          → pass `onClick={handler}` + `hoverLabel="Download"`
 *   ✓ Launches an AI experience  → pass `onClick={handler}` + `hoverLabel="Ask AI"`
 *   ✓ Clearly displays "Coming Soon" → pass `comingSoon={{ purpose, status, availability }}`
 *
 * If none of these are provided, the component renders a non-interactive
 * static shell and logs a console warning in development.
 */
export default function InteractiveCard({
  to,
  onClick,
  comingSoon,
  empty,
  hoverLabel = 'Open',
  cursorLabel,
  className = '',
  children,
  ariaLabel,
  ...rest
}) {
  const _cursorLabel = cursorLabel || hoverLabel;
  const hasInteraction = to || onClick || comingSoon || empty;
  const baseClasses = cn(
    'group relative block rounded-2xl transition-all duration-300',
    'hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40',
    className
  );

  // ── Coming Soon state ──
  if (comingSoon) {
    return (
      <div
        className={cn(baseClasses, 'cursor-default bg-white/[0.02] border border-white/5 p-6')}
        data-cursor-label="Coming Soon"
        aria-label={ariaLabel || 'Coming Soon'}
        tabIndex={0}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] text-blue-400 font-medium uppercase tracking-wider">
            Coming Soon
          </span>
        </div>
        {children}
        <div className="mt-4 pt-4 border-t border-white/5 space-y-1">
          {comingSoon.purpose && (
            <p className="text-xs text-white/40"><span className="text-white/60 font-medium">Purpose:</span> {comingSoon.purpose}</p>
          )}
          {comingSoon.status && (
            <p className="text-xs text-white/40"><span className="text-white/60 font-medium">Status:</span> {comingSoon.status}</p>
          )}
          {comingSoon.availability && (
            <p className="text-xs text-white/40"><span className="text-white/60 font-medium">Planned:</span> {comingSoon.availability}</p>
          )}
        </div>
      </div>
    );
  }

  // ── Empty content state ──
  if (empty) {
    return (
      <div
        className={cn(baseClasses, 'cursor-default bg-white/[0.02] border border-white/5 p-6 text-center')}
        data-cursor-label="Being Prepared"
        aria-label={ariaLabel || 'Content being prepared'}
        tabIndex={0}
      >
        {children}
        <p className="text-sm text-white/40 mt-3">
          This content is currently being prepared as part of the EXECLEAD.AI Private Beta.
        </p>
      </div>
    );
  }

  // ── No interaction provided — static shell (dev warning) ──
  if (!hasInteraction) {
    if (import.meta.env?.DEV) {
      console.warn('[Platform UX Rule] InteractiveCard rendered without interaction. Provide `to`, `onClick`, `comingSoon`, or `empty`.');
    }
    return (
      <div className={cn(baseClasses, 'cursor-default bg-white/[0.02] border border-white/5', className)}>
        {children}
      </div>
    );
  }

  const interactionProps = {
    'data-cursor-label': _cursorLabel,
    'aria-label': ariaLabel || _cursorLabel,
    tabIndex: 0,
  };

  // ── Route navigation (Link) ──
  if (to) {
    return (
      <Link to={to} className={cn(baseClasses, 'cursor-pointer')} {...interactionProps} {...rest}>
        {children}
      </Link>
    );
  }

  // ── Action / modal / drawer / expandable / drill-down (button) ──
  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(e);
        }
      }}
      className={cn(baseClasses, 'cursor-pointer text-left w-full', className)}
      {...interactionProps}
      {...rest}
    >
      {children}
    </button>
  );
}