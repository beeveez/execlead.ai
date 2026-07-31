import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { LEADERSHIP_TRACKS } from '@/lib/readinessAssessmentEngine';
import { COMPETENCY_LIBRARY } from '@/lib/competencyCatalog';
import { COURSES } from '@/lib/courseCatalog';
import { MODULE_PERSONA_OVERRIDES } from '@/lib/execModulePersonas';

const PLATFORM_MODULES = 18;

function fmt(n) { return (n || 0).toLocaleString(); }

export default function SocialProofLive() {
  const [live, setLive] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke('getLandingStats', {});
        setLive(res?.data || null);
      } catch (e) { setLive(null); }
      setLoaded(true);
    })();
  }, []);

  const metrics = [
    { label: 'Leadership Paths', value: LEADERSHIP_TRACKS.length },
    { label: 'AI Personas', value: MODULE_PERSONA_OVERRIDES.length },
    { label: 'Executive Simulations', value: live?.simulations ?? 0 },
    { label: 'Learning Paths', value: COURSES.length },
    { label: 'Companies', value: live?.companies ?? 0 },
    { label: 'Executive Competencies', value: COMPETENCY_LIBRARY.length },
    { label: 'Success Stories', value: live?.stories ?? 0 },
    { label: 'Executive Identities', value: live?.identities ?? 0 },
    { label: 'Evidence Records', value: live?.evidence ?? 0 },
    { label: 'Platform Modules', value: PLATFORM_MODULES },
  ];

  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 border-t border-white/5 bg-white/[0.015]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">Live Platform Metrics</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">A Living Operating System. Measured Continuously.</h2>
          <p className="text-white/45 max-w-2xl mx-auto text-sm">Real numbers from the Executive Leadership Operating System™ — read dynamically from platform data.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 text-center">
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-300 to-accent-orange bg-clip-text text-transparent mb-1">{fmt(m.value)}</div>
              <div className="text-[11px] text-white/45 leading-tight">{m.label}</div>
            </div>
          ))}
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