import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ArrowRight, Clock } from 'lucide-react';

/**
 * InteractiveArticle™ — Universal Article Card
 *
 * Every article card opens the full article detail page.
 * Entire card surface is the click target.
 *
 * Props:
 *   to           — article route (e.g. `/articles/:slug`)
 *   title        — article title
 *   excerpt      — short summary
 *   category     — category label
 *   imageUrl     — cover image URL
 *   readingTime  — minutes
 *   author       — author name
 *   comingSoon   — { purpose, status, availability }
 */
export default function InteractiveArticle({
  to,
  title,
  excerpt,
  category,
  imageUrl,
  readingTime,
  author,
  comingSoon,
  className = '',
}) {
  const hasInteraction = to || comingSoon;
  const baseClasses = cn(
    'group relative block rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden transition-all duration-300',
    'hover:shadow-lg hover:-translate-y-0.5 hover:border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40',
    className
  );

  const content = (
    <>
      {imageUrl && (
        <div className="aspect-[16/9] overflow-hidden bg-white/5">
          <img src={imageUrl} alt={title || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        </div>
      )}
      <div className="p-5">
        {category && (
          <span className="inline-block px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] text-amber-400 font-medium uppercase tracking-wider mb-3">
            {category}
          </span>
        )}
        {title && <h3 className="text-white font-semibold text-base mb-2 group-hover:text-amber-400 transition-colors leading-snug">{title}</h3>}
        {excerpt && <p className="text-white/40 text-sm leading-relaxed line-clamp-2">{excerpt}</p>}
        <div className="flex items-center gap-3 mt-4 text-white/30 text-xs">
          {author && <span>{author}</span>}
          {readingTime && (
            <span className="flex items-center gap-1">
              <Clock size={10} /> {readingTime} min read
            </span>
          )}
          {hasInteraction && !comingSoon && (
            <span className="flex items-center gap-1 ml-auto text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Read <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          )}
        </div>
        {comingSoon && (
          <span className="inline-block mt-3 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] text-blue-400 font-medium uppercase tracking-wider">Coming Soon</span>
        )}
      </div>
    </>
  );

  if (comingSoon) {
    return <div className={cn(baseClasses, 'cursor-default')} data-cursor-label="Coming Soon" tabIndex={0}>{content}</div>;
  }

  if (!hasInteraction) {
    if (import.meta.env?.DEV) {
      console.warn('[Platform UX Rule] InteractiveArticle rendered without `to`:', title);
    }
    return <div className={cn(baseClasses, 'cursor-default')}>{content}</div>;
  }

  return (
    <Link to={to} className={cn(baseClasses, 'cursor-pointer')} data-cursor-label="Read Article" aria-label={title} tabIndex={0}>
      {content}
    </Link>
  );
}