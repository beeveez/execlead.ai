import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  Loader2, Sparkles, Users, Activity, TrendingUp, ShieldCheck, Award, BookOpen,
  Gauge, Crown, AlertTriangle, Lightbulb, GitBranch, Cpu, Layers, Heart, ChevronRight,
} from 'lucide-react';

const Card = ({ children, title, icon: Icon, count, className = '' }) => (
  <div className={`rounded-2xl border border-white/10 bg-white/[0.03] p-5 ${className}`}>
    {title && (
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon size={15} className="text-accent-orange" />}
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        {count != null && <span className="text-[10px] text-white/40 ml-auto">{count}</span>}
      </div>
    )}
    {children}
  </div>
);

const Stat = ({ label, value, sub }) => (
  <div className="rounded-xl bg-white/[0.03] border border-white/8 p-3 text-center">
    <div className="text-lg font-bold text-white">{value}</div>
    <div className="text-[9px] text-white/40 leading-tight mt-0.5">{label}</div>
    {sub && <div className="text-[9px] text-emerald-400 mt-0.5">{sub}</div>}
  </div>
);

const Bar = ({ label, value, max = 100, color = 'from-indigo-500/60 to-accent-orange/60' }) => (
  <div>
    <div className="flex items-center justify-between text-[11px] mb-1"><span className="text-white/60">{label}</span><span className="text-white/85 font-semibold">{value}</span></div>
    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className={`h-full bg-gradient-to-r ${color}`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} /></div>
  </div>
);

export default function FoundingMemberCommandCenter() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openMember, setOpenMember] = useState(null);

  useEffect(() => {
    (async () => {
      try { const res = await base44.functions.invoke('generateFoundingMemberIntelligence', {}); setData(res.data); }
      catch (e) {}
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-32 text-white/40"><Loader2 size={22} className="animate-spin" /></div>;
  if (!data) return <div className="text-center py-32 text-white/40 text-sm">Could not load founding member intelligence.</div>;

  const m = data.members, e = data.engagement, o = data.outcomes, fb = data.feedback, xs = data.experienceScore, ph = data.productHealth;
  const statusColor = { Excellent: 'text-emerald-400', Good: 'text-emerald-400', 'Needs Attention': 'text-amber-400', Critical: 'text-rose-400' }[ph.status];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 space-y-8">
      {/* Hero + Product Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-full text-[11px] text-white/60 font-medium mb-3"><Sparkles size={12} className="text-accent-orange" /> Private Beta Operations System</div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Founding Member Command Center™</h1>
          <p className="text-sm text-white/45 mt-1 max-w-2xl">Every product decision supported by real users, real engagement, real feedback, and real executive outcomes. No intuition.</p>
        </div>
        <Card title="Product Health Score™" icon={Heart}>
          <div className="text-center py-2">
            <div className={`text-4xl font-bold ${statusColor}`}>{ph.score}</div>
            <div className={`text-[12px] font-semibold ${statusColor} mt-1`}>{ph.status}</div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {Object.entries(ph.inputs).map(([k, v]) => <div key={k} className="text-[10px] flex justify-between"><span className="text-white/40 capitalize">{k}</span><span className="text-white/70">{v}</span></div>)}
          </div>
        </Card>
      </div>

      {/* Founding Members */}
      <Card title="Founding Members" icon={Users}>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <Stat label="Applications" value={m.applications} />
          <Stat label="Approved" value={m.approved} />
          <Stat label="Waitlist" value={m.waitlist} />
          <Stat label="Invited" value={m.invited} />
          <Stat label="Active" value={m.active} />
          <Stat label="Inactive" value={m.inactive} />
        </div>
      </Card>

      {/* Engagement + Outcomes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Platform Engagement" icon={Activity}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Stat label="Assessments Started" value={e.assessmentsStarted} />
            <Stat label="Assessments Completed" value={e.assessmentsCompleted} />
            <Stat label="Demo Completion" value={e.demoCompletion} />
            <Stat label="Coach Sessions" value={e.coachSessions} />
            <Stat label="Simulations" value={e.simulations} />
            <Stat label="Journey Progress" value={e.journeyProgress} />
            <Stat label="Return Rate" value={`${e.returnRate}%`} />
          </div>
        </Card>
        <Card title="Executive Outcomes" icon={TrendingUp}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Stat label="Avg Readiness" value={o.averageReadiness} />
            <Stat label="Avg Growth" value={`+${o.averageGrowth}`} />
            <Stat label="Executive Stories" value={o.executiveStories} />
            <Stat label="Identity Completion" value={`${o.identityCompletion}%`} />
            <Stat label="Portfolio Completion" value={o.portfolioCompletion} />
            <Stat label="Promotion Forecasts" value={o.promotionForecast} />
          </div>
        </Card>
      </div>

      {/* Member Timeline™ */}
      <Card title="Member Timeline™" icon={BookOpen} count={data.memberTimelines.length}>
        {data.memberTimelines.length === 0 ? <p className="text-[12px] text-white/40">No member activity yet.</p> : (
          <div className="space-y-2">
            {data.memberTimelines.map((mem) => (
              <div key={mem.userId} className="rounded-xl bg-white/[0.03] border border-white/8">
                <button onClick={() => setOpenMember(openMember === mem.userId ? null : mem.userId)} className="w-full flex items-center justify-between px-4 py-2.5 text-left">
                  <span className="text-[12px] font-medium text-white">{mem.name}</span>
                  <span className="text-[10px] text-white/40 flex items-center gap-1">{mem.events.length} events <ChevronRight size={12} className={openMember === mem.userId ? 'rotate-90 transition-transform' : 'transition-transform'} /></span>
                </button>
                {openMember === mem.userId && (
                  <div className="px-4 pb-3 space-y-1.5 border-t border-white/8 pt-2">
                    {mem.events.map((ev, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px]">
                        <span className="text-white/30 w-24 shrink-0">{ev.ts ? new Date(ev.ts).toLocaleDateString() : ''}</span>
                        <span className="text-white/70">{ev.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Beta Feedback + Experience Score */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Beta Feedback Engine™" icon={Lightbulb} count={fb.total}>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <Stat label="Total" value={fb.total} />
            <Stat label="NPS" value={fb.nps} />
            <Stat label="Avg Rating" value={fb.avgRating} />
          </div>
          {fb.topImprovements.length > 0 && <div className="mb-3"><div className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5">Top Improvement Requests</div><div className="flex flex-wrap gap-1.5">{fb.topImprovements.map((t) => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 truncate max-w-[180px]">{t}</span>)}</div></div>}
          {fb.items.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-auto">
              {fb.items.map((it) => (
                <div key={it.id} className="rounded-lg bg-white/[0.03] border border-white/8 p-2.5">
                  <div className="flex items-center justify-between"><span className="text-[11px] font-medium text-white">{it.user}</span><span className="text-[9px] text-white/40">{it.category}</span></div>
                  {it.improve && <p className="text-[10px] text-white/55 mt-1">“{it.improve}”</p>}
                </div>
              ))}
            </div>
          ) : <p className="text-[11px] text-white/40">No feedback submitted yet.</p>}
        </Card>
        <Card title="Executive Experience Score™" icon={Gauge}>
          <div className="text-center mb-3">
            <div className="text-3xl font-bold text-white">{xs.overall}</div>
            <div className="text-[10px] text-white/40">Overall Experience · trend {xs.trend}</div>
          </div>
          <div className="space-y-2.5">
            <Bar label="Onboarding" value={xs.onboarding} />
            <Bar label="Assessment" value={xs.assessment} />
            <Bar label="AI Coaching" value={xs.aiCoaching} />
            <Bar label="Simulations" value={xs.simulations} />
            <Bar label="Reports" value={xs.reports} />
            <Bar label="Identity" value={xs.identity} />
            <Bar label="Satisfaction" value={xs.overallSatisfaction} />
          </div>
        </Card>
      </div>

      {/* Friction + Weekly Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Friction Detection™" icon={AlertTriangle} count={data.friction.length}>
          <div className="space-y-2.5">
            {data.friction.map((f, i) => (
              <div key={i} className="rounded-lg bg-white/[0.03] border border-white/8 p-3">
                <div className="text-[11px] font-semibold text-amber-300 mb-0.5">{f.signal}</div>
                <div className="text-[11px] text-white/60">{f.detail}</div>
                <div className="text-[10px] text-accent-orange/80 mt-1">→ {f.recommendation}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Weekly Product Insights™" icon={Cpu}>
          <div className="space-y-2.5">
            {[['Most Requested Feature', data.weeklyInsights.mostRequestedFeature], ['Most Praised', data.weeklyInsights.mostPraised], ['Largest Friction Point', data.weeklyInsights.largestFriction], ['Highest Engagement', data.weeklyInsights.highestEngagement], ['Lowest Engagement', data.weeklyInsights.lowestEngagement], ['Fastest Improving', data.weeklyInsights.fastestImproving]].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between text-[11px]"><span className="text-white/50">{k}</span><span className="text-white/85 font-medium text-right max-w-[60%] truncate">{v}</span></div>
            ))}
          </div>
          <div className="text-[9px] text-white/30 mt-3">Week of {data.weeklyInsights.weekOf}</div>
        </Card>
      </div>

      {/* Readiness Impact */}
      <Card title="Executive Readiness Impact™" icon={TrendingUp}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">By Leadership Path</div>
            <div className="space-y-2">{data.readinessImpact.byPath.map((g) => <Bar key={g.key} label={g.key.replace(/_/g, ' ')} value={g.avg} max={100} />)}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">By Competency</div>
            <div className="space-y-2">{data.readinessImpact.byCompetency.slice(0, 6).map((g) => <Bar key={g.key} label={g.key} value={g.avg} max={100} />)}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">By Cohort</div>
            <div className="space-y-2">{data.readinessImpact.byCohort.map((g) => <Bar key={g.key} label={g.key} value={g.avg} max={100} color="from-emerald-500/60 to-amber-500/60" />)}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">By Industry</div>
            <div className="space-y-2">{data.readinessImpact.byIndustry.map((g) => <Bar key={g.key} label={g.key} value={g.avg} max={100} color="from-indigo-500/60 to-emerald-500/60" />)}</div>
          </div>
        </div>
      </Card>

      {/* Cohorts + Feature Impact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Founding Member Cohorts™" icon={GitBranch} count={data.cohorts.length}>
          {data.cohorts.length === 0 ? <p className="text-[12px] text-white/40">Cohorts form as members select leadership paths.</p> : (
            <div className="space-y-2">{data.cohorts.map((c) => <div key={c.name} className="flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/8 px-3 py-2"><span className="text-[12px] text-white/80 capitalize">{c.name}</span><span className="text-[11px] text-white/50">{c.count} · avg {c.avgReadiness}</span></div>)}</div>
          )}
        </Card>
        <Card title="Feature Impact Analytics™" icon={Layers} count={data.featureImpact.length}>
          {data.featureImpact.length === 0 ? <p className="text-[12px] text-white/40">No live features registered yet.</p> : (
            <div className="space-y-2">{data.featureImpact.map((f) => (
              <div key={f.name} className="flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/8 px-3 py-2">
                <div><div className="text-[12px] text-white/80">{f.name}</div><div className="text-[9px] text-white/40">{f.metricLabel}</div></div>
                <div className="text-right"><div className="text-[12px] font-semibold text-white">{f.metric}</div><span className={`text-[9px] px-1.5 py-0.5 rounded-full ${f.status === 'live' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{f.status}</span></div>
              </div>
            ))}</div>
          )}
        </Card>
      </div>

      {/* AI Product Advisor */}
      <Card title="AI Product Advisor™" icon={Crown}>
        <div className="space-y-2.5">
          {data.advisor.map((a, i) => (
            <div key={i} className="rounded-lg bg-white/[0.03] border border-white/8 p-3">
              <div className="text-[11px] font-semibold text-white mb-0.5">{a.question}</div>
              <div className="text-[11px] text-white/65">{a.recommendation}</div>
              <div className="text-[9px] text-white/35 mt-1">Evidence: {a.evidence}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Beta Release Notes */}
      <Card title="Beta Release Notes™" icon={BookOpen} count={data.releaseNotes.length}>
        {data.releaseNotes.length === 0 ? <p className="text-[12px] text-white/40">No releases recorded yet.</p> : (
          <div className="space-y-2">
            {data.releaseNotes.map((r) => (
              <div key={r.version} className="rounded-lg bg-white/[0.03] border border-white/8 p-3">
                <div className="flex items-center justify-between"><span className="text-[12px] font-semibold text-white">v{r.version} — {r.name}</span><span className="text-[10px] text-white/40">{r.date ? new Date(r.date).toLocaleDateString() : ''}</span></div>
                {r.features.length > 0 && <div className="text-[10px] text-emerald-400/80 mt-1">+ {r.features.join(', ')}</div>}
                {r.fixes.length > 0 && <div className="text-[10px] text-white/50 mt-0.5">✓ {r.fixes.join(', ')}</div>}
                {r.breaking && <div className="text-[10px] text-amber-400 mt-0.5">⚠ {r.breaking}</div>}
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] text-white/35 pt-2">
        <span className="flex items-center gap-1"><ShieldCheck size={11} className="text-emerald-400/70" /> Source: {data.trust.source}</span>
        <span>·</span><span>No fabricated metrics</span>
        <span>·</span><span>Generated From: {data.trust.generatedFrom.join(', ')}</span>
        <span>·</span><span>v{data.version}</span>
      </div>
    </div>
  );
}