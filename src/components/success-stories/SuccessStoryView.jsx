import React from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  ArrowLeft, Trophy, TrendingUp, Target, Brain, ShieldCheck, Swords,
  Sparkles, Clock, Award, BarChart3, Activity, Compass,
} from 'lucide-react';
import StoryCharts from './StoryCharts';
import StoryExportBar from './StoryExportBar';
import { safeParse } from '@/lib/executiveSuccessStoryEngine';

const PHASES = [
  { key: 'Assessment', icon: Target },
  { key: 'Evidence Collection', icon: ShieldCheck },
  { key: 'Executive Coaching', icon: Brain },
  { key: 'Simulations', icon: Swords },
  { key: 'Outcome Intelligence', icon: TrendingUp },
  { key: 'Executive Ready', icon: Trophy },
];

function Metric({ label, value, sub }) {
  return (
    <div className="bg-white/[0.02] border border-white/8 rounded-xl p-4">
      <div className="text-[10px] uppercase tracking-wider text-white/40">{label}</div>
      <div className="text-2xl font-bold text-white mt-1">{value}</div>
      {sub && <div className="text-[10px] text-white/40 mt-0.5">{sub}</div>}
    </div>
  );
}

function SectionTitle({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={16} className="text-accent-orange" />
      <h2 className="text-base font-semibold text-white">{children}</h2>
    </div>
  );
}

export default function SuccessStoryView({ story, loading, isOwner, onUpdate, canFeature, backLink, publicView }) {
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent-orange/30 border-t-accent-orange rounded-full animate-spin" />
      </div>
    );
  }
  if (!story) {
    return <div className="text-center py-24 text-white/40">Success story not found.</div>;
  }
  if (publicView && !story.published) {
    return <div className="text-center py-24 text-white/40">This story is not publicly available.</div>;
  }

  const metrics = safeParse(story.metrics_snapshot_json, { counts: {} });
  const ai = safeParse(story.ai_insights_json, {});
  const charts = safeParse(story.charts_json, {});
  const timeline = safeParse(story.timeline_json, []);
  const outcomes = safeParse(story.outcome_snapshot_json, []);
  const c = metrics.counts || {};

  const displayName = story.visibility === 'anonymous' ? 'Anonymous Executive' : (story.user_name || 'Executive Member');

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6 lg:py-10">
      <div className="flex items-center justify-between mb-6">
        <Link to={backLink} className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors">
          <ArrowLeft size={14} /> Back
        </Link>
        {story.featured && (
          <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
            <Trophy size={11} /> Featured Story
          </span>
        )}
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="px-2.5 py-1 bg-accent-orange/10 border border-accent-orange/20 rounded-full text-[10px] text-accent-orange font-semibold uppercase tracking-wider">
            Executive Success Story™
          </span>
          {story.published && (
            <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] text-emerald-400">
              {story.visibility === 'anonymous' ? 'Anonymous' : 'Named'} · Public
            </span>
          )}
          {isOwner && !story.published && (
            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-white/40">Private</span>
          )}
        </div>
        <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-3">{story.title}</h1>
        <div className="text-sm text-white/50 mb-2">{displayName}{story.target_role ? ` · ${story.target_role}` : ''}{story.industry ? ` · ${story.industry}` : ''}</div>
        <p className="text-white/60 text-base leading-relaxed max-w-3xl">{story.summary}</p>
      </div>

      {/* Export / Consent */}
      <div className="mb-8">
        <StoryExportBar story={story} isOwner={isOwner} onUpdate={onUpdate} canFeature={canFeature} />
      </div>

      {/* Narrative */}
      <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-6 mb-8">
        <SectionTitle icon={Compass}>Executive Narrative</SectionTitle>
        <div className="prose prose-invert max-w-none text-white/70 leading-relaxed text-sm md:text-base space-y-3 react-markdown-narrative">
          <ReactMarkdown>{story.narrative || ''}</ReactMarkdown>
        </div>
      </div>

      {/* Journey Phases */}
      <div className="mb-8">
        <SectionTitle icon={Activity}>Leadership Journey</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {PHASES.map((p, i) => (
            <div key={p.key} className="relative bg-white/[0.02] border border-white/8 rounded-xl p-3 text-center">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center mx-auto mb-2">
                <p.icon size={15} className="text-indigo-400" />
              </div>
              <div className="text-[11px] font-medium text-white leading-tight">{p.key}</div>
              <div className="text-[9px] text-white/30 mt-1">Step {i + 1}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="mb-8">
        <SectionTitle icon={BarChart3}>Success Metrics</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Metric label="Executive Readiness™" value={metrics.readinessCurrent ?? '—'} sub={`From ${metrics.readinessBeginning ?? 0} · +${metrics.improvement || 0}`} />
          <Metric label="Journey Level" value={metrics.journeyLevel || '—'} />
          <Metric label="Evidence Records" value={c.evidence || 0} />
          <Metric label="Achievements" value={c.achievements || 0} />
          <Metric label="Simulations" value={c.simulations || 0} />
          <Metric label="Decision Labs" value={c.decisionLabs || 0} />
          <Metric label="Challenges" value={c.challenges || 0} />
          <Metric label="Outcomes" value={c.outcomes || 0} />
        </div>
      </div>

      {/* Outcomes */}
      {outcomes.length > 0 && (
        <div className="mb-8">
          <SectionTitle icon={TrendingUp}>Outcome Intelligence</SectionTitle>
          <div className="overflow-x-auto bg-white/[0.02] border border-white/8 rounded-xl">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/8 text-white/40">
                  <th className="text-left px-4 py-3 font-medium">Outcome</th>
                  <th className="text-right px-4 py-3 font-medium">Before</th>
                  <th className="text-right px-4 py-3 font-medium">After</th>
                  <th className="text-right px-4 py-3 font-medium">Improvement</th>
                  <th className="text-right px-4 py-3 font-medium">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {outcomes.map((o, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3 text-white/70">{o.category || o.title}</td>
                    <td className="px-4 py-3 text-right text-white/50">{o.before ?? '—'}</td>
                    <td className="px-4 py-3 text-right text-white/70">{o.after ?? '—'}</td>
                    <td className="px-4 py-3 text-right text-emerald-400">+{o.improvement || 0}</td>
                    <td className="px-4 py-3 text-right text-white/50">{o.confidence ? `${Math.round(o.confidence)}%` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Insights */}
      <div className="mb-8">
        <SectionTitle icon={Sparkles}>AI Insights™</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: 'Biggest Breakthrough', value: ai.biggest_breakthrough },
            { label: 'Most Effective Recommendation', value: ai.most_effective_recommendation },
            { label: 'Fastest Growth Area', value: ai.fastest_growth_area },
            { label: 'Most Improved Competency', value: ai.most_improved_competency },
            { label: 'Next Leadership Goal', value: ai.next_leadership_goal },
            { label: 'Predicted Next Milestone', value: ai.predicted_next_milestone },
          ].filter((x) => x.value).map((x) => (
            <div key={x.label} className="bg-white/[0.02] border border-white/8 rounded-xl p-4">
              <div className="text-[10px] uppercase tracking-wider text-accent-orange/80 mb-1.5">{x.label}</div>
              <div className="text-sm text-white/75 leading-relaxed">{x.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="mb-8">
        <SectionTitle icon={BarChart3}>Visual Analytics</SectionTitle>
        <StoryCharts charts={charts} />
      </div>

      {/* Timeline */}
      {timeline.length > 0 && (
        <div className="mb-8">
          <SectionTitle icon={Clock}>Journey Timeline</SectionTitle>
          <div className="relative pl-6 border-l border-white/10 space-y-4">
            {timeline.map((t, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-accent-orange border-2 border-[#0a0a0f]" />
                <div className="text-[11px] text-accent-orange font-semibold uppercase tracking-wider">{t.week}</div>
                <div className="text-sm text-white/70 mt-0.5">{t.milestone}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {story.achievements && story.achievements.length > 0 && (
        <div className="mb-8">
          <SectionTitle icon={Award}>Executive Milestones</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {story.achievements.map((a, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] border border-white/10 rounded-lg text-xs text-white/70">
                <Award size={12} className="text-amber-400" /> {a}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}