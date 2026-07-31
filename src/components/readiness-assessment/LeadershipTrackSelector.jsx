import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu, Briefcase, DollarSign, Users, Megaphone, Lightbulb, Landmark, HeartPulse, GraduationCap,
  Target, ArrowRight, Loader2, Check,
} from 'lucide-react';
import { LEADERSHIP_TRACKS } from '@/lib/readinessAssessmentEngine';

const ICONS = {
  technology: Cpu, business: Briefcase, finance: DollarSign, hr: Users, sales_marketing: Megaphone,
  product: Lightbulb, government: Landmark, healthcare: HeartPulse, education: GraduationCap, custom: Target,
};

export default function LeadershipTrackSelector({ onSelect, saving }) {
  const [track, setTrack] = useState(null);
  const [role, setRole] = useState(null);
  const [customRole, setCustomRole] = useState('');

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

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-6 lg:py-10">
      <div className="text-center mb-7">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-orange/10 border border-accent-orange/25 rounded-full text-[11px] text-accent-orange font-semibold mb-3">
          <Target size={12} /> Step 1 · Choose Your Leadership Path
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-white mb-2">Which executive role are you building toward?</h1>
        <p className="text-sm text-white/50 max-w-lg mx-auto">Your leadership path personalizes your assessment, AI coaching, simulations, roadmap, and promotion forecast — all on one shared Executive Leadership framework.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-5">
        {LEADERSHIP_TRACKS.map((t) => {
          const Icon = ICONS[t.key] || Target;
          const active = track === t.key;
          return (
            <button key={t.key} onClick={() => handlePickTrack(t.key)}
              className={`text-left p-3.5 rounded-xl border transition-all ${active ? 'bg-accent-orange/10 border-accent-orange/40' : 'bg-white/[0.02] border-white/8 hover:border-white/20 hover:bg-white/[0.04]'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${active ? 'bg-accent-orange/20' : 'bg-white/5'}`}>
                  <Icon size={16} className={active ? 'text-accent-orange' : 'text-white/60'} />
                </div>
                {active && <Check size={14} className="text-accent-orange" />}
              </div>
              <div className="text-[13px] font-semibold text-white leading-tight">{t.label}</div>
              <div className="text-[10px] text-white/40 mt-0.5">{t.roles.length} roles</div>
            </button>
          );
        })}
      </div>

      {track && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
          <div className="text-[11px] uppercase tracking-wider text-white/40 mb-3">
            {track === 'custom' ? 'Enter your target executive role' : `Select your target role — ${LEADERSHIP_TRACKS.find((t) => t.key === track)?.label}`}
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
              {LEADERSHIP_TRACKS.find((t) => t.key === track)?.roles.map((r) => {
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
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-white text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <>Start Assessment <ArrowRight size={15} /></>}
          </button>
        </motion.div>
      )}
    </div>
  );
}