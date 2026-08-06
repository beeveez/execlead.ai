import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Clock, Check, X, Lightbulb, Sparkles, ShieldCheck, ThumbsUp, ThumbsDown,
  ChevronRight, Users,
} from 'lucide-react';
import { TRUST_CATEGORIES } from '@/lib/knowledgeCenterData';

function fmtDate(d) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch (e) { return '—'; }
}

export default function ArticleDetail({ article, articles, onBack, onRelated, onVote }) {
  const [voted, setVoted] = useState(null);
  const related = (article.related_articles || [])
    .map((s) => articles.find((a) => a.slug === s))
    .filter(Boolean);

  const vote = (helpful) => {
    if (voted) return;
    setVoted(helpful ? 'up' : 'down');
    onVote?.(article.slug, helpful);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-6 lg:py-10">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/80 transition-colors mb-5">
        <ArrowLeft size={14} /> Back to Knowledge Center
      </button>

      <div className="flex items-center gap-2 mb-3">
        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-accent-orange/10 text-accent-orange border border-accent-orange/20">{article.category}</span>
        {article.difficulty && <span className="text-[11px] text-white/35 capitalize">{article.difficulty}</span>}
      </div>
      <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-3">{article.question}</h1>
      <p className="text-base text-white/70 leading-relaxed mb-4">{article.short_answer}</p>

      <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/40 mb-6 pb-6 border-b border-white/8">
        <span className="flex items-center gap-1"><Clock size={11} /> Updated {fmtDate(article.last_updated || article.updated_date)}</span>
        <span className="flex items-center gap-1"><Users size={11} /> {(article.audience || []).join(', ') || 'General'}</span>
        <span>v{article.version || '1.0'}</span>
      </div>

      {article.detailed_answer && (
        <Section title="Detailed Explanation">{article.detailed_answer}</Section>
      )}
      {article.scenario && (
        <Section title="Sample Scenario" icon={Lightbulb}>{article.scenario}</Section>
      )}
      {article.what_it_does && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
            <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] uppercase tracking-wider font-semibold mb-2"><Check size={12} /> What EXECLEAD.AI Does</div>
            <p className="text-[13px] text-white/75 leading-relaxed">{article.what_it_does}</p>
          </div>
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.05] p-4">
            <div className="flex items-center gap-1.5 text-rose-400 text-[11px] uppercase tracking-wider font-semibold mb-2"><X size={12} /> What It Does NOT Do</div>
            <p className="text-[13px] text-white/75 leading-relaxed">{article.what_it_does_not}</p>
          </div>
        </div>
      )}
      {article.best_practice && (
        <Section title="Best Practice" icon={Sparkles}>{article.best_practice}</Section>
      )}

      {article.related_features && article.related_features.length > 0 && (
        <div className="mb-6">
          <div className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mb-2">Related Features</div>
          <div className="flex flex-wrap gap-2">
            {article.related_features.map((f) => (
              <span key={f} className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/8 text-[11px] text-white/65">{f}</span>
            ))}
          </div>
        </div>
      )}

      {/* Trust Center linking */}
      {TRUST_CATEGORIES.includes(article.category) && (
        <Link to="/trust-center" className="block rounded-xl border border-indigo-500/20 bg-indigo-500/[0.05] p-4 mb-6 hover:bg-indigo-500/[0.08] transition-colors">
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-indigo-300" />
            <span className="text-[13px] font-semibold text-white">Learn more in the Trust Center™</span>
            <ChevronRight size={14} className="text-white/40 ml-auto" />
          </div>
          <p className="text-[11px] text-white/50 mt-1">Security, privacy, responsible AI, and compliance commitments.</p>
        </Link>
      )}

      {/* Related articles */}
      {related.length > 0 && (
        <div className="mb-6">
          <div className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mb-2">Related Questions</div>
          <div className="space-y-2">
            {related.map((r) => (
              <button key={r.slug} onClick={() => onRelated(r.slug)} className="w-full flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.02] hover:bg-white/[0.04] px-4 py-3 transition-colors text-left">
                <span className="text-[13px] text-white/75">{r.question}</span>
                <ChevronRight size={14} className="text-white/40 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Helpful vote */}
      <div className="flex items-center gap-3 pt-4 border-t border-white/8">
        <span className="text-[12px] text-white/50">Was this helpful?</span>
        <button onClick={() => vote(true)} disabled={!!voted} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] transition-colors ${voted === 'up' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'border-white/10 text-white/60 hover:bg-white/5'} ${voted ? 'opacity-70' : ''}`}>
          <ThumbsUp size={12} /> Yes
        </button>
        <button onClick={() => vote(false)} disabled={!!voted} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] transition-colors ${voted === 'down' ? 'bg-rose-500/15 border-rose-500/30 text-rose-400' : 'border-white/10 text-white/60 hover:bg-white/5'} ${voted ? 'opacity-70' : ''}`}>
          <ThumbsDown size={12} /> No
        </button>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/40 font-semibold mb-1.5">
        {Icon && <Icon size={12} className="text-accent-orange/70" />}{title}
      </div>
      <p className="text-[14px] text-white/70 leading-relaxed">{children}</p>
    </div>
  );
}