import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu, Briefcase, DollarSign, Users, Megaphone, Lightbulb, Landmark, HeartPulse, GraduationCap,
  Target, ArrowRight, Loader2, Check, Star, Play, Sparkles, Shield,
  Gauge, Brain, Swords, Map, Route, Share2, BookOpen, FolderOpen, LineChart, Building2,
  Compass, MessageSquare, Crown, RefreshCw, TrendingUp, Clock, Lock,
} from 'lucide-react';
import { LEADERSHIP_TRACKS } from '@/lib/readinessAssessmentEngine';
import ProductDemo from '@/components/landing/ProductDemo';
import ExecPersonalizedPreview from '@/components/readiness-assessment/ExecPersonalizedPreview';
import ExecutiveJourneyVisual from '@/components/readiness-assessment/ExecutiveJourneyVisual';
import ExecActivationSequence from '@/components/readiness-assessment/ExecActivationSequence';
import ExecutiveReadinessSample from '@/components/readiness-assessment/ExecutiveReadinessSample';

const ICONS = {
  technology: Cpu, digital_transformation: Sparkles, business: Briefcase, finance: DollarSign,
  hr: Users, sales_marketing: Megaphone, product: Lightbulb, government: Landmark,
  healthcare: HeartPulse, education: GraduationCap, custom: Target,
};

const TRACK_DESCRIPTIONS = {
  technology: 'Lead enterprise technology strategy, innovation, architecture, cybersecurity, AI transformation, and digital business initiatives.',
  digital_transformation: 'Drive organizational change, innovation, modernization, AI adoption, and enterprise transformation initiatives.',
  business: 'Lead operations, organizational strategy, growth, execution, and enterprise performance.',
  finance: 'Lead financial strategy, capital allocation, risk management, and enterprise value creation.',
  hr: 'Lead talent, culture, organizational design, and human capital strategy at the executive level.',
  sales_marketing: 'Lead revenue growth, brand, go-to-market strategy, and commercial performance.',
  product: 'Lead product vision, innovation, and customer-driven growth across the enterprise.',
  government: 'Lead public-sector strategy, policy execution, and citizen-impact initiatives.',
  healthcare: 'Lead clinical, operational, and patient-centered transformation in healthcare organizations.',
  education: 'Lead academic, institutional, and learning transformation in education.',
  custom: 'Define your own executive leadership destination and we will personalize the journey.',
};

const FEATURED = ['technology', 'digital_transformation', 'business'];

const MODULE_CARDS = [
  { icon: Gauge, name: 'Executive Readiness™', outcome: 'Understand your executive strengths and gaps.' },
  { icon: Brain, name: 'AI Executive Coach™', outcome: 'Receive personalized executive coaching.' },
  { icon: Swords, name: 'Executive Simulations™', outcome: 'Practice real executive scenarios.' },
  { icon: Map, name: 'Executive Roadmap™', outcome: 'Build your personalized 90-day plan.' },
  { icon: Route, name: 'Executive Journey™', outcome: 'Track your leadership evolution.' },
  { icon: Share2, name: 'Executive Identity Graph™', outcome: 'Create your living executive identity.' },
  { icon: BookOpen, name: 'Executive Success Stories™', outcome: 'Transform achievements into executive narratives.' },
  { icon: FolderOpen, name: 'Executive Portfolio™', outcome: 'Build a shareable executive portfolio.' },
  { icon: LineChart, name: 'Promotion Forecast™', outcome: 'Estimate readiness for your next leadership role.' },
  { icon: Building2, name: 'Company Intelligence™', outcome: 'Learn how executive leaders succeed in target companies.' },
];

const UNLOCKS = MODULE_CARDS.map((m) => m.name);

const OUTCOMES = [
  { icon: Compass, label: 'Think More Strategically' },
  { icon: MessageSquare, label: 'Strengthen Executive Communication' },
  { icon: Crown, label: 'Improve Leadership Presence' },
  { icon: RefreshCw, label: 'Lead Organizational Change' },
  { icon: Shield, label: 'Build Executive Confidence' },
  { icon: TrendingUp, label: 'Accelerate Promotion Readiness' },
];

const CONFIDENCE = ['Personalized Assessment', 'Adaptive AI Coaching', 'Secure & Private', 'Update Goals Anytime'];

const PATH_COMPETENCIES = {
  technology: ['Strategic Technology Leadership', 'Executive Communication', 'Enterprise Decision Making', 'Digital Transformation', 'Executive Presence', 'Organizational Leadership'],
  digital_transformation: ['Digital Strategy', 'Change Leadership', 'AI Adoption', 'Executive Communication', 'Innovation Leadership', 'Organizational Transformation'],
  business: ['Business Strategy', 'Operational Leadership', 'Executive Communication', 'Enterprise Decision Making', 'Financial Acumen', 'Organizational Leadership'],
  finance: ['Financial Strategy', 'Capital Allocation', 'Executive Communication', 'Enterprise Risk', 'Business Acumen', 'Organizational Leadership'],
  hr: ['Talent Strategy', 'Organizational Design', 'Executive Communication', 'Culture Leadership', 'Change Management', 'People Analytics'],
  sales_marketing: ['Commercial Strategy', 'Revenue Leadership', 'Brand & Go-to-Market', 'Executive Communication', 'Customer Insight', 'Organizational Leadership'],
  product: ['Product Vision', 'Innovation Leadership', 'Customer Insight', 'Executive Communication', 'Strategic Thinking', 'Organizational Leadership'],
  government: ['Public-Sector Strategy', 'Policy Leadership', 'Executive Communication', 'Stakeholder Engagement', 'Citizen Impact', 'Organizational Leadership'],
  healthcare: ['Clinical Leadership', 'Operational Transformation', 'Executive Communication', 'Patient-Centered Strategy', 'Change Leadership', 'Organizational Leadership'],
  education: ['Academic Leadership', 'Institutional Strategy', 'Executive Communication', 'Learning Transformation', 'Stakeholder Engagement', 'Organizational Leadership'],
  custom: ['Executive Communication', 'Strategic Thinking', 'Enterprise Decision Making', 'Leadership Presence', 'Organizational Leadership', 'Business Acumen'],
};

const EXEC_PROMISE = [
  'Executive Readiness Score™', 'Leadership Gap Analysis™', 'Executive Competency Radar™', 'AI Executive Roadmap™',
  'Personalized Executive Dashboard™', 'Executive Identity Profile™', 'Executive Coach™', 'Executive Journey™', 'Promotion Readiness™',
];

function deriveDestination(trackKey, role) {
  if (role) {
    const r = role.toLowerCase();
    if (/(chief|\bcio\b|\bcto\b|\bcfo\b|\bcmo\b|\bcpo\b|\bcoo\b|\bchro\b|\bcdo\b|c-level)/.test(r)) return 'C-Level Executive';
    if (/(vp|vice president)/.test(r)) return 'Vice President';
    if (/director/.test(r)) return 'Director';
    if (/head/.test(r)) return 'Director';
    if (/manager/.test(r)) return 'Manager';
    if (/lead/.test(r)) return 'Team Lead';
  }
  const defaults = { technology: 'C-Level Executive', digital_transformation: 'C-Level Executive', business: 'Vice President', finance: 'C-Level Executive', hr: 'C-Level Executive', sales_marketing: 'Vice President', product: 'Vice President', government: 'Director', healthcare: 'Director', education: 'Director', custom: 'Director' };
  return defaults[trackKey] || 'Director';
}

export default function LeadershipTrackSelector({ onSelect, saving }) {
  const [track, setTrack] = useState(null);
  const [role, setRole] = useState(null);
  const [customRole, setCustomRole] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  const [activating, setActivating] = useState(false);
  const [explainerOpen, setExplainerOpen] = useState(false);

  const handlePickTrack = (key) => { setTrack(key); setRole(null); setCustomRole(''); };
  const handlePickRole = (r) => setRole(r);
  const commit = () => {
    if (track === 'custom') {
      if (!customRole.trim()) return;
      onSelect('custom', customRole.trim());
    } else if (role) {
      onSelect(track, role);
    }
  };
  const handleContinue = () => {
    if (track === 'custom' && !customRole.trim()) return;
    if (track !== 'custom' && !role) return;
    setActivating(true);
  };

  const featuredTracks = FEATURED.map((k) => LEADERSHIP_TRACKS.find((t) => t.key === k)).filter(Boolean);
  const additionalTracks = LEADERSHIP_TRACKS.filter((t) => !FEATURED.includes(t.key));
  const selectedTrack = LEADERSHIP_TRACKS.find((t) => t.key === track);
  const destination = deriveDestination(track, role || customRole);

  const TrackCard = ({ t, featured }) => {
    const Icon = ICONS[t.key] || Target;
    const active = track === t.key;
    return (
      <button
        onClick={() => handlePickTrack(t.key)}
        className={`group relative text-left p-4 rounded-2xl border transition-all duration-300 ${active ? 'bg-accent-orange/10 border-accent-orange/45 shadow-lg shadow-accent-orange/10' : featured ? 'bg-white/[0.04] border-white/15 hover:border-accent-orange/30 hover:bg-white/[0.06]' : 'bg-white/[0.02] border-white/8 hover:border-white/20 hover:bg-white/[0.04]'}`}
      >
        {featured && !active && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-0.5 text-amber-400/70"><Star size={10} fill="currentColor" /></div>
        )}
        <div className="flex items-center justify-between mb-2.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${active ? 'bg-accent-orange/20' : featured ? 'bg-white/8 group-hover:bg-accent-orange/15' : 'bg-white/5'}`}>
            <Icon size={18} className={active ? 'text-accent-orange' : featured ? 'text-white/80 group-hover:text-accent-orange' : 'text-white/60'} />
          </div>
          {active && <Check size={15} className="text-accent-orange" />}
        </div>
        <div className={`text-[13px] font-semibold leading-tight ${active ? 'text-white' : featured ? 'text-white' : 'text-white/85'}`}>{t.label}</div>
        <div className="text-[10px] text-white/40 mt-1 leading-relaxed line-clamp-2">{TRACK_DESCRIPTIONS[t.key]}</div>
      </button>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8 lg:py-12">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/10 rounded-full text-[11px] text-white/60 font-medium mb-5">
          <Sparkles size={12} className="text-accent-orange" /> The Executive Leadership Operating System™
        </div>
        <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight leading-tight mb-4">
          Your Executive Leadership Journey <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent">Starts Here.</span>
        </h1>
        <p className="text-sm md:text-base text-white/55 max-w-2xl mx-auto leading-relaxed">
          Choose your target leadership path and EXECLEAD.AI will personalize your Executive Readiness
          Assessment™, AI coaching, executive simulations, competency roadmap, and Executive Identity
          Intelligence™ to accelerate your path toward executive leadership.
        </p>
      </div>

      {/* Executive Journey Visual */}
      <ExecutiveJourneyVisual destination={destination} />

      {/* Personalization preview — interactive module cards */}
      <div className="mb-9">
        <div className="text-center mb-4">
          <div className="text-[11px] uppercase tracking-wider text-indigo-400/80 font-semibold mb-1">Your Personalized Platform</div>
          <p className="text-[12px] text-white/45 max-w-xl mx-auto">Every module adapts to your leadership path{track ? ` — currently personalized for ${selectedTrack.label}` : ''}.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
          {MODULE_CARDS.map((m, i) => (
            <motion.div key={m.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={`group relative rounded-xl border p-3 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] ${track ? 'bg-accent-orange/[0.05] border-accent-orange/20' : 'bg-white/[0.03] border-white/8 hover:border-indigo-500/25'}`}>
              {track && <span className="absolute top-1.5 right-1.5 text-[8px] font-semibold text-accent-orange/70">✓</span>}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${track ? 'bg-accent-orange/15' : 'bg-white/5 group-hover:bg-indigo-500/15'}`}>
                <m.icon size={15} className={track ? 'text-accent-orange' : 'text-white/65 group-hover:text-indigo-400'} />
              </div>
              <div className="text-[11px] font-semibold text-white leading-tight">{m.name}</div>
              <div className="text-[9.5px] text-white/40 mt-0.5 leading-relaxed">{m.outcome}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Featured paths */}
      <div className="mb-2.5 flex items-center gap-2">
        <Star size={13} className="text-amber-400" />
        <div className="text-[11px] uppercase tracking-wider text-amber-400/80 font-semibold">Featured Paths</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {featuredTracks.map((t) => <TrackCard key={t.key} t={t} featured />)}
      </div>

      {/* Additional paths */}
      <div className="mb-2.5 text-[11px] uppercase tracking-wider text-white/35 font-semibold">Additional Paths</div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-7">
        {additionalTracks.map((t) => <TrackCard key={t.key} t={t} />)}
      </div>

      {/* Your Personalized Executive Journey */}
      <AnimatePresence>
        {track && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-gradient-to-br from-accent-orange/[0.06] to-transparent border border-accent-orange/25 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-2.5 mb-4 pb-4 border-b border-white/8">
              <div className="w-8 h-8 rounded-lg bg-accent-orange/15 flex items-center justify-center shrink-0"><Check size={15} className="text-accent-orange" /></div>
              <div>
                <div className="text-[13px] font-semibold text-white">{selectedTrack.label} selected.</div>
                <p className="text-[11.5px] text-white/55 leading-relaxed mt-0.5">
                  EXECLEAD.AI will personalize your Executive Readiness Assessment and AI coaching for future {selectedTrack.label.toLowerCase()} leaders.
                </p>
              </div>
            </div>

            {/* EXEC™ Personalized Preview */}
            <ExecPersonalizedPreview trackLabel={selectedTrack.label} competencies={PATH_COMPETENCIES[track]} />

            {/* Journey summary */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="rounded-xl bg-white/[0.03] border border-white/8 p-3">
                <div className="text-[9px] uppercase tracking-wider text-white/30 mb-1">Leadership Path</div>
                <div className="text-[11px] font-semibold text-white leading-tight">{selectedTrack.label}</div>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/8 p-3">
                <div className="text-[9px] uppercase tracking-wider text-white/30 mb-1">Assessment</div>
                <div className="text-[11px] font-semibold text-white leading-tight">Executive Readiness Assessment™</div>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/8 p-3">
                <div className="text-[9px] uppercase tracking-wider text-white/30 mb-1">Estimated Time</div>
                <div className="text-[11px] font-semibold text-white leading-tight flex items-center gap-1"><Clock size={11} className="text-accent-orange" /> 10 Minutes</div>
              </div>
            </div>

            {/* You'll unlock */}
            <div className="mb-4">
              <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2">You'll Unlock</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4">
                {UNLOCKS.map((u) => (
                  <div key={u} className="flex items-center gap-2 text-[11.5px] text-white/65"><Check size={12} className="text-emerald-400/80 shrink-0" /> {u}</div>
                ))}
              </div>
            </div>

            {/* Role selection */}
            <div className="text-[11px] uppercase tracking-wider text-white/40 mb-3">
              {track === 'custom' ? 'Enter your target executive role' : `Select your target role — ${selectedTrack.label}`}
            </div>
            {track === 'custom' ? (
              <input
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="e.g. Chief Data Officer, VP of Operations…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent-orange/40 mb-4"
              />
            ) : (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedTrack.roles.map((r) => {
                  const active = role === r;
                  return (
                    <button key={r} onClick={() => handlePickRole(r)}
                      className={`px-3.5 py-2 rounded-xl border text-sm transition-all ${active ? 'bg-accent-orange/15 border-accent-orange/40 text-white' : 'bg-white/[0.03] border-white/8 text-white/60 hover:border-white/20 hover:text-white'}`}>
                      {r}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Executive Promise™ */}
            <div className="mb-4 rounded-xl bg-white/[0.03] border border-white/8 p-4">
              <div className="text-[10px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">By the end of your assessment you'll receive</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4">
                {EXEC_PROMISE.map((p) => (
                  <div key={p} className="flex items-center gap-2 text-[11.5px] text-white/65"><Check size={12} className="text-emerald-400/80 shrink-0" /> {p}</div>
                ))}
              </div>
            </div>

            <button onClick={handleContinue} disabled={saving || (track === 'custom' ? !customRole.trim() : !role)}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-white text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-orange/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <>Start Executive Readiness Assessment™ <ArrowRight size={15} /></>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* What You'll Achieve */}
      <div className="mb-9">
        <div className="text-center mb-4">
          <h3 className="text-base font-bold text-white mb-1">What You'll Achieve</h3>
          <p className="text-[12px] text-white/45">Outcomes, not features — what changes in how you lead.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {OUTCOMES.map((o, i) => (
            <motion.div key={o.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-xl bg-white/[0.03] border border-white/8 p-3.5 hover:border-white/15 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500/15 to-accent-orange/10 flex items-center justify-center shrink-0"><o.icon size={16} className="text-indigo-300" /></div>
              <span className="text-[12px] font-medium text-white/80 leading-tight">{o.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Executive Readiness Preview™ — sample report */}
      <div className="mb-9">
        <div className="text-center mb-4">
          <h3 className="text-base font-bold text-white mb-1">A Glimpse of Your Report</h3>
          <p className="text-[12px] text-white/45">Every member receives a personalized Executive Readiness Report™.</p>
        </div>
        <ExecutiveReadinessSample />
      </div>

      {/* Social proof */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-7">
        <div className="rounded-2xl bg-white/[0.02] border border-white/8 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center"><Star size={18} className="text-amber-400" /></div>
          <div>
            <div className="text-[12px] font-semibold text-white">Private Beta · Founding Members</div>
            <p className="text-[11px] text-white/45 leading-relaxed">Early executive leaders are helping shape the future of EXECLEAD.AI.</p>
          </div>
        </div>
        <div className="rounded-2xl bg-white/[0.02] border border-white/8 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center"><BookOpen size={18} className="text-indigo-400" /></div>
          <div>
            <div className="text-[12px] font-semibold text-white flex items-center gap-2">Executive Success Stories™ <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/8 text-white/50">Coming Soon</span></div>
            <p className="text-[11px] text-white/45 leading-relaxed">Member transformation stories will appear here as the community grows.</p>
          </div>
        </div>
      </div>

      {/* CTA experience */}
      <div className="flex flex-col items-center mb-5">
        <button onClick={() => setShowDemo(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-transparent border border-white/15 text-white/75 text-sm font-medium hover:bg-white/5 hover:text-white transition-colors mb-4">
          <Play size={14} /> Watch 90-Second Demo
        </button>
        <div className="flex items-center gap-2 mb-4 text-[11px] text-white/40">
          <span>10 minutes</span><span className="text-white/15">•</span>
          <span>Personalized Results</span><span className="text-white/15">•</span>
          <span>AI-Powered Leadership Roadmap</span>
        </div>
        {/* Confidence indicators */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
          {CONFIDENCE.map((c) => (
            <div key={c} className="flex items-center gap-1.5 text-[11px] text-white/50">
              {c === 'Secure & Private' ? <Lock size={11} className="text-emerald-400/80" /> : <Check size={11} className="text-emerald-400/80" />}
              {c}
            </div>
          ))}
        </div>
      </div>

      {/* AI Personalization Explainer */}
      <div className="mb-5 max-w-2xl mx-auto">
        <button onClick={() => setExplainerOpen((o) => !o)}
          className="w-full flex items-center justify-between rounded-xl bg-white/[0.02] border border-white/8 px-4 py-2.5 text-left hover:bg-white/[0.04] transition-colors">
          <span className="flex items-center gap-2 text-[12px] text-white/70 font-medium"><Sparkles size={13} className="text-indigo-400" /> How does EXEC™ personalize my experience?</span>
          <span className="text-white/40 text-[14px]">{explainerOpen ? '−' : '+'}</span>
        </button>
        {explainerOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="rounded-b-xl bg-white/[0.02] border border-t-0 border-white/8 px-4 py-3 -mt-px">
            <p className="text-[11.5px] text-white/55 leading-relaxed mb-2">Your leadership path influences:</p>
            <div className="flex flex-wrap gap-1.5">
              {['Assessment questions', 'Executive Coach™', 'Leadership simulations', 'Company Intelligence', 'Career roadmap', 'Executive Identity™', 'Executive Success Stories™', 'Promotion Forecast™'].map((x) => (
                <span key={x} className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/8 text-[10px] text-white/55">{x}</span>
              ))}
            </div>
            <p className="text-[11px] text-white/40 leading-relaxed mt-2.5">Recommendations evolve continuously based on verified leadership evidence.</p>
          </motion.div>
        )}
      </div>

      {/* Trust message */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <Shield size={13} className="text-white/30" />
        <p className="text-[11.5px] text-white/40 text-center max-w-xl">
          Your selection creates a personalized Executive Leadership profile and can be updated anytime as your career goals evolve.
        </p>
      </div>

      {/* Microcopy */}
      <p className="text-center text-[11px] text-white/30 max-w-2xl mx-auto leading-relaxed">
        Your Executive Leadership profile continuously evolves through your coaching sessions, executive
        simulations, leadership achievements, and verified evidence—creating a living record of your growth.
      </p>

      <div className="text-center mt-6 text-[11px] text-white/25 tracking-wide">
        One Leadership Journey. One AI Platform. <span className="text-accent-orange/70">Become the Executive Every Organization Wants to Hire.</span>
      </div>

      <ProductDemo open={showDemo} onClose={() => setShowDemo(false)} />
      <ExecActivationSequence open={activating} onFinish={commit} />
    </div>
  );
}