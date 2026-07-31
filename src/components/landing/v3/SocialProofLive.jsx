import React, { useEffect, useState } from 'react';
import { Activity, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { LEADERSHIP_TRACKS } from '@/lib/readinessAssessmentEngine';
import { COURSES } from '@/lib/courseCatalog';
import { MODULE_PERSONA_OVERRIDES } from '@/lib/execModulePersonas';

function fmt(n) { return (n || 0).toLocaleString(); }

// Social proof evolves automatically as the platform matures:
// Founding Private Beta → Executive Success Stories™ → Verified Executive Outcomes™.
function currentStage(live) {
  if (live?.stories > 0) return 1; // Stories available
  return 0; // Founding Private Beta
}

const PIPELINE = [
  { key: 'beta', label: 'Founding Private Beta', desc: 'Founding members shaping the platform.' },
  { key: 'stories', label: 'Executive Success Stories™', desc: 'Anonymous leadership journeys & readiness improvements.' },
  { key: 'outcomes', label: 'Verified Executive Outcomes™', desc: 'Evidence, executive outcomes & promotion milestones.' },
];

export default function SocialProofLive() {
  const [live, setLive] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke('getLandingStats', {});
        setLive(res?.data || null);
      } catch (e) { setLive(null); }
    })();
  }, []);

  const stage = currentStage(live);

  // Live metrics show "Coming Soon" instead of zero until real activity exists.
  const metrics = [
    { label: 'Leadership Paths', value: LEADERSHIP_TRACKS.length, kind: 'catalog' },
    { label: 'AI Personas', value: MODULE_PERSONA_OVERRIDES.length, kind: 'catalog' },
    { label: 'Executive Simulations', value: live?.simulations ?? 0, kind: 'live' },
    { label: 'Learning Paths', value: COURSES.length, kind: 'catalog' },
    { label: 'Companies', value: live?.companies ?? 0, kind: 'live' },
    { label: 'Evidence Records', value: live?.evidence ?? 0, kind: 'live' },
    { label: 'Executive Journeys', value: live?.journeys ?? 0, kind: 'live' },
    { label: 'Executive Identities', value: live?.identities ?? 0, kind: 'live' },
    { label: 'Executive Stories', value: live?.stories ?? 0, kind: 'live' },
    { label: 'AI Conversations', value: live?.conversations ?? 0, kind: 'live' },
  ];

  const display = (m) => (m.kind === 'live' && !m.value) ? 'Coming Soon' : fmt(m.value);
  const isComing = (m) => m.kind === 'live' && !m.value;

  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 border-t border-white/5 bg-white/[0.015]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">Live Platform Metrics</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">A Living Operating System. Measured Continuously.</h2>
          <p className="text-white/45 max-w-2xl mx-auto text-sm">Real numbers from the Executive Leadership Operating System™ — read dynamically from platform data.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 text-center">
              <div className={`mb-1 ${isComing(m) ? 'text-sm font-semibold text-white/40' : 'text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-300 to-accent-orange bg-clip-text text-transparent'}`}>{display(m)}</div>
              <div className="text-[11px] text-white/45 leading-tight">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Evidence Pipeline — automatic evolution */}
        <div className="max-w-3xl mx-auto rounded-2xl border border-white/8 bg-white/[0.02] p-5">
          <div className="text-[10px] uppercase tracking-wider text-white/35 font-semibold text-center mb-4">Social Proof Evolution</div>
          <div className="flex items-center justify-center gap-2">
            {PIPELINE.map((p, i) => {
              const active = i === stage;
              const done = i < stage;
              return (
                <React.Fragment key={p.key}>
                  <div className="flex-1 text-center min-w-0">
                    <div className={`w-7 h-7 rounded-full mx-auto mb-1.5 flex items-center justify-center text-[10px] font-bold border-2 ${active ? 'bg-accent-orange border-accent-orange text-white' : done ? 'bg-accent-orange/20 border-accent-orange/40 text-accent-orange' : 'bg-[#0d0d14] border-white/15 text-white/40'}`}>{i + 1}</div>
                    <div className={`text-[10.5px] font-semibold leading-tight ${active ? 'text-white' : 'text-white/45'}`}>{p.label}</div>
                    <div className="text-[9px] text-white/30 leading-tight mt-0.5 hidden sm:block">{p.desc}</div>
                  </div>
                  {i < PIPELINE.length - 1 && <ArrowRight size={14} className="text-white/20 shrink-0" />}
                </React.Fragment>
              );
            })}
          </div>
          <p className="text-center text-[11px] text-white/40 mt-4">As members generate verified evidence, placeholders automatically become real leadership journeys and outcomes.</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8">
          <div className="flex items-center gap-1.5 text-[11px] text-white/40"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Platform Live</div>
          <div className="flex items-center gap-1.5 text-[11px] text-white/40"><Activity size={12} /> Founding Private Beta</div>
          <div className="flex items-center gap-1.5 text-[11px] text-white/40">Evidence-Based</div>
        </div>
      </div>
    </section>
  );
}