import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ArrowRight, Sparkles } from 'lucide-react';

/**
 * InteractiveInsight™ — Universal Insight Card
 *
 * Every AI insight, recommendation, and executive summary is actionable.
 * Opens full analysis, related metrics, or an AI conversation.
 *
 * Props:
 *   title       — insight title
 *   source      — 'ai' | 'analytics' | 'audit' | 'executive'
 *   to          — full analysis route
 *   onClick      — open AI conversation / detail handler
 *   comingSoon   — { purpose, status, availability }
 *   actionable   — show "Take Action" CTA
 */
export default function InteractiveInsight({
  title,
  source = 'ai',
  to,
  onClick,
  comingSoon,
  actionable = true,
  className = '',
  children,
}) {
  const hasInteraction = to || onClick || comingSoon;
  const baseClasses = cn(
    'group relative block rounded-xl bg-gradient-to-br from-indigo-500/5 to-transparent border border-indigo-500/10 p-4 transition-all duration-300',
    'hover:shadow-lg hover:-translate-y-0.5 hover:border-indigo-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40',
    className
  );

  const sourceBadge = source === 'ai' && (
    <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] text-indigo-400 font-medium uppercase tracking-wider">
      <Sparkles size={9} /> AI Insight
    </span>
  );

  const content = (
    <>
      <div className="flex items-center justify-between mb-2">
        {sourceBadge}
        {hasInteraction && !comingSoon && actionable && (
          <span className="flex items-center gap-1 text-[11px] text-indigo-400/50 group-hover:text-indigo-400 transition-colors">
            {source === 'ai' ? 'Ask AI' : 'Explore'} <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        )}
      </div>
      {title && <h4 className="text-white font-semibold text-sm mb-1">{title}</h4>}
      {children && <div className="text-white/50 text-sm leading-relaxed">{children}</div>}
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
      console.warn('[Platform UX Rule] InteractiveInsight rendered without interaction:', title);
    }
    return <div className={cn(baseClasses, 'cursor-default')}>{content}</div>;
  }

  if (to) {
    return (
      <Link to={to} className={cn(baseClasses, 'cursor-pointer')} data-cursor-label="Explore Insight" aria-label={title} tabIndex={0}>
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
      data-cursor-label="Explore Insight"
      aria-label={title}
      tabIndex={0}
    >
      {content}
    </button>
  );
}