import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Activity, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const STAT_KEYS = [
  { key: 'readinessJourneys', label: 'Leadership Journeys Started' },
  { key: 'simulationsCompleted', label: 'Executive Simulations Completed' },
  { key: 'evidenceRecords', label: 'Evidence Records Generated' },
  { key: 'executiveStories', label: 'Executive Stories Created' },
  { key: 'executiveIdentities', label: 'Executive Identities Built' },
];

function fmt(n) { return (n || 0).toLocaleString(); }

export default function SocialProofLive() {
  const [stats, setStats] = useState(null);
  const [stories, setStories] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke('getLandingStats', {});
        setStats(res?.data || null);
      } catch (e) { setStats(null); }
      try {
        const r = await base44.entities.ExecutiveSuccessStory.filter({ published: true }, '-generated_date', 3);
        setStories(r || []);
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  const hasNumbers = stats && Object.values(stats).some((v) => v > 0);

  return (
    <section className="py-20 md:py-28 px-6 lg:px-8 border-t border-white/5 bg-white/[0.015]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-[11px] uppercase tracking-wider text-accent-orange/80 font-semibold mb-2">Live Platform</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Evidence Is Already Being Built.</h2>
          <p className="text-white/45 max-w-2xl mx-auto text-sm">Real numbers from the Executive Leadership Operating System™ — updated continuously.</p>
        </div>

        {hasNumbers ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
            {STAT_KEYS.map((s) => (
              <div key={s.key} className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 text-center">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-300 to-accent-orange bg-clip-text text-transparent mb-1">{fmt(stats[s.key])}</div>
                <div className="text-[11px] text-white/45 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto rounded-2xl border border-white/8 bg-white/[0.02] p-8 text-center mb-12">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4"><BookOpen size={22} className="text-amber-400" /></div>
            <div className="text-[13px] font-semibold text-white mb-2">Executive Success Stories™ — Coming Soon</div>
            <p className="text-sm text-white/45 leading-relaxed">Founding Members are creating the first evidence-based leadership journeys. Their verified stories will appear here as the community grows.</p>
          </div>
        )}

        {stories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {stories.map((st) => (
              <Link key={st.id} to={`/success-stories/${st.id}`} className="rounded-2xl border border-white/8 bg-white/[0.02] hover:border-accent-orange/25 p-5 transition-colors">
                <div className="text-[11px] text-accent-orange/70 font-semibold mb-2 uppercase tracking-wider">Verified Story</div>
                <div className="text-[14px] font-semibold text-white mb-2 leading-tight">{st.title}</div>
                <p className="text-[11.5px] text-white/45 leading-relaxed line-clamp-3">{st.summary}</p>
              </Link>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-1.5 text-[11px] text-white/40"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Platform Live</div>
          <div className="flex items-center gap-1.5 text-[11px] text-white/40"><Activity size={12} /> Founding Private Beta</div>
          <div className="flex items-center gap-1.5 text-[11px] text-white/40"><TrendingUp size={12} /> Evidence-Based</div>
        </div>
      </div>
    </section>
  );
}