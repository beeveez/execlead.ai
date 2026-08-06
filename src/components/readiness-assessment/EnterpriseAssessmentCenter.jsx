import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2, CalendarClock, UserCheck, Gauge, Clock, CheckCircle2, ArrowRight,
  Sparkles, ShieldCheck, Brain, Swords, TrendingUp, Network, Star, ClipboardCheck, Award,
  Check, BarChart3, Users, Target, MessageSquare, Crown, Lightbulb, Database, ChevronRight,
  Briefcase, Route, Lock, PlayCircle,
} from 'lucide-react';

const GOALS = [
  'Become a Director', 'Become a Senior Director', 'Become a VP', 'Become a CIO',
  'Become a CTO', 'Become a CHRO', 'Become a COO', 'Become a CEO',
];

const GOAL_ICONS = {
  'Become a Director': BarChart3, 'Become a Senior Director': TrendingUp, 'Become a VP': Crown,
  'Become a CIO': Brain, 'Become a CTO': Brain, 'Become a CHRO': Users,
  'Become a COO': Briefcase, 'Become a CEO': Crown,
};

const TRACK_CATALOG = [
  { name: 'Executive Readiness™', icon: Gauge, status: 'Available', desc: 'Measure executive readiness across 12 leadership dimensions.' },
  { name: 'Promotion Readiness™', icon: TrendingUp, status: 'Available', desc: 'Assess readiness for your next executive promotion.' },
  { name: 'Leadership DNA™', icon: Brain, status: 'Available', desc: 'Map your leadership decision archetypes and patterns.' },
  { name: 'Executive Simulation™', icon: Swords, status: 'Available', desc: 'Practice high-stakes executive decisions with AI.' },
  { name: 'Succession Planning™', icon: Network, status: 'Enterprise', desc: 'Contribute to talent reviews and succession bench strength.' },
  { name: 'High Potential Assessment™', icon: Star, status: 'Coming Soon', desc: 'Identify high-potential talent across the organization.' },
  { name: 'Leadership Development Review™', icon: ClipboardCheck, status: 'Enterprise', desc: 'Structured leadership development program review.' },
  { name: 'Executive Certification™', icon: Award, status: 'Coming Soon', desc: 'Verified executive certification on completion.' },
];

const STATUS_STYLE = {
  Available: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Enterprise: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  'Coming Soon': 'bg-white/5 text-white/40 border-white/10',
  Assigned: 'bg-accent-orange/15 text-accent-orange border-accent-orange/30',
};

const TIME_COMMITMENTS = [
  { icon: Clock, label: 'Estimated Time', value: '15 Minutes' },
  { icon: BarChart3, label: 'Questions', value: '20 Adaptive' },
  { icon: CheckCircle2, label: 'Progress', value: 'Saved Automatically' },
  { icon: Swords, label: 'Experience', value: 'AI Simulation Included' },
];

const SIM_DIMENSIONS = [
  { label: 'Strategic Thinking', icon: Brain },
  { label: 'Executive Communication', icon: MessageSquare },
  { label: 'Stakeholder Management', icon: Users },
  { label: 'Decision Quality', icon: Target },
  { label: 'Leadership Judgment', icon: Crown },
  { label: 'Business Acumen', icon: Lightbulb },
];

const UNLOCKS = [
  { label: 'Executive Readiness Dashboard™', icon: Gauge, to: '/dashboard' },
  { label: 'Leadership Gap Analysis™', icon: Target, to: '/executive-readiness' },
  { label: 'Personalized AI Executive Coach™', icon: Sparkles, to: '/coach' },
  { label: 'Career Studio™', icon: Briefcase, to: '/career-studio' },
  { label: 'Executive Development Roadmap™', icon: Route, to: '/journey' },
  { label: 'Executive Identity™', icon: Crown, to: '/executive-portfolio' },
];

const HR_METRICS = [
  'Completion Rate', 'Average Executive Readiness', 'Leadership DNA Distribution', 'Promotion Ready',
  'Ready in 12 Months', 'Ready in 24 Months', 'High Potential Employees', 'Critical Leadership Gaps',
  'Department Comparisons', 'Trend Analysis', 'Assessment Completion Status',
];

const AI_INSIGHTS = [
  'Executive Communication is the most common gap across Sales Managers.',
  'Technology leaders demonstrate stronger strategic thinking than organizational influence.',
  '18 employees are projected to become Director-ready within 12 months.',
];

function firstName(user) {
  if (user?.full_name) return user.full_name.split(' ')[0];
  if (user?.email) return user.email.split('@')[0];
  return 'there';
}

function SectionTitle({ children }) {
  return <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">{children}</div>;
}

export default function EnterpriseAssessmentCenter({
  user, enterprise, orgName, hasSavedProgress, track, onBegin, onChooseGoal, onBrowsePaths,
}) {
  const fname = firstName(user);
  const ctaLabel = hasSavedProgress ? 'Resume Assessment' : 'Begin Assessment';

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-6 py-6 lg:py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent-orange/10 border border-accent-orange/25 rounded-full text-xs text-accent-orange font-semibold mb-4">
          <ShieldCheck size={13} /> Enterprise Executive Assessment Center™
        </div>
        <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight mb-2">
          Welcome back, {fname}
        </h1>
        <p className="text-sm text-white/55 max-w-2xl mx-auto">
          Your central hub for executive leadership assessments. {enterprise
            ? 'Your organization has assigned your next assessment — begin when ready.'
            : 'Choose your executive goal and we will personalize every assessment.'}
        </p>
      </div>

      {/* Enterprise assignment panel OR self-service goal selection */}
      {enterprise ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-accent-orange/25 bg-gradient-to-br from-accent-orange/[0.06] to-transparent p-5 md:p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck size={16} className="text-accent-orange" />
            <h2 className="text-sm font-semibold text-white">Your Assigned Assessment</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
            <Field icon={Building2} label="Organization" value={orgName || 'Enterprise Workspace'} />
            <Field icon={CalendarClock} label="Campaign" value="Q3 Leadership Review" />
            <Field icon={UserCheck} label="Assigned By" value="Talent Management" />
            <Field icon={Gauge} label="Assessment" value="Executive Promotion Readiness™" />
            <Field icon={CheckCircle2} label="Status" value={hasSavedProgress ? 'In Progress' : 'Not Started'} valueColor={hasSavedProgress ? 'text-amber-400' : 'text-white'} />
            <Field icon={Clock} label="Estimated Time" value="15 Minutes" />
            <Field icon={CalendarClock} label="Deadline" value="August 30" />
            <Field icon={BarChart3} label="Questions" value="20 Adaptive" />
            <Field icon={Check} label="Progress" value="Saved Automatically" valueColor="text-emerald-400" />
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button onClick={onBegin}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-white text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-orange/20">
              {ctaLabel} <ArrowRight size={16} />
            </button>
            <p className="text-[11px] text-white/40">Your results synchronize automatically with Enterprise Talent Intelligence™.</p>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="text-center mb-4">
            <SectionTitle>Choose Your Executive Goal</SectionTitle>
            <h2 className="text-lg md:text-xl font-bold text-white mb-1">What executive role are you working toward?</h2>
            <p className="text-[12px] text-white/45 max-w-xl mx-auto">Your selection personalizes every assessment, simulation, and development recommendation.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {GOALS.map((g, i) => {
              const Icon = GOAL_ICONS[g] || Crown;
              return (
                <motion.button key={g} onClick={() => onChooseGoal(g)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="group text-left p-4 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-accent-orange/40 hover:bg-accent-orange/[0.05] transition-all hover:-translate-y-0.5">
                  <div className="w-9 h-9 rounded-xl bg-white/5 group-hover:bg-accent-orange/15 flex items-center justify-center mb-3">
                    <Icon size={16} className="text-white/70 group-hover:text-accent-orange" />
                  </div>
                  <div className="text-[12px] font-semibold text-white leading-tight">{g}</div>
                </motion.button>
              );
            })}
          </div>
          {hasSavedProgress && (
            <div className="flex items-center justify-center mt-4">
              <button onClick={onBegin} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-sm font-medium hover:bg-amber-500/20 transition-colors">
                <PlayCircle size={15} /> Resume Assessment
              </button>
            </div>
          )}
          <div className="text-center mt-4">
            <button onClick={onBrowsePaths} className="inline-flex items-center gap-1.5 text-[12px] text-white/50 hover:text-white/80 transition-colors">
              Browse all leadership paths <ChevronRight size={13} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Time commitment strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {TIME_COMMITMENTS.map((t) => (
          <div key={t.label} className="rounded-xl border border-white/8 bg-white/[0.02] p-3.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent-orange/10 flex items-center justify-center shrink-0"><t.icon size={14} className="text-accent-orange" /></div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/30 font-semibold">{t.label}</div>
              <div className="text-[12px] font-semibold text-white leading-tight">{t.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Assessment Catalog */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>Assessment Catalog</SectionTitle>
          <span className="text-[10px] text-white/35">{enterprise ? 'Managed by enterprise configuration' : 'Personalized to your goal'}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TRACK_CATALOG.map((t, i) => {
            const assigned = enterprise && t.name === 'Promotion Readiness™';
            const status = assigned ? 'Assigned' : t.status;
            return (
              <motion.div key={t.name} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                className="rounded-xl border border-white/8 bg-white/[0.02] p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><t.icon size={15} className="text-white/70" /></div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${STATUS_STYLE[status] || STATUS_STYLE['Coming Soon']}`}>{status}</span>
                </div>
                <div className="text-[12px] font-semibold text-white leading-tight">{t.name}</div>
                <div className="text-[10px] text-white/40 mt-1 leading-relaxed">{t.desc}</div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* AI Executive Simulation preview */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 md:p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Swords size={16} className="text-accent-orange" />
          <h3 className="text-sm font-semibold text-white">AI Executive Simulation™ Included</h3>
        </div>
        <div className="rounded-xl bg-[#0a0a0f]/60 border border-white/8 p-4 mb-4">
          <p className="text-[12px] text-white/45 mb-2">Sample scenario</p>
          <p className="text-sm text-white/85 leading-relaxed">
            You are the Director of Technology. A ransomware attack has impacted production. The CEO wants
            operations restored. Legal advises caution. Finance is concerned about financial impact.
            <span className="text-accent-orange font-medium"> How do you respond?</span>
          </p>
        </div>
        <div className="mb-2 text-[11px] uppercase tracking-wider text-white/40 font-semibold">AI evaluates</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
          {SIM_DIMENSIONS.map((d) => (
            <div key={d.label} className="flex items-center gap-2 rounded-lg bg-white/[0.03] border border-white/8 px-3 py-2">
              <d.icon size={13} className="text-accent-orange shrink-0" />
              <span className="text-[11px] text-white/70 font-medium">{d.label}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4">
          {['Voice (future)', 'Text', 'Follow-up Questions', 'Adaptive Questioning'].map((x) => (
            <div key={x} className="flex items-center gap-1.5 text-[11px] text-white/50"><Check size={11} className="text-emerald-400/80" /> {x}</div>
          ))}
        </div>
      </div>

      {/* Executive Value unlocks */}
      <div className="mb-8">
        <SectionTitle>What You Unlock Immediately After Completion</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {UNLOCKS.map((u) => (
            <Link key={u.label} to={u.to} className="group flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-3.5 hover:border-accent-orange/30 hover:bg-white/[0.04] transition-colors">
              <div className="w-9 h-9 rounded-lg bg-accent-orange/10 flex items-center justify-center shrink-0"><u.icon size={16} className="text-accent-orange" /></div>
              <span className="text-[12px] font-medium text-white/80 leading-tight group-hover:text-white">{u.label}</span>
            </Link>
          ))}
        </div>
        <p className="text-[11px] text-white/40 mt-3">Your results deliver immediate personal value — they never disappear into HR only.</p>
      </div>

      {/* Enterprise Talent Intelligence (enterprise only) */}
      {enterprise && (
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.04] p-5 md:p-6 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Database size={16} className="text-indigo-300" />
            <h3 className="text-sm font-semibold text-white">Enterprise Talent Intelligence™</h3>
          </div>
          <p className="text-[12px] text-white/55 mb-4">Your assessment results synchronize automatically — no manual HR tracking required.</p>
          <div className="flex flex-wrap gap-2 mb-5">
            {HR_METRICS.map((m) => (
              <span key={m} className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/8 text-[11px] text-white/65">{m}</span>
            ))}
          </div>
          <div className="mb-4">
            <div className="text-[10px] uppercase tracking-wider text-indigo-300/80 font-semibold mb-2">AI Insights™</div>
            <div className="space-y-2">
              {AI_INSIGHTS.map((q, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg bg-white/[0.03] border border-white/8 px-3 py-2.5">
                  <Sparkles size={13} className="text-indigo-300 shrink-0 mt-0.5" />
                  <p className="text-[11.5px] text-white/70 leading-relaxed">{q}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/hr-dashboard" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500/15 border border-indigo-500/25 text-indigo-200 text-[12px] font-medium hover:bg-indigo-500/20 transition-colors">
              <BarChart3 size={13} /> HR Dashboard
            </Link>
            <Link to="/succession-planning" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-[12px] font-medium hover:bg-white/10 transition-colors">
              <Network size={13} /> Succession Planning
            </Link>
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="text-center pt-2">
        <button onClick={onBegin}
          className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-white text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-orange/20">
          {ctaLabel} <ArrowRight size={16} />
        </button>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Lock size={12} className="text-white/30" />
          <p className="text-[11px] text-white/40">Progress saved automatically · Private & secure · Results are yours</p>
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, value, valueColor = 'text-white' }) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/8 p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={11} className="text-white/40" />
        <span className="text-[10px] uppercase tracking-wider text-white/35 font-semibold">{label}</span>
      </div>
      <div className={`text-[12px] font-semibold leading-tight ${valueColor}`}>{value}</div>
    </div>
  );
}