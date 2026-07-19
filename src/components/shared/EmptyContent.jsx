import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Bell, ArrowRight, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * EmptyContent™ — Standardized empty / not-yet-created state.
 *
 * Never opens a blank page. Shows the Private Beta preparation message
 * with options: Notify Me · Explore Related Content · Return.
 */
export default function EmptyContent({
  message = 'This content is currently being prepared as part of the EXECLEAD.AI Private Beta.',
  relatedLink,
  relatedLabel = 'Explore Related Content',
  returnLink = -1,
  returnLabel = 'Return',
  onNotify,
  icon: Icon = BookOpen,
  className = '',
}) {
  const handleReturn = () => {
    if (typeof returnLink === 'number') {
      window.history.go(returnLink);
    } else if (typeof returnLink === 'string') {
      window.location.href = returnLink;
    }
  };

  return (
    <div className={cn('text-center py-12 bg-white/[0.02] border border-white/5 rounded-2xl px-6', className)}>
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
        <Icon size={24} className="text-white/30" />
      </div>
      <p className="text-white/40 text-sm leading-relaxed max-w-md mx-auto mb-6">{message}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onNotify && (
          <button
            onClick={onNotify}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 rounded-lg text-xs text-amber-400 font-medium transition-colors"
          >
            <Bell size={12} /> Notify Me
          </button>
        )}
        {relatedLink && (
          <Link
            to={relatedLink}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/60 font-medium transition-colors"
          >
            {relatedLabel} <ArrowRight size={12} />
          </Link>
        )}
        <button
          onClick={handleReturn}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/60 font-medium transition-colors"
        >
          <RotateCcw size={12} /> {returnLabel}
        </button>
      </div>
    </div>
  );
}