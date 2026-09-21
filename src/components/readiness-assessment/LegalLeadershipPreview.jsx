import React from 'react';
import { Scale, Route, Swords, BookOpen, ShieldCheck, Check, TrendingUp } from 'lucide-react';
import {
  LEGAL_TRACK_LABEL,
  LEGAL_NOTICE,
  LEGAL_JOURNEY_STAGES,
  LEGAL_SIMULATION_TEMPLATES,
  LEGAL_ACADEMY_MODULE_TITLES,
  getLegalSpecialization,
} from '@/lib/legalLeadershipTrack';

/**
 * Legal Leadership Track™ preview — rendered inside the leadership-path
 * selector preview panel when the legal track is selected. Reuses the
 * existing preview card language (no separate visual language).
 * The specialization personalizes the preview (TEST 4).
 */
export default function LegalLeadershipPreview({ specializationLabel }) {
  const spec = getLegalSpecialization(specializationLabel);
  const sims = LEGAL_SIMULATION_TEMPLATES.slice(0, 3);

  return (
    <div className="space-y-3 mb-2">
      <div className="rounded-xl bg-indigo-500/[0.06] border border-indigo-500/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/15 flex items-center justify-center"><Scale size={14} className="text-indigo-300" /></div>
          <div className="text-[11px] uppercase tracking-wider text-indigo-300/80 font-semibold">{LEGAL_TRACK_LABEL}</div>
        </div>
        <p className="text-[11.5px] text-white/55 leading-relaxed">
          Your leadership journey is being personalized toward modern enterprise legal leadership.
        </p>
        {spec && (
          <div className="mt-3 pt-3 border-t border-white/8">
            <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5">Specialization</div>
            <div className="text-[12px] font-semibold text-white mb-2">{spec.label}</div>
            <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5">Executive Coach™ Focus</div>
            <div className="flex flex-wrap gap-1.5">
              {spec.coachFocus.map((f) => (
                <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-white/60">{f}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/[0.03] border border-white/8 p-3.5">
          <div className="flex items-center gap-1.5 mb-2"><Swords size={12} className="text-accent-orange" /><div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Recommended Simulations</div></div>
          <div className="space-y-1.5">
            {sims.map((s) => (
              <div key={s.id} className="flex items-start gap-1.5 text-[11px] text-white/65 leading-snug"><Check size={11} className="text-emerald-400/70 shrink-0 mt-0.5" /> {s.title}</div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-white/8 p-3.5">
          <div className="flex items-center gap-1.5 mb-2"><BookOpen size={12} className="text-accent-orange" /><div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Recommended Learning</div></div>
          <div className="space-y-1.5">
            {LEGAL_ACADEMY_MODULE_TITLES.slice(0, 3).map((m) => (
              <div key={m} className="flex items-start gap-1.5 text-[11px] text-white/65 leading-snug"><Check size={11} className="text-emerald-400/70 shrink-0 mt-0.5" /> {m}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white/[0.03] border border-white/8 p-3.5">
        <div className="flex items-center gap-1.5 mb-2.5"><Route size={12} className="text-accent-orange" /><div className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Executive Career Path — Developmental Framework</div></div>
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
          {LEGAL_JOURNEY_STAGES.map((s, i) => (
            <React.Fragment key={s.stage}>
              <div className="rounded-lg bg-white/[0.03] border border-white/8 px-2.5 py-1.5">
                <div className="text-[9px] uppercase tracking-wider text-accent-orange/70 font-semibold">{s.stage}</div>
                <div className="text-[10.5px] text-white/70 leading-tight">{s.role}</div>
              </div>
              {i < LEGAL_JOURNEY_STAGES.length - 1 && <TrendingUp size={11} className="text-white/25 rotate-90 shrink-0" />}
            </React.Fragment>
          ))}
        </div>
        <p className="text-[10px] text-white/35 mt-2.5 leading-relaxed">A developmental framework — completion never guarantees promotion.</p>
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-amber-500/[0.05] border border-amber-500/20 p-3">
        <ShieldCheck size={13} className="text-amber-400/80 shrink-0 mt-0.5" />
        <p className="text-[10.5px] text-amber-100/60 leading-relaxed">{LEGAL_NOTICE}</p>
      </div>
    </div>
  );
}