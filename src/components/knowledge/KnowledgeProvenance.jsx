import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import KnowledgeDetailLinks from '@/components/knowledge/KnowledgeDetailLinks';

const confidenceLabel = (score) => score >= 75 ? 'High' : score >= 50 ? 'Medium' : 'Low';
const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—';

export default function KnowledgeProvenance({ sources, confidence, freshness, articles, onOpen }) {
  const [open, setOpen] = useState(false);
  const sourceSlugs = new Set(sources.map((source) => source.slug));
  const relatedSlugs = [...new Set(sources.flatMap((source) => source.related_articles || []))];
  const related = relatedSlugs.map((slug) => articles.find((article) => article.slug === slug)).filter((article) => article && !sourceSlugs.has(article.slug));
  const detailsId = 'exec-knowledge-details';

  return (
    <div className="mt-3 text-[11px]">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-emerald-400/90">
        <span className="inline-flex items-center gap-1 font-medium"><Check size={12} /> Verified EXECLEAD.AI Knowledge</span>
        <button onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls={detailsId} className="inline-flex items-center gap-1 text-white/45 transition-colors hover:text-white/70">
          View Source <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {open && (
        <dl id={detailsId} className="mt-3 grid gap-3 border-t border-white/8 pt-3 text-white/65 sm:grid-cols-3">
          <div><dt className="text-[10px] font-semibold uppercase tracking-wider text-white/35">Knowledge Source</dt><dd className="mt-1">{sources[0]?.category ? `${sources[0].category} Article` : 'Approved Knowledge Article'}</dd></div>
          <div><dt className="text-[10px] font-semibold uppercase tracking-wider text-white/35">Confidence</dt><dd className="mt-1">{confidenceLabel(confidence)} · {confidence}%</dd></div>
          <div><dt className="text-[10px] font-semibold uppercase tracking-wider text-white/35">Last Updated</dt><dd className="mt-1">{formatDate(freshness)}</dd></div>
          <KnowledgeDetailLinks label="Sources Used" items={sources} onOpen={onOpen} />
          <KnowledgeDetailLinks label="Related Articles" items={related} onOpen={onOpen} />
        </dl>
      )}
    </div>
  );
}