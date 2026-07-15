import React, { useState } from 'react';
import { Lightbulb, Sparkles, TrendingUp, Target, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PortfolioSection from './PortfolioSection';

export default function ExecutiveInsights({ user, data }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this executive portfolio and provide insights as a JSON object with keys: progress (2-3 sentences on leadership progress), trends (2-3 sentences on growth trends), blind_spots (1-2 areas to improve), recommended_learning (2 specific recommendations), promotion_readiness (1-2 sentence assessment). Portfolio: ${user?.full_name}, ${data.achievementsCount || 0} achievements, ${data.certificatesCount || 0} certifications, ${data.simulationsCount || 0} simulations, ${data.journalCount || 0} journal entries, ${data.lessonsCount || 0} lessons completed, ${data.connectionsCount || 0} network connections.`,
        response_json_schema: { type: 'object', properties: {
          progress: { type: 'string' }, trends: { type: 'string' }, blind_spots: { type: 'string' },
          recommended_learning: { type: 'string' }, promotion_readiness: { type: 'string' },
        } },
      });
      setInsights(res);
    } catch (err) { console.error('Insights generation failed:', err); }
    finally { setLoading(false); }
  };

  return (
    <PortfolioSection id="insights" title="Executive Insights™" icon={Lightbulb} color="#f59e0b">
      {insights ? (
        <div className="space-y-3">
          <InsightItem icon={TrendingUp} color="#10b981" label="Leadership Progress" text={insights.progress} />
          <InsightItem icon={Sparkles} color="#6366f1" label="Growth Trends" text={insights.trends} />
          <InsightItem icon={AlertCircle} color="#f59e0b" label="Blind Spots" text={insights.blind_spots} />
          <InsightItem icon={Target} color="#3b82f6" label="Recommended Learning" text={insights.recommended_learning} />
          <InsightItem icon={Target} color="#ec4899" label="Promotion Readiness" text={insights.promotion_readiness} />
          <button onClick={generate} disabled={loading} className="text-[10px] text-amber-400 hover:text-amber-300">{loading ? 'Regenerating...' : '↻ Regenerate'}</button>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-xs text-white/30 mb-2">Generate AI-powered executive insights from your portfolio data.</p>
          <button onClick={generate} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs hover:bg-amber-500/20 disabled:opacity-50">
            <Sparkles size={12} /> {loading ? 'Analyzing...' : 'Generate Insights'}
          </button>
        </div>
      )}
    </PortfolioSection>
  );
}

function InsightItem({ icon: Icon, color, label, text }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
        <Icon size={11} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[9px] uppercase tracking-wider text-white/30">{label}</div>
        <p className="text-[11px] text-white/60 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}