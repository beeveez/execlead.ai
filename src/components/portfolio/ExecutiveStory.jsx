import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Edit3, Check, RotateCcw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PortfolioSection from './PortfolioSection';

export default function ExecutiveStory({ user, data }) {
  const [story, setStory] = useState(user?.data?.executive_story || '');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => { setStory(user?.data?.executive_story || ''); }, [user]);

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Write "My Leadership Story" — a compelling first-person executive narrative (3-4 paragraphs) for ${user?.full_name || 'an executive'}. They are a ${user?.data?.current_role || 'leader'}${user?.data?.organization ? ` at ${user.data.organization}` : ''} with ${data.achievementsCount || 0} achievements, ${data.certificatesCount || 0} certifications, ${data.simulationsCount || 0} simulations, and ${data.lessonsCount || 0} lessons completed. Weave together their career journey, leadership growth, key milestones, and future aspirations. Make it authentic, inspiring, and professional. Write in first person.`,
      });
      setStory(res);
      setDraft(res);
      await base44.auth.updateMe({ executive_story: res });
      setEditing(false);
    } catch (err) { console.error('Story generation failed:', err); }
    finally { setGenerating(false); }
  };

  const save = async () => {
    setStory(draft);
    await base44.auth.updateMe({ executive_story: draft });
    setEditing(false);
  };

  return (
    <PortfolioSection id="story" title="Executive Story™" icon={BookOpen} color="#f59e0b"
      action={story && <button onClick={generate} disabled={generating} className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300"><RotateCcw size={10} /> {generating ? '...' : 'Regenerate'}</button>}>
      {editing ? (
        <div className="space-y-2">
          <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={8}
            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-xs text-white/70 focus:outline-none focus:border-amber-500/30" />
          <div className="flex gap-2">
            <button onClick={save} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs"><Check size={12} /> Save</button>
            <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs">Cancel</button>
          </div>
        </div>
      ) : story ? (
        <div>
          <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap">{story}</p>
          <button onClick={() => { setDraft(story); setEditing(true); }} className="flex items-center gap-1 mt-2 text-[10px] text-white/30 hover:text-white/60"><Edit3 size={10} /> Edit Story</button>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-xs text-white/30 mb-2">Generate your AI-powered leadership narrative.</p>
          <button onClick={generate} disabled={generating} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs hover:bg-amber-500/20 disabled:opacity-50">
            <Sparkles size={12} /> {generating ? 'Writing your story...' : 'Generate Executive Story™'}
          </button>
        </div>
      )}
    </PortfolioSection>
  );
}