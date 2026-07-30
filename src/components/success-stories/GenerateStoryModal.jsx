import React, { useState } from 'react';
import { X, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { createSuccessStory } from '@/lib/executiveSuccessStoryEngine';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export default function GenerateStoryModal({ open, onClose, onGenerated }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [visibility, setVisibility] = useState('private');
  const [targetRole, setTargetRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const story = await createSuccessStory(user, {
        visibility,
        target_role: targetRole,
        industry,
        anonymous: visibility === 'anonymous',
      });
      toast({ title: 'Executive Success Story generated', description: 'Your leadership journey has been captured.' });
      onGenerated?.(story);
      onClose();
    } catch (e) {
      toast({ title: 'Generation failed', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent-orange/40';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-[#0d0d14] border border-white/10 rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-accent-orange/15 flex items-center justify-center">
              <Sparkles size={18} className="text-accent-orange" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Generate Success Story</h2>
              <p className="text-[11px] text-white/40">AI Story Generator™ from your verified evidence</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] text-white/50 mb-1.5 block">Target Executive Role</label>
            <input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Director of IT, CIO" className={inputCls} />
          </div>
          <div>
            <label className="text-[11px] text-white/50 mb-1.5 block">Industry</label>
            <input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Financial Services, Healthcare" className={inputCls} />
          </div>
          <div>
            <label className="text-[11px] text-white/50 mb-1.5 block">Visibility & Consent</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: 'private', l: 'Private', d: 'Only you' },
                { v: 'anonymous', l: 'Anonymous', d: 'Public, no name' },
                { v: 'named', l: 'Named', d: 'Public, with name' },
              ].map((o) => (
                <button
                  key={o.v}
                  onClick={() => setVisibility(o.v)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    visibility === o.v ? 'bg-accent-orange/10 border-accent-orange/30' : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="text-xs font-semibold text-white">{o.l}</div>
                  <div className="text-[10px] text-white/40 mt-0.5">{o.d}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-2 bg-white/[0.02] border border-white/8 rounded-lg p-3">
            <ShieldCheck size={14} className="text-emerald-400 mt-0.5 shrink-0" />
            <p className="text-[11px] text-white/50 leading-relaxed">
              Your story is generated only from your verified platform evidence. Nothing is published without your explicit consent. You can change visibility or revoke consent at any time.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors">Cancel</button>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-accent-orange hover:bg-accent-orange/90 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? <><Loader2 size={15} className="animate-spin" /> Generating…</> : <><Sparkles size={15} /> Generate Story</>}
          </button>
        </div>
      </div>
    </div>
  );
}