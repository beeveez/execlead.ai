import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ComingSoon™ — Standardized "intentionally unavailable" display.
 *
 * Shows: Expected Purpose · Current Status · Planned Availability
 * so users immediately understand why an interaction is unavailable.
 */
export default function ComingSoon({
  purpose,
  status = 'In Development',
  availability = 'General Availability',
  title = 'Coming Soon',
  compact = false,
  className = '',
  children,
}) {
  if (compact) {
    return (
      <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] text-blue-400 font-medium uppercase tracking-wider', className)}>
        <Sparkles size={10} />
        Coming Soon
      </span>
    );
  }

  return (
    <div className={cn('bg-blue-500/[0.04] border border-blue-500/15 rounded-2xl p-6', className)}>
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
          <Sparkles size={16} className="text-blue-400" />
        </div>
        <div>
          <h3 className="text-blue-400 font-semibold text-sm">{title}</h3>
          <p className="text-white/40 text-xs mt-0.5">This feature is intentionally unavailable.</p>
        </div>
      </div>
      <div className="space-y-2">
        {purpose && (
          <div className="flex gap-2 text-xs">
            <span className="text-white/30 font-medium w-20 shrink-0">Purpose</span>
            <span className="text-white/60">{purpose}</span>
          </div>
        )}
        <div className="flex gap-2 text-xs">
          <span className="text-white/30 font-medium w-20 shrink-0">Status</span>
          <span className="text-white/60">{status}</span>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="text-white/30 font-medium w-20 shrink-0">Planned</span>
          <span className="text-white/60">{availability}</span>
        </div>
      </div>
      {children && <div className="mt-4 pt-4 border-t border-white/5">{children}</div>}
    </div>
  );
}