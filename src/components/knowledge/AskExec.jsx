import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Send, Loader2, AlertCircle, ChevronRight, ShieldCheck, Clock, Database,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { trackKnowledgeAiAsk } from '@/lib/knowledgeIntelligenceClient';

function scoreArticle(article, q) {
  const haystack = `${article.question} ${article.short_answer} ${article.detailed_answer || ''} ${(article.tags || []).join(' ')} ${article.category}`.toLowerCase();
  const terms = q.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  if (!terms.length) return 0;
  let score = 0;
  for (const t of terms) if (haystack.includes(t)) score += 1;
  if (article.question.toLowerCase().includes(q.toLowerCase())) score += 3;
  return score;
}

function confLabel(c) {
  if (c >= 75) return { label: 'High', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25' };
  if (c >= 50) return { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/25' };
  return { label: 'Low', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/25' };
}
function fmtDate(d) { if (!d) return '—'; try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch (e) { return '—'; } }

export default function AskExec({ articles, onOpen }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const ask = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const ranked = articles
        .map((a) => ({ a, s: scoreArticle(a, query) }))
        .filter((x) => x.s > 0)
        .sort((x, y) => y.s - x.s)
        .slice(0, 5);

      if (ranked.length === 0) {
        trackKnowledgeAiAsk({ query, confidence: 0, sourcesCount: 0, noResult: true, citedSlugs: [] });
        setResult({
          answer: "I couldn't find enough approved documentation to answer this confidently. Here are some related questions that may help.",
          sources: articles.slice(0, 4),
          noResult: true,
          confidence: 0,
          sourcesCount: 0,
          freshness: null,
        });
        setLoading(false);
        return;
      }

      const context = ranked.map((r, i) => `ARTICLE ${i + 1}\nQuestion: ${r.a.question}\nShort Answer: ${r.a.short_answer}\nDetailed: ${r.a.detailed_answer || ''}`).join('\n\n');
      const prompt = `You are EXEC™, the AI assistant for the EXECLEAD.AI Executive Knowledge Center™. Answer the user's question using ONLY the approved knowledge articles below. Never invent information. If the articles do not fully answer the question, say so briefly and recommend the listed related questions. Keep the answer concise (2-4 sentences) and executive in tone.\n\nKNOWLEDGE ARTICLES:\n${context}\n\nUSER QUESTION: ${query}\n\nANSWER:`;

      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            answer: { type: 'string' },
            source_slugs: { type: 'array', items: { type: 'string' } },
          },
        },
      });
      const data = res.data || res;
      const answer = data.answer || '';
      const slugs = data.source_slugs || ranked.map((r) => r.a.slug);
      const sources = slugs.map((s) => articles.find((a) => a.slug === s)).filter(Boolean);
      const finalSources = sources.length ? sources : ranked.map((r) => r.a);
      const sourcesCount = finalSources.length;
      const confidence = Math.min(100, 40 + sourcesCount * 20);
      const freshness = finalSources.map((s) => s.last_updated || s.updated_date).filter(Boolean).sort().pop();
      trackKnowledgeAiAsk({ query, confidence, sourcesCount, noResult: false, citedSlugs: slugs });
      setResult({ answer, sources: finalSources, confidence, sourcesCount, freshness });
    } catch (e) {
      trackKnowledgeAiAsk({ query, confidence: 0, sourcesCount: 0, noResult: true, citedSlugs: [] });
      setResult({ answer: 'Ask EXEC™ is temporarily unavailable. Please try the search above or browse the categories.', sources: [], error: true, confidence: 0, sourcesCount: 0, freshness: null });
    } finally {
      setLoading(false);
    }
  };

  const c = result ? confLabel(result.confidence) : null;

  return (
    <div className="rounded-2xl border border-accent-orange/20 bg-gradient-to-br from-accent-orange/[0.06] to-transparent p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-accent-orange/15 flex items-center justify-center"><Sparkles size={16} className="text-accent-orange" /></div>
        <div>
          <div className="text-sm font-semibold text-white">Ask EXEC™</div>
          <div className="text-[11px] text-white/45">Answers grounded only in approved knowledge articles — never invented.</div>
        </div>
      </div>
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') ask(); }}
          placeholder="Ask anything about EXECLEAD.AI…"
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent-orange/40"
        />
        <button onClick={ask} disabled={loading || !query.trim()} className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-white text-sm font-semibold transition-colors disabled:opacity-40">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
            {/* AI Confidence™ strip */}
            {!result.error && (
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold border ${c.bg} ${c.border} ${c.color}`}>
                  <ShieldCheck size={11} /> Confidence {c.label} · {result.confidence}%
                </span>
                <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] bg-white/5 border border-white/10 text-white/55">
                  <Database size={10} /> {result.sourcesCount} source{result.sourcesCount === 1 ? '' : 's'}
                </span>
                <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] bg-white/5 border border-white/10 text-white/45">
                  <Clock size={10} /> Updated {fmtDate(result.freshness)}
                </span>
              </div>
            )}
            <div className="flex items-start gap-2 rounded-xl bg-white/[0.03] border border-white/8 p-4">
              {result.error || result.noResult ? <AlertCircle size={15} className="text-amber-400 shrink-0 mt-0.5" /> : <ShieldCheck size={15} className="text-emerald-400 shrink-0 mt-0.5" />}
              <p className="text-[13px] text-white/75 leading-relaxed">{result.answer}</p>
            </div>
            {result.sources && result.sources.length > 0 && (
              <div className="mt-3">
                <div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-2">{result.noResult ? 'Related Questions' : 'Sources'}</div>
                <div className="space-y-1.5">
                  {result.sources.map((s) => (
                    <button key={s.slug} onClick={() => onOpen(s.slug)} className="w-full flex items-center justify-between gap-2 rounded-lg border border-white/8 bg-white/[0.02] hover:bg-white/[0.04] px-3 py-2 text-left transition-colors">
                      <span className="text-[12px] text-white/70">{s.question}</span>
                      <ChevronRight size={13} className="text-white/40 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}