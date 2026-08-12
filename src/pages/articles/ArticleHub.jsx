import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, BookOpen, Clock, Filter, X, Crown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ArticleCard, { CATEGORY_LABELS, DIFFICULTY_LABELS } from '@/components/articles/ArticleCard';
import PageMetadata from '@/components/marketing/PageMetadata';

const CATEGORIES = Object.entries(CATEGORY_LABELS);
const DIFFICULTIES = Object.entries(DIFFICULTY_LABELS);
const READING_TIMES = [
  { id: 'short', label: '< 5 min', filter: (m) => m < 5 },
  { id: 'medium', label: '5-10 min', filter: (m) => m >= 5 && m <= 10 },
  { id: 'long', label: '> 10 min', filter: (m) => m > 10 },
];

export default function ArticleHub() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeDifficulty, setActiveDifficulty] = useState(null);
  const [activeReadingTime, setActiveReadingTime] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const results = await base44.entities.ExecutiveInsight.filter(
          { status: { $in: ['published', 'featured'] } },
          '-published_at',
          50
        );
        if (!cancelled) setArticles(results || []);
      } catch (e) {
        // graceful degradation
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = articles.filter(a => {
    if (search) {
      const q = search.toLowerCase();
      const matches = a.title?.toLowerCase().includes(q) ||
        a.excerpt?.toLowerCase().includes(q) ||
        a.author_name?.toLowerCase().includes(q) ||
        a.tags?.some(t => t.toLowerCase().includes(q));
      if (!matches) return false;
    }
    if (activeCategory && a.category !== activeCategory) return false;
    if (activeDifficulty && a.difficulty !== activeDifficulty) return false;
    if (activeReadingTime) {
      const rt = READING_TIMES.find(r => r.id === activeReadingTime);
      if (rt && !rt.filter(a.reading_time_minutes || 5)) return false;
    }
    return true;
  });

  const featured = articles.filter(a => a.featured || a.status === 'featured').slice(0, 1);
  const clearFilters = () => { setSearch(''); setActiveCategory(null); setActiveDifficulty(null); setActiveReadingTime(null); };
  const hasFilters = search || activeCategory || activeDifficulty || activeReadingTime;

  return (
    <div className="min-h-screen pb-20">
      <PageMetadata
        title="Executive Leadership Articles | EXECLEAD.AI"
        description="Explore executive leadership insights, articles, perspectives, and practical guidance from EXECLEAD.AI."
        path="/articles"
      />
      {/* Hero */}
      <div className="relative pt-32 pb-16 px-6 lg:px-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-xs text-amber-400 mb-6">
            <BookOpen size={12} /> Executive Insights™
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Executive Leadership Insights</h1>
          <p className="text-white/40 max-w-2xl mx-auto">
            Research, practical frameworks, and executive perspectives designed to help ambitious technology professionals develop executive leadership capabilities.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, tag, author, or keyword..."
              className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/40 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-8 pb-6 border-b border-white/5">
          <div className="flex items-center gap-1 text-white/30 text-xs mr-2"><Filter size={12} /> Filters:</div>
          {CATEGORIES.map(([value, label]) => (
            <button
              key={value}
              onClick={() => setActiveCategory(activeCategory === value ? null : value)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeCategory === value ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-white/[0.02] text-white/40 border border-white/5 hover:text-white/70'
              }`}
            >
              {label}
            </button>
          ))}
          <div className="w-px h-4 bg-white/10 mx-1" />
          {DIFFICULTIES.map(([value, label]) => (
            <button
              key={value}
              onClick={() => setActiveDifficulty(activeDifficulty === value ? null : value)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeDifficulty === value ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30' : 'bg-white/[0.02] text-white/40 border border-white/5 hover:text-white/70'
              }`}
            >
              {label}
            </button>
          ))}
          <div className="w-px h-4 bg-white/10 mx-1" />
          {READING_TIMES.map(r => (
            <button
              key={r.id}
              onClick={() => setActiveReadingTime(activeReadingTime === r.id ? null : r.id)}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeReadingTime === r.id ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' : 'bg-white/[0.02] text-white/40 border border-white/5 hover:text-white/70'
              }`}
            >
              <Clock size={10} /> {r.label}
            </button>
          ))}
          {hasFilters && (
            <button onClick={clearFilters} className="ml-auto text-white/30 hover:text-white/60 text-xs flex items-center gap-1">
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {/* Featured Article */}
        {!hasFilters && featured.length > 0 && (
          <div className="mb-8">
            <Link to={`/articles/${featured[0].slug || featured[0].id}`} data-cursor-label="Read Article" className="block group">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/[0.02] border border-amber-500/15 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all">
                <div className="h-48 md:h-64 bg-gradient-to-br from-amber-500/15 to-accent-orange/10 flex items-center justify-center">
                  {featured[0].featured_image_url ? (
                    <img src={featured[0].featured_image_url} alt={featured[0].title} className="w-full h-full object-cover" />
                  ) : (
                    <Crown size={32} className="text-amber-400/30" />
                  )}
                </div>
                <div className="p-6 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] px-2 py-0.5 bg-amber-500/20 rounded-full text-amber-400 font-medium">Featured</span>
                    <span className="text-xs text-white/30">{CATEGORY_LABELS[featured[0].category]}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">{featured[0].title}</h2>
                  <p className="text-white/40 text-sm leading-relaxed mb-4">{featured[0].excerpt}</p>
                  <div className="flex items-center gap-1 text-white/30 text-xs"><Clock size={12} /> {featured[0].reading_time_minutes || 5} min read</div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Article Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-72 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={32} className="text-white/20 mx-auto mb-4" />
            <p className="text-white/40 text-sm">No articles match your filters.</p>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-4 text-amber-400 text-sm hover:underline">Clear filters</button>
            )}
          </div>
        ) : (
          <>
            <p className="text-white/30 text-xs mb-4">{filtered.length} article{filtered.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((a, i) => (
                <ArticleCard key={a.id} article={a} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}