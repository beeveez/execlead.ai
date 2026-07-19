import React, { useState } from 'react';
import { Sparkles, Loader2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function HardeningDomainAIInsight({ domain }) {
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState('');
  const [question, setQuestion] = useState('');

  const handleAsk = async () => {
    if (!question.trim()) return;
    setAsking(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a Platform Hardening Advisor. Answer this question about the ${domain.domainName} domain.

Current Score: ${domain.overallScore ?? 'Pending'}%
Target: ${domain.target}%
Status: ${domain.statusLabel}

Root Causes:
${domain.rootCauses.map(rc => `- ${rc.component} (${rc.severity}, -${rc.estimatedImpact}%): ${rc.detail}`).join('\n')}

Recommendations:
${domain.recommendations.map(r => `- ${r.action} (+${r.expectedIncrease}%, ${r.effort})`).join('\n')}

Question: ${question}

Provide a concise, executive-level answer grounded in the data above. Do not hallucinate metrics.`,
      });
      setAnswer(typeof res === 'string' ? res : JSON.stringify(res));
    } catch (e) {
      setAnswer('Unable to generate a response at this time.');
    }
    setAsking(false);
  };

  const insight = domain.aiInsight;

  return (
    <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/15 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-indigo-400" />
        <h4 className="text-indigo-400 text-sm font-semibold">AI Insight™</h4>
      </div>

      {/* Executive Summary */}
      <p className="text-white/60 text-sm leading-relaxed mb-4">{insight.executiveSummary}</p>

      {/* Priority Problems */}
      {insight.highestPriorityProblems.length > 0 && (
        <div className="mb-3">
          <div className="text-white/40 text-xs font-medium mb-1">Highest Priority Problems</div>
          <ul className="space-y-1">
            {insight.highestPriorityProblems.map((p, i) => (
              <li key={i} className="text-white/50 text-xs flex items-start gap-1.5">
                <span className="text-red-400/50 mt-0.5">●</span> {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Biggest Risk + Recovery */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-white/[0.02] rounded-lg p-2.5">
          <div className="text-white/30 text-[10px] mb-0.5">Biggest Risk</div>
          <div className="text-red-400 text-xs font-medium">{insight.biggestRisk}</div>
        </div>
        <div className="bg-white/[0.02] rounded-lg p-2.5">
          <div className="text-white/30 text-[10px] mb-0.5">Estimated Recovery</div>
          <div className="text-amber-400 text-xs font-medium">{insight.estimatedRecovery}</div>
        </div>
      </div>

      {/* Projected Score */}
      {insight.projectedScore !== null && (
        <div className="flex items-center gap-2 mb-3 text-xs">
          <span className="text-white/30">Projected Score:</span>
          <span className="text-emerald-400 font-medium">{insight.projectedScore}%</span>
          <span className="text-emerald-400/60">(+{insight.projectedScore - (domain.overallScore || 0)})</span>
        </div>
      )}

      {/* Ask AI */}
      <div className="border-t border-white/5 pt-3 mt-3">
        <div className="flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder="Ask about this domain..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40"
          />
          <button onClick={handleAsk} disabled={!question.trim() || asking} className="px-3 py-1.5 bg-indigo-500/15 border border-indigo-500/20 rounded-lg text-indigo-300 text-xs hover:bg-indigo-500/25 disabled:opacity-40">
            {asking ? <Loader2 size={12} className="animate-spin" /> : 'Ask'}
          </button>
        </div>
        {answer && (
          <div className="mt-2 bg-white/[0.02] border border-white/5 rounded-lg p-3 relative">
            <button onClick={() => setAnswer('')} className="absolute top-2 right-2 text-white/20 hover:text-white/50"><X size={12} /></button>
            <div className="text-white/60 text-xs leading-relaxed whitespace-pre-wrap pr-4">{answer}</div>
          </div>
        )}
      </div>
    </div>
  );
}