import React, { useState } from 'react';
import { SectionShell, SearchBar, Badge, Row, EmptyState } from './PKShared';
import { searchFeatures, askPlatformAI, MODULES } from '@/lib/platformKnowledgeCenter';
import { Search, Sparkles, Loader2, MessageSquare } from 'lucide-react';

const TYPE_COLORS = { module: '#6366f1', engine: '#8b5cf6', route: '#0ea5e9', entity: '#f59e0b' };

const SUGGESTED = [
  'Where is Executive Passport used?',
  'What modules depend on Decision Lab?',
  'What AI engines use Recommendation Intelligence?',
  'What was built during Engineering 3?',
  'What routes use Executive Readiness?',
  'What database stores Decision DNA?',
  'What depends on AI Governance?',
  'What modules are incomplete?',
];

export default function FeatureSearch({ onSelectModule }) {
  const [query, setQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const results = query ? searchFeatures(query) : [];

  const runAI = async (q) => {
    setAiLoading(true);
    try {
      const res = await askPlatformAI(q);
      setAiAnswer(res);
    } catch (e) {
      setAiAnswer({ answer: 'Unable to reach the AI Documentation Assistant right now.', related: [] });
    }
    setAiLoading(false);
  };

  return (
    <SectionShell title="Feature Search™" subtitle="Natural language search across the entire platform" icon={Search}>
      <div className="flex gap-2">
        <SearchBar value={query} onChange={setQuery} placeholder="Search any feature, module, engine, route, or entity..." />
        <button
          onClick={() => query && runAI(query)}
          disabled={!query || aiLoading}
          className="px-4 py-2.5 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-medium hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center gap-1.5 whitespace-nowrap"
        >
          {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          Ask AI
        </button>
      </div>

      {!query && (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={14} className="text-indigo-400" />
            <span className="text-xs font-semibold text-white">Try asking</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED.map((s) => (
              <button key={s} onClick={() => { setQuery(s); }} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/40 hover:text-white/70 transition-colors">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {aiAnswer && (
        <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-xs font-semibold text-white">AI Documentation Assistant™</span>
          </div>
          <p className="text-sm text-white/80 mb-3 leading-relaxed">{aiAnswer.answer}</p>
          {aiAnswer.related?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {aiAnswer.related.map((r) => {
                const mod = MODULES.find((m) => m.name === r);
                return (
                  <button key={r} onClick={() => mod && onSelectModule?.(mod.id)} className="px-2 py-1 bg-indigo-500/15 border border-indigo-500/30 rounded text-[11px] text-indigo-300 hover:bg-indigo-500/25 transition-colors">
                    {r}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {query && (
        <div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">{results.length} instant matches</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {results.map((r) => (
              <Row key={`${r.type}-${r.id}`} onClick={() => r.type === 'module' && onSelectModule?.(r.id)}>
                <div className="flex items-center gap-2 mb-1">
                  <Badge color={TYPE_COLORS[r.type]}>{r.type}</Badge>
                  <span className="text-xs font-semibold text-white">{r.name}</span>
                </div>
                <div className="text-[10px] text-white/40">{r.desc}</div>
                {r.type === 'module' && <div className="text-[10px] text-indigo-400 mt-1">Open →</div>}
              </Row>
            ))}
          </div>
          {results.length === 0 && <EmptyState text="No instant matches — try Ask AI for natural language answers." />}
        </div>
      )}
    </SectionShell>
  );
}