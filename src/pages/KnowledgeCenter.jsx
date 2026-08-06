import React, { useState, useEffect, useMemo } from 'react';
import { Search, Building2, TrendingUp, Newspaper, Sparkles, X, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  trackKnowledgeSearch, trackKnowledgeView, trackKnowledgeVote,
} from '@/lib/knowledgeIntelligenceClient';
import {
  ARTICLES, NAV_GROUPS, AUDIENCES, ENTERPRISE_FAQ_SLUGS, INVESTOR_FAQ_SLUGS, MEDIA_FAQ_SLUGS,
} from '@/lib/knowledgeCenterData';
import ArticleCard from '@/components/knowledge/ArticleCard';
import ArticleDetail from '@/components/knowledge/ArticleDetail';
import AskExec from '@/components/knowledge/AskExec';

function matchesQuery(a, q) {
  if (!q) return true;
  const hay = `${a.question} ${a.short_answer} ${a.detailed_answer || ''} ${(a.tags || []).join(' ')} ${a.category} ${(a.related_features || []).join(' ')}`.toLowerCase();
  return q.toLowerCase().split(/\s+/).filter((t) => t.length > 1).every((t) => hay.includes(t));
}

export default function KnowledgeCenter() {
  const [articles, setArticles] = useState(ARTICLES);
  const [activeGroup, setActiveGroup] = useState('Overview');
  const [query, setQuery] = useState('');
  const [audience, setAudience] = useState(null);
  const [selectedSlug, setSelectedSlug] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const recs = await base44.entities.KnowledgeArticle.filter({ published: true }, '-updated_date', 200);
        if (recs && recs.length) setArticles(recs);
      } catch (e) {}
    })();
    const urlParams = new URLSearchParams(window.location.search);
    const s = urlParams.get('article');
    if (s) openArticle(s);
  }, []);

  const openArticle = (slug) => {
    setSelectedSlug(slug);
    const art = articles.find((a) => a.slug === slug);
    try { base44.analytics.track({ eventName: 'knowledge_article_view', properties: { slug } }); } catch (e) {}
    trackKnowledgeView(slug, art?.category);
    const url = new URL(window.location.href);
    url.searchParams.set('article', slug);
    window.history.replaceState({}, '', url.toString());
  };

  const back = () => {
    setSelectedSlug(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('article');
    window.history.replaceState({}, '', url.toString());
  };

  const onSearch = (q) => {
    setQuery(q);
    if (q && q.length > 2) {
      const cnt = articles.filter((a) => matchesQuery(a, q.trim())).length;
      try { base44.analytics.track({ eventName: cnt ? 'knowledge_search' : 'knowledge_no_result', properties: { q: q.slice(0, 120) } }); } catch (e) {}
      trackKnowledgeSearch(q, cnt, audience || '');
    }
  };

  const onVote = (slug, helpful) => {
    try { base44.analytics.track({ eventName: 'knowledge_helpful_vote', properties: { slug, helpful } }); } catch (e) {}
    trackKnowledgeVote(slug, helpful);
  };

  const selected = useMemo(() => articles.find((a) => a.slug === selectedSlug), [articles, selectedSlug]);

  if (selected) {
    return <ArticleDetail article={selected} articles={articles} onBack={back} onRelated={openArticle} onVote={onVote} />;
  }

  const groupCategories = (NAV_GROUPS.find((g) => g.label === activeGroup) || NAV_GROUPS[0]).categories;
  const showingSearch = query.trim().length > 1;

  let visible = showingSearch
    ? articles.filter((a) => matchesQuery(a, query.trim()))
    : articles.filter((a) => groupCategories.includes(a.category));
  if (audience) visible = visible.filter((a) => (a.audience || []).includes(audience));

  const quickSections = [
    { label: 'Enterprise FAQ', icon: Building2, slugs: ENTERPRISE_FAQ_SLUGS, color: 'text-indigo-300', border: 'border-indigo-500/20', bg: 'bg-indigo-500/[0.05]' },
    { label: 'Investor FAQ', icon: TrendingUp, slugs: INVESTOR_FAQ_SLUGS, color: 'text-emerald-300', border: 'border-emerald-500/20', bg: 'bg-emerald-500/[0.05]' },
    { label: 'Media FAQ', icon: Newspaper, slugs: MEDIA_FAQ_SLUGS, color: 'text-amber-300', border: 'border-amber-500/20', bg: 'bg-amber-500/[0.05]' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6 lg:py-10">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-orange/10 border border-accent-orange/25 rounded-full text-xs text-accent-orange font-semibold mb-3">
          <ShieldCheck size={13} /> Executive Knowledge Center™
        </div>
        <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight mb-2">Every Question. One Source of Truth.</h1>
        <p className="text-sm text-white/55 max-w-2xl mx-auto">Answers for visitors, customers, enterprise buyers, investors, journalists, recruiters, and administrators.</p>
      </div>

      {/* Search + Ask EXEC */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={query}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search the knowledge center…"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent-orange/40"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
              <X size={15} />
            </button>
          )}
        </div>
        <AskExec articles={articles} onOpen={openArticle} />
      </div>

      {/* Top category nav */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 -mx-1 px-1">
        {NAV_GROUPS.map((g) => (
          <button
            key={g.label}
            onClick={() => { setActiveGroup(g.label); setQuery(''); }}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-colors ${activeGroup === g.label && !showingSearch ? 'bg-accent-orange/15 text-accent-orange border border-accent-orange/30' : 'bg-white/[0.03] text-white/55 border border-white/8 hover:bg-white/[0.06]'}`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* Audience filter */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-[11px] text-white/35 mr-1">Audience:</span>
        {AUDIENCES.map((a) => (
          <button
            key={a}
            onClick={() => setAudience(audience === a ? null : a)}
            className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${audience === a ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30' : 'bg-white/[0.03] text-white/50 border-white/8 hover:bg-white/[0.06]'}`}
          >
            {a}
          </button>
        ))}
      </div>

      {/* Quick-access FAQ sections (only on overview, no search) */}
      {!showingSearch && activeGroup === 'Overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {quickSections.map((s) => (
            <div key={s.label} className={`rounded-2xl border ${s.border} ${s.bg} p-4`}>
              <div className="flex items-center gap-2 mb-3">
                <s.icon size={16} className={s.color} />
                <span className="text-sm font-semibold text-white">{s.label}</span>
              </div>
              <div className="space-y-1.5">
                {s.slugs.map((slug) => {
                  const art = articles.find((x) => x.slug === slug);
                  if (!art) return null;
                  return (
                    <button key={slug} onClick={() => openArticle(slug)} className="block w-full text-left text-[12px] text-white/65 hover:text-white transition-colors leading-snug">
                      · {art.question}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-white">
          {showingSearch ? `Search results (${visible.length})` : `${activeGroup}`}
        </h2>
        {!showingSearch && <span className="text-[11px] text-white/40">{visible.length} articles</span>}
      </div>

      {/* Article grid */}
      {visible.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-white/8 bg-white/[0.02]">
          <Sparkles size={22} className="text-amber-400 mx-auto mb-2" />
          <p className="text-white/70 text-sm font-medium">No articles found.</p>
          <p className="text-white/40 text-[12px] mt-1">Try a different search or browse another category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.slice(0, 30).map((a, i) => (
            <ArticleCard key={a.slug} article={a} onOpen={openArticle} index={i} />
          ))}
        </div>
      )}

      {visible.length > 30 && (
        <p className="text-center text-[11px] text-white/35 mt-4">Showing 30 of {visible.length}. Refine your search to see more.</p>
      )}

      <div className="text-center mt-10 pt-6 border-t border-white/5">
        <p className="text-[11px] text-white/35">Knowledge builds confidence. Practice builds excellence. Leadership is a lifelong journey.</p>
        <p className="text-[11px] text-accent-orange/70 mt-1">One Leadership Journey. One AI Platform. One Executive Knowledge Center™.</p>
      </div>
    </div>
  );
}