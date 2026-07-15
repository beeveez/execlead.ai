import React, { useState } from 'react';
import { Sparkles, Lightbulb } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getRecommendedCredentials, getLevelMeta, getTypeMeta } from '@/lib/credentialEngine';

export default function CredentialAdvisor({ data, credentials }) {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState(null);
  const recommended = getRecommendedCredentials(credentials, data);

  const getAdvice = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI Credential Advisor for EXECLEAD.AI. A user has ${credentials.length} earned credentials, ${(data.achievementsCount || 0)} achievements, ${(data.simulationsCount || 0)} simulations, ${(data.lessonsCount || 0)} lessons, ${(data.evidenceCount || 0)} evidence items, and ${(data.verificationsCount || 0)} verifications. Their top in-progress credentials are: ${recommended.map(r => `${r.name} (${r.evaluation.progress}% complete, missing: ${r.evaluation.unmet.map(u => u.label).join(', ')})`).join('; ')}. Recommend the SINGLE best next credential to pursue, explain why, and list 3 specific actions to complete the missing requirements. Keep it concise (max 150 words).`,
        response_json_schema: { type: 'object', properties: { credential: { type: 'string' }, reason: { type: 'string' }, actions: { type: 'array', items: { type: 'string' } } } },
      });
      setAdvice(res);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      <div className="bg-gradient-to-r from-indigo-500/10 to-transparent border border-indigo-500/15 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-indigo-400" />
          <span className="text-sm font-bold text-white">AI Credential Advisor™</span>
        </div>
        {recommended.length > 0 && !advice && (
          <div className="space-y-1.5 mb-3">
            <span className="text-[10px] text-white/30 uppercase tracking-wider">Top Recommendations</span>
            {recommended.map(r => {
              const level = getLevelMeta(r.level);
              return (
                <div key={r.key} className="flex items-center justify-between bg-white/[0.02] rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: level.color }} />
                    <span className="text-xs text-white/70">{r.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1 rounded-full bg-white/5"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${r.evaluation.progress}%` }} /></div>
                    <span className="text-[10px] text-white/40">{r.evaluation.progress}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {advice && (
          <div className="space-y-2 mb-3">
            <div className="text-xs text-white/70"><span className="text-indigo-400 font-medium">Recommended:</span> {advice.credential}</div>
            <div className="text-xs text-white/50">{advice.reason}</div>
            {advice.actions && (
              <ul className="space-y-1">
                {advice.actions.map((a, i) => <li key={i} className="text-xs text-white/40 flex items-start gap-1.5"><Lightbulb size={10} className="text-amber-400 mt-0.5 flex-shrink-0" /> {a}</li>)}
              </ul>
            )}
          </div>
        )}
        <button onClick={getAdvice} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs hover:bg-indigo-500/20 disabled:opacity-50">
          <Sparkles size={12} /> {loading ? 'Analyzing...' : advice ? 'Refresh Recommendation' : 'Get AI Recommendation'}
        </button>
      </div>
    </div>
  );
}