import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { base44 } from '@/api/base44Client';
import {
  ArrowLeft, Clock, Calendar, User, Share2, Bookmark, Printer, Tag, Crown
} from 'lucide-react';
import { CATEGORY_LABELS, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/components/articles/ArticleCard';
import ArticleReadingProgress from '@/components/articles/ArticleReadingProgress';
import ArticleExecutiveFeatures from '@/components/articles/ArticleExecutiveFeatures';
import ArticleAIPanel from '@/components/articles/ArticleAIPanel';
import ArticleEmptyState from '@/components/articles/ArticleEmptyState';
import RelatedArticles from '@/components/articles/RelatedArticles';
import { toast } from '@/components/ui/use-toast';
import PageMetadata from '@/components/marketing/PageMetadata';

export default function ArticleDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const viewIncremented = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const results = await base44.entities.ExecutiveInsight.filter({
          slug, status: { $in: ['published', 'featured'] }
        }, '-published_at', 1);
        const found = results && results[0];
        if (!cancelled) {
          setArticle(found);
          if (found && !viewIncremented.current) {
            viewIncremented.current = true;
            base44.entities.ExecutiveInsight.update(found.id, {
              view_count: (found.view_count || 0) + 1
            }).catch(() => {});
          }
          // Check bookmark
          const saved = JSON.parse(localStorage.getItem('exec_bookmarks') || '[]');
          if (!cancelled) setBookmarked(saved.includes(found?.id));
        }
      } catch (e) {
        // graceful degradation
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const handleBookmark = () => {
    if (!article) return;
    const saved = JSON.parse(localStorage.getItem('exec_bookmarks') || '[]');
    if (bookmarked) {
      const updated = saved.filter(id => id !== article.id);
      localStorage.setItem('exec_bookmarks', JSON.stringify(updated));
      setBookmarked(false);
      toast({ title: 'Bookmark Removed' });
    } else {
      saved.push(article.id);
      localStorage.setItem('exec_bookmarks', JSON.stringify(saved));
      setBookmarked(true);
      toast({ title: 'Article Bookmarked' });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: article.title, url }); } catch {}
    } else {
      navigator.clipboard.writeText(url);
      toast({ title: 'Link Copied', description: 'Article link copied to clipboard.' });
    }
  };

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-900 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <>
        <ArticleReadingProgress />
        <ArticleEmptyState slug={slug} />
      </>
    );
  }

  const category = CATEGORY_LABELS[article.category] || article.category;
  const difficulty = DIFFICULTY_LABELS[article.difficulty] || 'Intermediate';
  const diffColor = DIFFICULTY_COLORS[article.difficulty] || DIFFICULTY_COLORS.intermediate;

  return (
    <>
      <PageMetadata
        title={`${article.title} | EXECLEAD.AI`}
        description="Read executive leadership insights, perspectives, and practical guidance from EXECLEAD.AI."
        path={`/articles/${slug}`}
      />
      <ArticleReadingProgress />

      {/* Back Bar */}
      <div className="sticky top-[104px] z-40 bg-[#0a0a0f]/90 backdrop-blur border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link to="/articles" className="flex items-center gap-2 text-white/50 hover:text-white/80 text-sm transition-colors">
            <ArrowLeft size={14} /> Back to Insights
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={handleBookmark} data-cursor-label="Bookmark" className={`p-2 rounded-lg transition-colors ${bookmarked ? 'text-amber-400 bg-amber-500/10' : 'text-white/40 hover:text-white/70 hover:bg-white/5'}`}>
              <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
            </button>
            <button onClick={handleShare} data-cursor-label="Share" className="p-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors">
              <Share2 size={16} />
            </button>
            <button onClick={handlePrint} data-cursor-label="Print" className="p-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors">
              <Printer size={16} />
            </button>
          </div>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 font-medium">{category}</span>
            <span className={`text-xs px-2 py-0.5 rounded border ${diffColor}`}>{difficulty}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-3">{article.title}</h1>
          {article.subtitle && <p className="text-lg text-white/50 leading-relaxed mb-6">{article.subtitle}</p>}

          {/* Author & Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/40 mb-8 pb-8 border-b border-white/5">
            {article.author_name && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                  {article.author_is_founder ? <Crown size={14} className="text-amber-400" /> : <User size={14} className="text-white/40" />}
                </div>
                <div>
                  <div className="text-white/70 font-medium text-xs">{article.author_name}</div>
                  {article.author_role && <div className="text-white/30 text-xs">{article.author_role}</div>}
                </div>
              </div>
            )}
            {article.published_at && (
              <div className="flex items-center gap-1"><Calendar size={12} /> {new Date(article.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            )}
            <div className="flex items-center gap-1"><Clock size={12} /> {article.reading_time_minutes || 5} min read</div>
            {article.tags && article.tags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {article.tags.map((tag, i) => (
                  <span key={i} className="flex items-center gap-0.5 text-xs"><Tag size={10} className="text-white/20" /> {tag}</span>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Hero Image */}
        {article.featured_image_url && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="rounded-2xl overflow-hidden mb-8">
            <img src={article.featured_image_url} alt={article.title} className="w-full h-64 md:h-96 object-cover" />
          </motion.div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          {/* Article Body */}
          <div className="min-w-0">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-2xl font-bold text-white mt-8 mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-bold text-white mt-8 mb-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-semibold text-white mt-6 mb-2">{children}</h3>,
                p: ({ children }) => <p className="text-white/60 leading-relaxed mb-4">{children}</p>,
                ul: ({ children }) => <ul className="space-y-2 mb-4 ml-4">{children}</ul>,
                ol: ({ children }) => <ol className="space-y-2 mb-4 ml-4 list-decimal">{children}</ol>,
                li: ({ children }) => <li className="text-white/60 leading-relaxed list-disc">{children}</li>,
                blockquote: ({ children }) => <blockquote className="border-l-4 border-amber-500/40 pl-4 py-2 my-6 bg-amber-500/5 rounded-r-lg text-white/70 italic">{children}</blockquote>,
                code: ({ children }) => <code className="bg-white/10 rounded px-1.5 py-0.5 text-xs font-mono text-amber-400">{children}</code>,
                pre: ({ children }) => <pre className="bg-white/5 border border-white/10 rounded-lg p-4 overflow-x-auto mb-4">{children}</pre>,
                a: ({ children, href }) => <a href={href} className="text-accent-orange hover:underline">{children}</a>,
                table: ({ children }) => <table className="w-full border-collapse mb-4">{children}</table>,
                th: ({ children }) => <th className="border border-white/10 px-3 py-2 text-left text-white/70 font-semibold text-sm bg-white/5">{children}</th>,
                td: ({ children }) => <td className="border border-white/10 px-3 py-2 text-white/50 text-sm">{children}</td>,
              }}
            >
              {article.content || ''}
            </ReactMarkdown>

            {/* AI Panel */}
            <div className="mt-8">
              <ArticleAIPanel article={article} />
            </div>
          </div>

          {/* Sidebar — Executive Features */}
          <aside className="lg:sticky lg:top-20 lg:self-start space-y-4">
            <ArticleExecutiveFeatures article={article} />
          </aside>
        </div>

        {/* Related Articles */}
        <RelatedArticles article={article} />
      </article>
    </>
  );
}