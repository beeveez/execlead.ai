import React, { useState, useMemo } from 'react';
import { Sparkles, Loader2, AlertTriangle, FileSearch, TrendingDown, Copy, GitCompare, Upload, Lightbulb } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getRecommendedUploads, getAllIntelligenceInsights } from '@/lib/evidenceIntelligenceEngine';
import { EVIDENCE_TYPES, getEvidenceTypeMeta } from '@/lib/evidenceVaultEngine';

const TYPE_ICONS = { missing: FileSearch, weak: AlertTriangle, expired: TrendingDown, conflicting: GitCompare, duplicate: Copy };
const SEVERITY_COLORS = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#64748b' };

export default function EvidenceIntelligence({ evidenceItems, onRefresh }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);

  const insights = useMemo(() => getAllIntelligenceInsights(evidenceItems), [evidenceItems]);
  const recommendations = useMemo(() => getRecommendedUploads(evidenceItems), [evidenceItems]);

  const handleAnalyze = async () => {
    if (!evidenceItems || evidenceItems.length === 0) return;
    setAnalyzing(true);
    const fallbackSummary = `Evidence portfolio analysis: ${insights.length} issues found across ${evidenceItems.length} items. ${insights.filter(i => i.type === 'missing').length} missing types, ${insights.filter(i => i.type === 'weak').length} weak items, ${insights.filter(i => i.type === 'expired').length} expired items. Priority: ${recommendations[0]?.action || 'No immediate actions needed.'}`;
    setAiSummary(fallbackSummary);
    try {
      // Use LLM for deeper analysis
      const prompt = `Analyze this executive evidence portfolio and provide 3 actionable recommendations.

Total evidence items: ${evidenceItems.length}
Issues found: ${insights.length}
- Missing evidence types: ${insights.filter(i => i.type === 'missing').map(i => i.label).join(', ') || 'None'}
- Weak evidence (quality < 50): ${insights.filter(i => i.type === 'weak').map(i => i.label).join(', ') || 'None'}
- Expired evidence: ${insights.filter(i => i.type === 'expired').map(i => i.label).join(', ') || 'None'}
- Conflicting evidence: ${insights.filter(i => i.type === 'conflicting').length}
- Duplicate evidence: ${insights.filter(i => i.type === 'duplicate').length}

Provide a brief JSON response with: { summary: string, recommendations: [string] }`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            recommendations: { type: 'array', items: { type: 'string' } },
          },
        },
      });

      const result = typeof response === 'string' ? JSON.parse(response) : response;
      setAiSummary(result.summary);
    } catch (e) {
      setAiSummary(fallbackSummary);
    }
    setAnalyzing(false);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-violet-400" />
        <span className="text-sm font-bold text-white">Evidence Intelligence™</span>
        <span className="text-[10px] text-white/30 ml-auto">{insights.length} insight{insights.length !== 1 ? 's' : ''}</span>
        <button onClick={handleAnalyze} disabled={analyzing || !evidenceItems?.length} className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 text-violet-400 transition-colors disabled:opacity-40">
          {analyzing ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />} Analyze
        </button>
      </div>

      {/* AI Summary */}
      {aiSummary && (
        <div className="bg-violet-500/[0.03] border border-violet-500/15 rounded-xl p-3 mb-3">
          <div className="flex items-start gap-2">
            <Sparkles size={12} className="text-violet-400 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-white/60 leading-relaxed">{aiSummary}</p>
          </div>
        </div>
      )}

      {/* Priority Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/30 mb-2">
            <Lightbulb size={10} className="text-amber-400" /> Recommended Next Actions
          </div>
          <div className="space-y-1.5">
            {recommendations.slice(0, 5).map((rec, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold" style={{ backgroundColor: SEVERITY_COLORS[rec.severity] + '15', color: SEVERITY_COLORS[rec.severity] }}>{rec.priority}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-white/70 truncate">{rec.action}</div>
                  <div className="text-[9px] text-white/30">{rec.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Insights */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 max-h-[400px] overflow-y-auto">
        {insights.length === 0 ? (
          <div className="text-center py-4">
            <Sparkles size={24} className="text-white/10 mx-auto mb-2" />
            <p className="text-xs text-white/30">No issues detected — your evidence portfolio looks healthy.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {insights.map((insight, idx) => {
              const InsightIcon = TYPE_ICONS[insight.type] || AlertTriangle;
              const color = insight.color || SEVERITY_COLORS[insight.severity];
              return (
                <div key={idx} className="flex items-start gap-2 text-[11px] py-1.5 border-b border-white/[0.03] last:border-b-0">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '15' }}>
                    <InsightIcon size={11} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white/70 font-medium truncate">{insight.label}</span>
                      <span className="text-[8px] uppercase px-1 py-0.5 rounded" style={{ backgroundColor: color + '15', color }}>{insight.type}</span>
                    </div>
                    <div className="text-[10px] text-white/30 mt-0.5">{insight.message}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">{insight.recommendation}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}