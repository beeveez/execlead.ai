import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu, Briefcase, DollarSign, Users, Megaphone, Lightbulb, Landmark, HeartPulse, GraduationCap,
  Target, ArrowRight, Loader2, Check, Star, Play, Sparkles, Shield,
} from 'lucide-react';
import { LEADERSHIP_TRACKS } from '@/lib/readinessAssessmentEngine';
import ProductDemo from '@/components/landing/ProductDemo';

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

const PERSONALIZES = [
  'Executive Readiness Assessment™', 'AI Executive Coach™', 'Executive Simulations™', 'Executive Roadmap™',
  'Company Intelligence™', 'Executive Journey™', 'Executive Identity Graph™', 'Executive Success Stories™',
  'Executive Portfolio™', 'Promotion Forecast™',
];

export default function LeadershipTrackSelector({ onSelect, saving }) {
  const [track, setTrack] = useState(null);
  const [role, setRole] = useState(null);
  const [customRole, setCustomRole] = useState('');
  const [showDemo, setShowDemo] = useState(false);

  const handlePickTrack = (key) => { setTrack(key); setRole(null); setCustomRole(''); };
  const handlePickRole = (r) => setRole(r);
  const handleContinue = () => {
    if (track === 'custom') {
      if (!customRole.trim()) return;
      onSelect('custom', customRole.trim());
    } else if (role) {
      onSelect(track, role);
    }
  };

  const featuredTracks = FEATURED.map((k) => LEADERSHIP_TRACKS.find((t) => t.key === k)).filter(Boolean);
  const additionalTracks = LEADERSHIP_TRACKS.filter((t) => !FEATURED.includes(t.key));
  const selectedTrack = LEADERSHIP_TRACKS.find((t) => t.key === track);

  const TrackCard = ({ t, featured }) => {
    const Icon = ICONS[t.key] || Target;
    const active = track === t.key;
    return (
      <button
        onClick={() => handlePickTrack(t.key)}
        className={`group relative text-left p-4 rounded-2xl border transition-all duration-300 ${active ? 'bg-accent-orange/10 border-accent-orange/45 shadow-lg shadow-accent-orange/10' : featured ? 'bg-white/[0.04] border-white/15 hover:border-accent-orange/30 hover:bg-white/[0.06]' : 'bg-white/[0.02] border-white/8 hover:border-white/20 hover:bg-white/[0.04]'}`}
      >
        {featured && !active && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-0.5 text-amber-400/70">
            <Star size={10} fill="currentColor" />
          </div>
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
      <div className="text-center mb-9">
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

      {/* Personalization preview */}
      <div className="mb-9 rounded-2xl bg-gradient-to-br from-indigo-500/[0.05] to-transparent border border-indigo-500/15 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center"><Target size={14} className="text-indigo-400" /></div>
          <div className="text-[12px] font-semibold text-white">Your selection personalizes the entire platform</div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PERSONALIZES.map((p) => (
            <span key={p} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/8 text-[10.5px] text-white/55">
              <Check size={9} className="text-emerald-400/80" /> {p}
            </span>
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

      {/* Selected path panel */}
      <AnimatePresence>
        {track && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-white/[0.03] border border-accent-orange/25 rounded-2xl p-5 mb-6">
            {/* Confirmation message */}
            <div className="flex items-start gap-2.5 mb-4 pb-4 border-b border-white/8">
              <div className="w-8 h-8 rounded-lg bg-accent-orange/15 flex items-center justify-center shrink-0"><Check size={15} className="text-accent-orange" /></div>
              <div>
                <div className="text-[13px] font-semibold text-white">{selectedTrack.label} selected.</div>
                <p className="text-[11.5px] text-white/55 leading-relaxed mt-0.5">
                  EXECLEAD.AI will personalize your Executive Readiness Assessment and AI coaching for future {selectedTrack.label.toLowerCase()} leaders.
                </p>
              </div>
            </div>

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

            <button onClick={handleContinue} disabled={saving || (track === 'custom' ? !customRole.trim() : !role)}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-white text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-orange/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <>Start Executive Readiness Assessment™ <ArrowRight size={15} /></>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secondary CTA */}
      <div className="flex flex-col items-center mb-5">
        <button onClick={() => setShowDemo(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-transparent border border-white/15 text-white/75 text-sm font-medium hover:bg-white/5 hover:text-white transition-colors">
          <Play size={14} /> Watch 90-Second Demo
        </button>
        <div className="flex items-center gap-2 mt-3 text-[11px] text-white/40">
          <span>10 minutes</span><span className="text-white/15">•</span>
          <span>Personalized Results</span><span className="text-white/15">•</span>
          <span>AI-Powered Roadmap</span>
        </div>
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
    </div>
  );
}