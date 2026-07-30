import React, { useState } from 'react';
import { Lightbulb, Send, Loader2, Sparkles } from 'lucide-react';
import { SectionShell, Badge } from './Shared';
import { computeTwinSnapshot } from '@/lib/platformDigitalTwin';
import { base44 } from '@/api/base44Client';

const CATEGORIES = ['New executive module', 'New AI engine', 'New enterprise product', 'New commercial opportunity', 'Workflow automation', 'AI coaching improvement', 'Leadership intelligence', 'Decision intelligence', 'Governance enhancement'];

export default function InnovationLab() {
  const twin = computeTwinSnapshot();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const modDigest = twin.graph.nodes.filter((n) => n.type === 'module').map((m) => m.label).join(', ');
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the Innovation Lab™ of EXECLEAD.AI's Platform Digital Twin. Existing modules: ${modDigest}.\nGenerate 3 concrete, novel innovation ideas in the category "${category}". For each idea output JSON with fields: title, problem, solution, businessValue (0-100), engineeringEffort (hours), strategicAlignment (0-100), marketDifferentiation (short text), estimatedROI (text), confidence (0-100). Be specific to EXECLEAD.AI's executive leadership platform. Return a JSON array.`,
        response_json_schema: { type: 'object', properties: { ideas: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, problem: { type: 'string' }, solution: { type: 'string' }, businessValue: { type: 'number' }, engineeringEffort: { type: 'number' }, strategicAlignment: { type: 'number' }, marketDifferentiation: { type: 'string' }, estimatedROI: { type: 'string' }, confidence: { type: 'number' } } } } } },
      });
      setIdeas(res.ideas || []);
    } catch (e) { setIdeas([{ title: 'Generation failed', problem: e.message, solution: 'Retry', businessValue: 0, engineeringEffort: 0, strategicAlignment: 0, marketDifferentiation: '', estimatedROI: '—', confidence: 0 }]); }
    setLoading(false);
  };

  return (
    <SectionShell title="Innovation Lab™" subtitle="AI generates novel platform, product, and capability ideas grounded in the registry" icon={Lightbulb}
      actions={<div className="flex gap-2"><select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white">{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select><button onClick={generate} disabled={loading} className="flex items-center gap-1 px-3 py-1 bg-indigo-500/15 text-indigo-300 rounded-lg text-xs font-medium hover:bg-indigo-500/25 disabled:opacity-50">{loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Generate</button></div>}>
      {ideas.length === 0 && !loading && <div className="text-center py-12"><Lightbulb size={32} className="text-white/20 mx-auto mb-2" /><p className="text-xs text-white/40">Select a category and generate AI-powered innovation ideas.</p></div>}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {ideas.map((idea, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-2">
            <Badge color="violet">{category}</Badge>
            <h3 className="text-sm font-bold text-white">{idea.title}</h3>
            <p className="text-[11px] text-white/50"><span className="text-white/30">Problem:</span> {idea.problem}</p>
            <p className="text-[11px] text-white/50"><span className="text-white/30">Solution:</span> {idea.solution}</p>
            <div className="grid grid-cols-2 gap-1 text-center pt-1">
              <div className="bg-white/[0.02] rounded-lg py-1"><div className="text-[9px] text-white/40">Value</div><div className="text-xs font-bold text-white">{idea.businessValue}</div></div>
              <div className="bg-white/[0.02] rounded-lg py-1"><div className="text-[9px] text-white/40">Effort</div><div className="text-xs font-bold text-white">{idea.engineeringEffort}h</div></div>
              <div className="bg-white/[0.02] rounded-lg py-1"><div className="text-[9px] text-white/40">Align</div><div className="text-xs font-bold text-white">{idea.strategicAlignment}</div></div>
              <div className="bg-white/[0.02] rounded-lg py-1"><div className="text-[9px] text-white/40">Confidence</div><div className="text-xs font-bold text-white">{idea.confidence}</div></div>
            </div>
            <p className="text-[10px] text-white/40">🎯 {idea.marketDifferentiation}</p>
            <p className="text-[10px] text-amber-400">💰 {idea.estimatedROI}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}