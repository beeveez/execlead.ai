import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  loadLatestStory, loadAllVersions, buildStoryContext, storyConfidence,
  detectVersionTriggers,
} from '@/lib/executiveStoryIntelligence';
import { generateBio, BIO_FORMATS, formatExplainability } from '@/lib/executiveBioGenerator';
import {
  createSuccessStory, gatherMemberJourney, computeMetrics, safeParse,
} from '@/lib/executiveSuccessStoryEngine';
import {
  Sparkles, BookOpen, Loader2, Copy, Trophy, TrendingUp, Target, Activity,
  Award, BarChart3, GitCompare, RefreshCw, ArrowRight, FileText, Clock, ShieldCheck,
} from 'lucide-react';

function Card({ icon: Icon, label, value, sub, tone }) {
  const c = tone === 'amber' ? 'text-amber-400' : tone === 'emerald' ? 'text-emerald-400' : 'text-white';
  return (
    <div className="bg-white/[0.02] border border-white/8 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-wider text-white/40">{label}</span>
        <Icon size={15} className={c} />
      </div>
      <div className={`text-xl font-bold ${c} leading-tight`}>{value}</div>
      {sub && <div className="text-[10px] text-white/40 mt-1">{sub}</div>}
    </div>
  );
}

export default function ExecutiveStoryIntelligence() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [story, setStory] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggers, setTriggers] = useState([]);

  const [bioFormat, setBioFormat] = useState('bio_100');
  const [bioResult, setBioResult] = useState(null);
  const [bioLoading, setBioLoading] = useState(false);

  const [creating, setCreating] = useState(false);
  const [compareA, setCompareA] = useState('');
  const [compareB, setCompareB] = useState('');

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const [latest, all] = await Promise.all([loadLatestStory(user.id), loadAllVersions(user.id)]);
    setStory(latest);
    setVersions(all);
    setLoading(false);
    // Smart regeneration check
    if (latest) {
      try {
        const data = await gatherMemberJourney();
        const fresh = computeMetrics(data);
        setTriggers(detectVersionTriggers(latest, fresh));
      } catch { setTriggers([]); }
    }
    if (all.length >= 2) { setCompareA(all[0].id); setCompareB(all[1].id); }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const ctx = story ? buildStoryContext(story) : null;

  const handleGenerateBio = async () => {
    if (!story) return;
    setBioLoading(true);
    try {
      const result = await generateBio(story, bioFormat);
      setBioResult(result);
      toast({ title: `${result.format} generated` });
    } catch (e) {
      toast({ title: 'Generation failed', description: e.message, variant: 'destructive' });
    } finally {
      setBioLoading(false);
    }
  };

  const handleNewVersion = async () => {
    setCreating(true);
    try {
      const nextVersion = `${versions.length + 1}.0`;
      await createSuccessStory(user, {
        visibility: story?.visibility || 'private',
        target_role: story?.target_role || '',
        industry: story?.industry || '',
        anonymous: story?.visibility === 'anonymous',
        version: nextVersion,
      });
      toast({ title: `Success Story v${nextVersion} created` });
      await load();
    } catch (e) {
      toast({ title: 'Version creation failed', description: e.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const copy = (text) => {
    navigator.clipboard?.writeText(text);
    toast({ title: 'Copied to clipboard' });
  };

  if (loading) {
    return <div className="flex items-center justify-center py-32"><Loader2 size={26} className="animate-spin text-accent-orange" /></div>;
  }

  if (!story) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-accent-orange/10 flex items-center justify-center mx-auto mb-4"><Sparkles size={24} className="text-accent-orange" /></div>
        <h2 className="text-lg font-semibold text-white mb-2">No Executive Success Story yet</h2>
        <p className="text-sm text-white/50 mb-6 max-w-md mx-auto">Generate your first Success Story to unlock Executive Story Intelligence™ — biographies, LinkedIn sections, and executive profiles grounded in your verified evidence.</p>
        <Link to="/executive-success-stories" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-white text-sm font-semibold transition-colors">
          <BookOpen size={15} /> Go to Success Stories <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  const a = versions.find((v) => v.id === compareA);
  const b = versions.find((v) => v.id === compareB);
  const parseMetrics = (s) => safeParse(s?.metrics_snapshot_json, { counts: {} });

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-6 py-6 lg:py-10">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-accent-orange/15 flex items-center justify-center"><Sparkles size={22} className="text-accent-orange" /></div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">Executive Story Intelligence™</h1>
            <p className="text-sm text-white/50">Your living professional identity — grounded in verified evidence.</p>
          </div>
        </div>
        <Link to="/executive-success-stories" className="text-xs text-white/50 hover:text-white">← All Success Stories</Link>
      </div>

      {/* Smart regeneration banner */}
      {triggers.length > 0 && (
        <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-xl p-4 mb-6 flex items-center gap-3">
          <RefreshCw size={16} className="text-amber-400" />
          <div className="flex-1 text-sm text-white/70">
            New version recommended — detected: <span className="text-amber-400 font-medium">{triggers.join(', ').replace(/_/g, ' ')}</span>
          </div>
          <button onClick={handleNewVersion} disabled={creating} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-400 text-xs font-semibold hover:bg-amber-500/25 transition-colors disabled:opacity-50">
            {creating ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Create New Version
          </button>
        </div>
      )}

      {/* Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Card icon={FileText} label="Story Version" value={`v${ctx.version}`} sub={story.visibility} />
        <Card icon={ShieldCheck} label="Story Confidence" value={`${ctx.storyConfidence}%`} tone="emerald" sub="Evidence-based" />
        <Card icon={BarChart3} label="Evidence Count" value={ctx.evidenceCount} sub="Verified records" />
        <Card icon={Clock} label="Last Updated" value={new Date(story.generated_date).toLocaleDateString()} />
        <Card icon={Trophy} label="Biggest Breakthrough" value={ctx.aiInsights.biggest_breakthrough || '—'} tone="amber" />
        <Card icon={Activity} label="Current Leadership Theme" value={ctx.journeyStage || ctx.topCompetencies[0] || '—'} />
        <Card icon={Target} label="Next Milestone" value={ctx.aiInsights.predicted_next_milestone || '—'} />
        <Card icon={TrendingUp} label="Top Recommendation" value={ctx.aiInsights.most_effective_recommendation || '—'} />
      </div>

      {/* Executive Bio Generator */}
      <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={16} className="text-accent-orange" />
          <h2 className="text-base font-semibold text-white">Executive Bio Generator™</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <select value={bioFormat} onChange={(e) => setBioFormat(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-accent-orange/40">
            {BIO_FORMATS.map((f) => <option key={f.id} value={f.id} className="bg-[#0d0d14]">{f.label}</option>)}
          </select>
          <button onClick={handleGenerateBio} disabled={bioLoading} className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-accent-orange hover:bg-accent-orange/90 text-white text-sm font-semibold transition-colors disabled:opacity-50">
            {bioLoading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />} Generate
          </button>
        </div>
        {bioResult && (
          <div className="space-y-3">
            <div className="relative bg-white/[0.03] border border-white/10 rounded-xl p-4">
              <button onClick={() => copy(bioResult.text)} className="absolute top-3 right-3 text-white/40 hover:text-white"><Copy size={14} /></button>
              <div className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap pr-8">{bioResult.text}</div>
            </div>
            <div className="bg-white/[0.02] border border-white/8 rounded-xl p-4">
              <div className="text-[10px] uppercase tracking-wider text-accent-orange/80 mb-2">Executive Story Explainability™</div>
              <pre className="text-[11px] text-white/60 whitespace-pre-wrap font-sans leading-relaxed">{formatExplainability(bioResult.explainability)}</pre>
            </div>
          </div>
        )}
      </div>

      {/* Versioning */}
      <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5 mb-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <GitCompare size={16} className="text-accent-orange" />
            <h2 className="text-base font-semibold text-white">Story Versions ({versions.length})</h2>
          </div>
          <button onClick={handleNewVersion} disabled={creating} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition-colors disabled:opacity-50">
            {creating ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Create New Version
          </button>
        </div>

        {versions.length >= 2 && a && b && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {[
              { label: 'Compare A', v: a, set: setCompareA, list: versions },
              { label: 'Compare B', v: b, set: setCompareB, list: versions },
            ].map((col) => (
              <div key={col.label}>
                <div className="text-[10px] text-white/40 mb-1">{col.label}</div>
                <select value={col.label === 'Compare A' ? compareA : compareB} onChange={(e) => col.set(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-orange/40">
                  {col.list.map((vv) => <option key={vv.id} value={vv.id} className="bg-[#0d0d14]">v{vv.version} · {new Date(vv.generated_date).toLocaleDateString()}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}

        {versions.length >= 2 && a && b && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/8 text-white/40">
                  <th className="text-left px-3 py-2 font-medium">Metric</th>
                  <th className="text-left px-3 py-2 font-medium">v{a.version}</th>
                  <th className="text-left px-3 py-2 font-medium">v{b.version}</th>
                  <th className="text-left px-3 py-2 font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const ma = parseMetrics(a), mb = parseMetrics(b);
                  const rows = [
                    ['Readiness', ma.readinessCurrent, mb.readinessCurrent],
                    ['Evidence', ma.counts?.evidence, mb.counts?.evidence],
                    ['Simulations', ma.counts?.simulations, mb.counts?.simulations],
                    ['Decision Labs', ma.counts?.decisionLabs, mb.counts?.decisionLabs],
                    ['Achievements', (a.achievements||[]).length, (b.achievements||[]).length],
                    ['Outcomes', ma.counts?.outcomes, mb.counts?.outcomes],
                  ];
                  return rows.map(([label, x, y]) => {
                    const diff = (y || 0) - (x || 0);
                    return (
                      <tr key={label} className="border-b border-white/5 last:border-0">
                        <td className="px-3 py-2 text-white/70">{label}</td>
                        <td className="px-3 py-2 text-white/50">{x ?? '—'}</td>
                        <td className="px-3 py-2 text-white/50">{y ?? '—'}</td>
                        <td className={`px-3 py-2 ${diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-rose-400' : 'text-white/30'}`}>{diff > 0 ? `+${diff}` : diff < 0 ? diff : '—'}</td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Narrative */}
      <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Award size={16} className="text-accent-orange" />
          <h2 className="text-base font-semibold text-white">{story.title}</h2>
        </div>
        <p className="text-sm text-white/60 leading-relaxed mb-3">{story.summary}</p>
        <Link to={`/executive-success-stories/${story.id}`} className="inline-flex items-center gap-1 text-xs text-accent-orange hover:text-accent-orange/80">
          View full story <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}