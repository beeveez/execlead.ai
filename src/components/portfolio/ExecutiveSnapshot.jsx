import React, { useState, useEffect } from 'react';
import { Sparkles, Edit3, Check, RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PortfolioSection from './PortfolioSection';

export default function ExecutiveSnapshot({ user, data }) {
  const [summary, setSummary] = useState(user?.data?.executive_summary || '');
  const [editing, setEditing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => { setSummary(user?.data?.executive_summary || ''); }, [user]);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Write a 2-3 sentence executive summary for ${user?.full_name || 'an executive'}, who is a ${user?.data?.current_role || 'leader'}${user?.data?.organization ? ` at ${user.data.organization}` : ''}. They have ${data.achievementsCount || 0} verified achievements, ${data.certificatesCount || 0} certifications, and ${data.simulationsCount || 0} executive simulations completed. Highlight their leadership strengths and executive capability. Write in third person, professional tone.`,
      });
      setSummary(res);
      setDraft(res);
      await base44.auth.updateMe({ executive_summary: res });
      setEditing(false);
    } catch (err) { console.error('Snapshot generation failed:', err); }
    finally { setGenerating(false); }
  };

  const save = async () => {
    setSummary(draft);
    await base44.auth.updateMe({ executive_summary: draft });
    setEditing(false);
  };

  return (
    <PortfolioSection id="snapshot" title="Executive Snapshot™" icon={Sparkles} color="#6366f1"
      action={<button onClick={generate} disabled={generating} className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 disabled:opacity-50">
        <RotateCcw size={10} /> {generating ? 'Generating...' : 'Regenerate'}
      </button>}>
      {editing ? (
        <div className="space-y-2">
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white/70 focus:outline-none focus:border-indigo-500/40" />
          <div className="flex gap-2">
            <button onClick={save} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs"><Check size={12} /> Save</button>
            <button onClick={() => { setEditing(false); setDraft(''); }} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs">Cancel</button>
          </div>
        </div>
      ) : summary ? (
        <div>
          <p className="text-sm text-white/60 leading-relaxed italic">"{summary}"</p>
          <button onClick={() => { setDraft(summary); setEditing(true); }} className="flex items-center gap-1 mt-2 text-[10px] text-white/30 hover:text-white/60">
            <Edit3 size={10} /> Edit
          </button>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-xs text-white/30 mb-2">No executive summary yet.</p>
          <button onClick={generate} disabled={generating} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs hover:bg-indigo-500/20">
            <Sparkles size={12} /> {generating ? 'Generating...' : 'Generate with EXEC™'}
          </button>
        </div>
      )}
    </PortfolioSection>
  );
}