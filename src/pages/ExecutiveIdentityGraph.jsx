import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import {
  loadLatestIdentity, loadAllVersions, synthesizeIdentity, computeIdentityHealth, persistIdentity,
} from '@/lib/executiveIdentityGraphEngine';
import { generatePresentation, generateBrand, IDENTITY_AUDIENCES } from '@/lib/executiveIdentityPresentations';
import { loadLatestStory } from '@/lib/executiveStoryIntelligence';
import {
  Fingerprint, Loader2, Copy, Sparkles, ShieldCheck, FileText, RefreshCw, ArrowRight,
} from 'lucide-react';
import IdentityTrustCenter from '@/components/executive-identity/IdentityTrustCenter';
import IdentityIntelligencePanel from '@/components/executive-identity/IdentityIntelligencePanel';
import IdentityEvolutionTimeline from '@/components/executive-identity/IdentityEvolutionTimeline';
import IdentityAnalytics from '@/components/executive-identity/IdentityAnalytics';
import IdentityExplainability from '@/components/executive-identity/IdentityExplainability';

const SOURCE_BADGE = {
  verified: { label: 'Verified', cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  ai_assisted: { label: 'AI Assisted', cls: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  ai_generated: { label: 'AI Generated', cls: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25' },
};
const safeJSON = (s, f) => { try { return s ? JSON.parse(s) : f; } catch { return f; } };

const TABS = [
  { id: 'trust', label: 'Trust Center' },
  { id: 'identity', label: 'Identity Sections' },
  { id: 'intelligence', label: 'Intelligence' },
  { id: 'evolution', label: 'Evolution' },
  { id: 'brand', label: 'Brand & Exports' },
];

function Section({ title, value, source }) {
  const badge = SOURCE_BADGE[source] || SOURCE_BADGE.ai_generated;
  return (
    <div className="bg-white/[0.02] border border-white/8 rounded-xl p-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] uppercase tracking-wider text-white/40">{title}</span>
        <span className={`px-2 py-0.5 rounded border text-[9px] font-medium ${badge.cls}`}>{badge.label}</span>
      </div>
      <div className="text-sm text-white/80 leading-relaxed">{value || '—'}</div>
    </div>
  );
}

export default function ExecutiveIdentityGraph() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [identity, setIdentity] = useState(null);
  const [versions, setVersions] = useState([]);
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [tab, setTab] = useState('trust');

  const [brand, setBrand] = useState(null);
  const [brandLoading, setBrandLoading] = useState(false);
  const [audience, setAudience] = useState('linkedin_about');
  const [presentation, setPresentation] = useState(null);
  const [presLoading, setPresLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const [latest, all, s] = await Promise.all([loadLatestIdentity(user.id), loadAllVersions(user.id), loadLatestStory(user.id)]);
    setIdentity(latest);
    setVersions(all);
    setStory(s);
    if (latest?.brand_json) setBrand(safeJSON(latest.brand_json, null));
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const health = identity ? computeIdentityHealth(identity) : null;
  const sources = identity ? safeJSON(identity.source_verification_json, {}) : {};

  const handleGenerate = async () => {
    if (!story) { toast({ title: 'Generate a Success Story first', variant: 'destructive' }); return; }
    setCreating(true);
    try {
      const data = synthesizeIdentity(story, user);
      await persistIdentity(user, data, identity);
      toast({ title: 'Executive Identity Graph™ synced' });
      await load();
    } catch (e) {
      toast({ title: 'Sync failed', description: e.message, variant: 'destructive' });
    } finally { setCreating(false); }
  };

  const handleBrand = async () => {
    if (!identity) return;
    setBrandLoading(true);
    try {
      const b = await generateBrand(identity);
      setBrand(b);
      await base44.entities.ExecutiveIdentity.update(identity.id, { brand_json: JSON.stringify(b), last_updated: new Date().toISOString() });
      toast({ title: 'Executive Brand generated' });
      await load();
    } catch (e) {
      toast({ title: 'Brand generation failed', description: e.message, variant: 'destructive' });
    } finally { setBrandLoading(false); }
  };

  const handlePresentation = async () => {
    if (!identity) return;
    setPresLoading(true);
    try {
      setPresentation(await generatePresentation(identity, audience));
    } catch (e) {
      toast({ title: 'Generation failed', description: e.message, variant: 'destructive' });
    } finally { setPresLoading(false); }
  };

  const copy = (text) => { navigator.clipboard?.writeText(text); toast({ title: 'Copied' }); };

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={26} className="animate-spin text-accent-orange" /></div>;

  if (!identity) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-accent-orange/10 flex items-center justify-center mx-auto mb-4"><Fingerprint size={24} className="text-accent-orange" /></div>
        <h2 className="text-lg font-semibold text-white mb-2">Build your Executive Identity Graph™</h2>
        <p className="text-sm text-white/50 mb-6 max-w-md mx-auto">
          {story ? 'Synthesize your canonical identity from your latest Executive Success Story — one verified identity powering every professional profile.' : 'Generate an Executive Success Story first, then synthesize your canonical identity from it.'}
        </p>
        {story ? (
          <button onClick={handleGenerate} disabled={creating} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-white text-sm font-semibold transition-colors disabled:opacity-50">
            {creating ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />} Build Identity Graph
          </button>
        ) : (
          <Link to="/executive-success-stories" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-white text-sm font-semibold transition-colors">
            <FileText size={15} /> Go to Success Stories <ArrowRight size={14} />
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6 lg:py-10">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-accent-orange/15 flex items-center justify-center"><Fingerprint size={22} className="text-accent-orange" /></div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">Executive Identity Operating System™</h1>
            <p className="text-sm text-white/50">One verified identity · continuously synchronized · many professional experiences.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-white/40">v{identity.version} · {identity.evidence_count || 0} evidence</span>
          <button onClick={handleGenerate} disabled={creating} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition-colors disabled:opacity-50">
            {creating ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Sync
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${tab === t.id ? 'bg-accent-orange text-white' : 'bg-white/5 text-white/50 hover:text-white'}`}>{t.label}</button>
        ))}
      </div>

      {tab === 'trust' && <IdentityTrustCenter identity={identity} health={health} />}
      {tab === 'identity' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <Section title="Professional Headline" value={identity.professional_headline} source={sources.professional_headline} />
          <Section title="Executive Summary" value={identity.executive_summary} source={sources.executive_summary} />
          <Section title="Core Value Proposition" value={identity.core_value_proposition} source={sources.core_value_proposition} />
          <Section title="Leadership Philosophy" value={identity.leadership_philosophy} source={sources.leadership_philosophy} />
          <Section title="Executive Brand Statement" value={identity.executive_brand_statement || (brand ? brand.tagline : '')} source={sources.executive_brand_statement} />
          <Section title="Top Competencies" value={(identity.top_competencies || []).join(', ')} source={sources.top_competencies} />
          <Section title="Leadership Strengths" value={(identity.leadership_strengths || []).join(', ')} source={sources.leadership_strengths} />
          <Section title="Executive Differentiators" value={(identity.executive_differentiators || []).map((d) => `• ${d}`).join('  ')} source={sources.executive_differentiators} />
          <div className="lg:col-span-2"><IdentityExplainability identity={identity} /></div>
        </div>
      )}
      {tab === 'intelligence' && (
        <div className="space-y-4">
          <IdentityIntelligencePanel identity={identity} />
        </div>
      )}
      {tab === 'evolution' && (
        <div className="space-y-4">
          <IdentityEvolutionTimeline versions={versions} />
          <IdentityAnalytics identity={identity} versions={versions} />
        </div>
      )}
      {tab === 'brand' && (
        <div className="space-y-4">
          {/* Executive Brand Engine */}
          <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><Sparkles size={16} className="text-accent-orange" /><h2 className="text-sm font-semibold text-white">Executive Brand Engine™</h2></div>
              <button onClick={handleBrand} disabled={brandLoading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-orange hover:bg-accent-orange/90 text-white text-xs font-semibold transition-colors disabled:opacity-50">
                {brandLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} {brand ? 'Regenerate' : 'Generate Brand'}
              </button>
            </div>
            {brand && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[['Tagline', brand.tagline], ['Value Proposition', brand.value_proposition], ['Mission', brand.mission], ['Positioning', brand.positioning], ['Signature Intro', brand.signature_intro], ['Elevator Pitch', brand.elevator_pitch]].map(([k, v]) => (
                  <div key={k} className="bg-white/[0.03] border border-white/8 rounded-xl p-3">
                    <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">{k}</div>
                    <div className="text-xs text-white/75 leading-relaxed">{v || '—'}</div>
                  </div>
                ))}
                <div className="bg-white/[0.03] border border-white/8 rounded-xl p-3 md:col-span-2">
                  <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Brand Keywords</div>
                  <div className="flex flex-wrap gap-1.5">{(brand.keywords || []).map((k) => <span key={k} className="px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-[10px] text-indigo-300">{k}</span>)}</div>
                </div>
              </div>
            )}
          </div>

          {/* Identity Presentations / Exports */}
          <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3"><FileText size={16} className="text-accent-orange" /><h2 className="text-sm font-semibold text-white">Identity Exports — generated from one identity</h2></div>
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <select value={audience} onChange={(e) => setAudience(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent-orange/40">
                {IDENTITY_AUDIENCES.map((a) => <option key={a.id} value={a.id} className="bg-[#0d0d14]">{a.label}</option>)}
              </select>
              <button onClick={handlePresentation} disabled={presLoading} className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-accent-orange hover:bg-accent-orange/90 text-white text-sm font-semibold transition-colors disabled:opacity-50">
                {presLoading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />} Generate
              </button>
            </div>
            {presentation && (
              <div className="relative bg-white/[0.03] border border-white/10 rounded-xl p-4">
                <button onClick={() => copy(presentation.text)} className="absolute top-3 right-3 text-white/40 hover:text-white"><Copy size={14} /></button>
                <div className="text-xs text-white/30 mb-2">Source: {presentation.source} · Confidence {presentation.confidence}%</div>
                <div className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap pr-8">{presentation.text}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}