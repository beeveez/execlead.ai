import React, { useState } from 'react';
import { SectionShell, Badge } from '@/components/platform-knowledge/PKShared';
import { askChiefArchitect, SUGGESTED_QUESTIONS } from '@/lib/platformIntelligenceEngine/index';
import { Bot, Send, Loader2, Sparkles } from 'lucide-react';

export default function ExecutiveArchitectureAdvisor() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);

  const ask = async (q) => {
    const query = q || question;
    if (!query.trim() || loading) return;
    setQuestion(query);
    setLoading(true);
    setAnswer(null);
    try {
      const res = await askChiefArchitect(query);
      setAnswer(res);
    } catch (e) {
      setAnswer({ answer: 'The advisor encountered an issue. Please try again.', related: [], recommendations: [] });
    }
    setLoading(false);
  };

  return (
    <SectionShell title="Executive Architecture Advisor™" subtitle="Ask the AI Chief Architect anything — answers are grounded in the platform registry, ADRs, and dependency graph" icon={Bot}>
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
        <div className="flex gap-2 mb-3">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && ask()}
            placeholder="Ask the Chief Architect..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40"
          />
          <button onClick={() => ask()} disabled={!question.trim() || loading}
            className="px-4 py-2.5 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center gap-2">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Ask
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button key={q} onClick={() => ask(q)} disabled={loading}
              className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-[11px] text-white/50 hover:text-white/80 transition-colors disabled:opacity-40">
              {q}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 gap-2">
          <Loader2 size={18} className="animate-spin text-indigo-400" />
          <span className="text-sm text-white/40">The Chief Architect is consulting the registry...</span>
        </div>
      )}

      {answer && !loading && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Bot size={15} className="text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Chief Architect</span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">{answer.answer}</p>
          </div>
          {answer.recommendations?.length > 0 && (
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2"><Sparkles size={13} className="text-amber-400" /><h3 className="text-xs font-semibold text-white">Prioritized Recommendations</h3></div>
              <div className="space-y-1.5">
                {answer.recommendations.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-[12px] text-white/70"><span className="text-amber-400 mt-0.5">{i + 1}.</span><span>{r}</span></div>
                ))}
              </div>
            </div>
          )}
          {answer.related?.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-white/40">Related:</span>
              {answer.related.map((m) => (
                <Badge key={m} color="#6366f1">{m}</Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </SectionShell>
  );
}