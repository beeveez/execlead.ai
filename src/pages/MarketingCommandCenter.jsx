import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import {
  Loader2, Sparkles, ShieldCheck, TrendingUp, Award, BookOpen, Users, FileText,
  Gauge, Crown, Check, AlertCircle, BarChart3, Layers, Cpu,
} from 'lucide-react';

// Marketing Command Center™ — internal workspace for the Evidence-Led Marketing Engine™.
// Displays auto-generated marketing assets, the evidence pipeline, publishing queue,
// consent status, generated insights, platform statistics, and content awaiting approval.
export default function MarketingCommandCenter() {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('generateMarketingIntelligence', { scope: 'admin' });
      setData(res.data);
    } catch (e) { toast({ title: 'Could not load marketing intelligence', description: e.message, variant: 'destructive' }); }
    finally { setLoading(false); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const generateStory = async (c) => {
    setBusy(c.userId);
    try {
      await base44.entities.ExecutiveSuccessStory.create({
        story_id: `SS-${Date.now().toString().slice(-8)}`,
        user_id: c.userId,
        user_name: c.name,
        title: c.title,
        summary: c.summary,
        visibility: 'anonymous',
        published: false,
        consent_status: 'not_requested',
        industry: 'technology',
        target_role: c.title,
      });
      toast({ title: 'Story draft created', description: 'Added to the publishing queue — awaiting owner consent.' });
      load();
    } catch (e) { toast({ title: 'Could not create story', description: e.message, variant: 'destructive' }); }
    finally { setBusy(null); }
  };

  const publish = async (s) => {
    if (s.consentStatus !== 'granted') { toast({ title: 'Owner consent required', description: 'Publishing is locked until the member grants consent.', variant: 'destructive' }); return; }
    setBusy(s.id);
    try { await base44.entities.ExecutiveSuccessStory.update(s.id, { published: true }); toast({ title: 'Story published' }); load(); }
    catch (e) { toast({ title: 'Could not publish', description: e.message, variant: 'destructive' }); }
    finally { setBusy(null); }
  };

  if (loading) return <div className="flex items-center justify-center py-32 text-white/40"><Loader2 size={22} className="animate-spin" /></div>;

  const impact = data?.livePlatformImpact || {};
  const impactItems = [
    { label: 'Executive Journeys', value: impact.executiveJourneys, icon: Users },
    { label: 'Readiness Assessments', value: impact.readinessAssessments, icon: Gauge },
    { label: 'AI Coaching Sessions', value: impact.aiCoachingSessions, icon: Sparkles },
    { label: 'Executive Simulations', value: impact.executiveSimulations, icon: Layers },
    { label: 'Leadership Decisions', value: impact.leadershipDecisions, icon: Cpu },
    { label: 'Evidence Records', value: impact.evidenceRecords, icon: FileText },
    { label: 'Executive Stories', value: impact.executiveStories, icon: BookOpen },
    { label: 'Executive Identities', value: impact.executiveIdentities, icon: ShieldCheck },
    { label: 'Avg Readiness Growth', value: `+${impact.averageReadinessGrowth}`, icon: TrendingUp },
  ];
  const queue = data?.publishingQueue || [];
  const candidates = data?.caseStudyCandidates || [];
  const insights = data?.weeklyInsights || {};
  const index = data?.executiveLeadershipIndex || [];
  const founders = data?.foundingMemberHighlights || [];
  const milestones = data?.platformMilestones || [];
  const trust = data?.trust;

  const Card = ({ children, className = '' }) => <div className={`rounded-2xl border border-white/10 bg-white/[0.03] p-5 ${className}`}>{children}</div>;
  const Provenance = ({ p }) => p && (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-white/35 mt-2 pt-2 border-t border-white/8">
      <span className="text-emerald-400/80">{p.evidenceConfidence}% confidence</span>
      <span>· {p.verification}</span>
      <span>· v{p.version}</span>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 space-y-8">
      {/* Hero */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-full text-[11px] text-white/60 font-medium mb-3"><Sparkles size={12} className="text-accent-orange" /> Evidence-Led Marketing Engine™</div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Marketing Command Center™</h1>
        <p className="text-sm text-white/45 mt-1 max-w-2xl">Every marketing asset is generated from verified platform evidence. Nothing fabricated; owner consent required before publication.</p>
      </div>

      {/* Platform Statistics */}
      <Card>
        <div className="flex items-center gap-2 mb-4"><BarChart3 size={15} className="text-accent-orange" /><h2 className="text-sm font-semibold text-white">Platform Statistics</h2></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
          {impactItems.map((m) => { const Icon = m.icon; return (
            <div key={m.label} className="rounded-xl bg-white/[0.03] border border-white/8 p-3 text-center">
              <Icon size={14} className="text-white/50 mx-auto mb-1.5" />
              <div className="text-lg font-bold text-white">{m.value}</div>
              <div className="text-[9px] text-white/40 leading-tight">{m.label}</div>
            </div>
          ); })}
        </div>
        <Provenance p={impact.provenance} />
      </Card>

      {/* Publishing Queue */}
      <Card>
        <div className="flex items-center gap-2 mb-4"><BookOpen size={15} className="text-accent-orange" /><h2 className="text-sm font-semibold text-white">Publishing Queue</h2><span className="text-[10px] text-white/40 ml-auto">{queue.length} awaiting</span></div>
        {queue.length === 0 ? <p className="text-[12px] text-white/40">No stories in the queue. Generate a case study below to begin.</p> : (
          <div className="space-y-2">
            {queue.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/8 px-3 py-2.5">
                <div><div className="text-[12px] font-medium text-white">{s.title}</div><div className="text-[10px] text-white/40">{s.user_name} · {s.visibility}</div></div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.consentStatus === 'granted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{s.consentStatus === 'granted' ? 'Consent granted' : 'Awaiting consent'}</span>
                  <button disabled={s.consentStatus !== 'granted' || busy === s.id} onClick={() => publish(s)} className="text-[11px] px-3 py-1.5 rounded-lg bg-accent-orange/90 hover:bg-accent-orange text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed">{busy === s.id ? <Loader2 size={12} className="animate-spin" /> : 'Publish'}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Case Study Candidates — content awaiting approval */}
      <Card>
        <div className="flex items-center gap-2 mb-4"><Award size={15} className="text-accent-orange" /><h2 className="text-sm font-semibold text-white">Case Study Candidates</h2><span className="text-[10px] text-white/40 ml-auto">{candidates.length} detected</span></div>
        {candidates.length === 0 ? <p className="text-[12px] text-white/40">No members meet the case-study threshold yet (readiness +15, promotion, or mature identity). The engine detects them automatically.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {candidates.map((c) => (
              <div key={c.userId} className="rounded-xl bg-white/[0.03] border border-white/8 p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div><div className="text-[12px] font-semibold text-white">{c.title}</div><div className="text-[10px] text-white/40">{c.name}</div></div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">+{c.readinessDelta}</span>
                </div>
                <p className="text-[11px] text-white/55 leading-relaxed mb-2">{c.summary}</p>
                <div className="text-[10px] text-white/40 mb-3"><span className="text-emerald-400/80">Evidence {c.evidenceConfidence}%</span> · {c.evidence}</div>
                <button disabled={busy === c.userId} onClick={() => generateStory(c)} className="text-[11px] px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-white/80 font-medium disabled:opacity-40">{busy === c.userId ? <Loader2 size={12} className="animate-spin" /> : 'Generate Story Draft'}</button>
                <Provenance p={c.provenance} />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Generated Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-4"><TrendingUp size={15} className="text-accent-orange" /><h2 className="text-sm font-semibold text-white">Weekly Platform Insights™</h2></div>
          <div className="space-y-2.5">
            {[['Most Improved Competency', insights.mostImprovedCompetency], ['Fastest Growing Path', insights.fastestGrowingPath], ['Most Popular Simulation', insights.mostPopularSimulation], ['Highest Readiness Increase', `+${insights.highestReadinessIncrease}`], ['Most Common Gap', insights.mostCommonGap], ['Most Active Persona', insights.mostActivePersona]].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between text-[12px]"><span className="text-white/50">{k}</span><span className="text-white/85 font-medium capitalize">{v}</span></div>
            ))}
          </div>
          <Provenance p={insights.provenance} />
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-4"><Gauge size={15} className="text-accent-orange" /><h2 className="text-sm font-semibold text-white">Executive Leadership Index™</h2></div>
          <div className="space-y-3">
            {index.map((i) => (
              <div key={i.name}>
                <div className="flex items-center justify-between text-[11px] mb-1"><span className="text-white/60">{i.name}</span><span className="text-white/85 font-semibold">{i.value} <span className="text-white/30 text-[9px]">({i.sample})</span></span></div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-indigo-500/60 to-accent-orange/60" style={{ width: `${i.value}%` }} /></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Founding Highlights + Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-2 mb-4"><Crown size={15} className="text-accent-orange" /><h2 className="text-sm font-semibold text-white">Founding Member Highlights™</h2></div>
          {founders.length === 0 ? <p className="text-[12px] text-white/40">No active founding members detected yet.</p> : (
            <div className="space-y-2">
              {founders.map((f, i) => (
                <div key={i} className="rounded-xl bg-white/[0.03] border border-white/8 p-3">
                  <div className="flex items-center justify-between"><span className="text-[12px] font-medium text-amber-300">{f.name}</span><span className="text-[10px] text-emerald-400/80">{f.evidenceConfidence}%</span></div>
                  <div className="text-[10px] text-white/45 mt-0.5">{f.breakthrough} · {f.milestone}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <div className="flex items-center gap-2 mb-4"><ShieldCheck size={15} className="text-accent-orange" /><h2 className="text-sm font-semibold text-white">Platform Milestones™</h2></div>
          <div className="space-y-2">
            {milestones.map((m) => (
              <div key={m.label} className="flex items-center justify-between text-[12px]">
                <span className="text-white/60">{m.label}</span>
                <span className={m.achieved ? 'text-emerald-400 flex items-center gap-1' : 'text-white/50'}>{m.achieved ? <><Check size={12} /> {m.current}/{m.threshold}</> : `${m.current}/${m.threshold}`}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {trust && (
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] text-white/35 pt-2">
          <span className="flex items-center gap-1"><ShieldCheck size={11} className="text-emerald-400/70" /> No fabricated metrics</span>
          <span>·</span><span>No synthetic testimonials</span>
          <span>·</span><span>Source: {trust.source}</span>
          <span>·</span><span>Generated From: {trust.generatedFrom?.join(', ')}</span>
          <span>·</span><span>v{trust.version}</span>
        </div>
      )}
    </div>
  );
}