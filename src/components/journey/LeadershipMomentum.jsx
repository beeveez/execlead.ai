import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Flame, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  computeConsecutiveWeeks, computeStrongestBehavioralTrend, computeMostImprovedCompetency,
} from '@/lib/leadershipActionIntelligence';

/**
 * Leadership Momentum — surfaces behavioral leadership intelligence on the
 * Executive Journey. Distinguishes members who consume content from members
 * who practice leadership behaviors and demonstrate sustained growth.
 */
export default function LeadershipMomentum() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    actionsCompleted: 0,
    consecutiveWeeks: 0,
    strongestTrend: { label: '—', value: 0 },
    mostImproved: { label: '—', value: 0 },
  });

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const me = await base44.auth.me();
        const uid = me?.id;
        if (!uid) { setLoading(false); return; }
        const [records, signals] = await Promise.all([
          base44.entities.BehavioralEvidenceRecord.filter({ user_id: uid }, '-recorded_at', 200).catch(() => []),
          base44.entities.CompetencyProgressSignal.filter({ user_id: uid }, '-recorded_at', 200).catch(() => []),
        ]);
        if (!active) return;
        const recs = records || [];
        const sigs = signals || [];
        const dates = recs.map((r) => r.recorded_at).filter(Boolean);
        setStats({
          actionsCompleted: recs.length,
          consecutiveWeeks: computeConsecutiveWeeks(dates),
          strongestTrend: computeStrongestBehavioralTrend(recs),
          mostImproved: computeMostImprovedCompetency(sigs),
        });
      } catch (e) {}
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const CARDS = [
    { icon: Zap, label: 'Actions Completed', value: stats.actionsCompleted, accent: 'text-accent-orange', bg: 'bg-accent-orange/15' },
    { icon: Flame, label: 'Consecutive Weeks Active', value: stats.consecutiveWeeks, accent: 'text-amber-400', bg: 'bg-amber-500/15' },
    { icon: TrendingUp, label: 'Strongest Behavioral Trend', value: stats.strongestTrend.label, accent: 'text-emerald-400', bg: 'bg-emerald-500/15', isText: true, sub: stats.strongestTrend.value ? `${stats.strongestTrend.value}/100` : null },
    { icon: Sparkles, label: 'Most Improved Competency', value: stats.mostImproved.label, accent: 'text-indigo-400', bg: 'bg-indigo-500/15', isText: true, sub: stats.mostImproved.value ? `${stats.mostImproved.value}/100` : null },
  ];

  return (
    <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-sm">Leadership Momentum</h3>
          <p className="text-[11px] text-white/40 mt-0.5">Behavioral leadership intelligence — practice, not just consumption.</p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-orange/10 border border-accent-orange/20 text-accent-orange font-semibold">Behavioral</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6"><Loader2 size={16} className="animate-spin text-white/40" /></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {CARDS.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <div className={`w-7 h-7 rounded-lg ${c.bg} flex items-center justify-center mb-2.5`}>
                <c.icon size={14} className={c.accent} />
              </div>
              <div className={`font-bold ${c.isText ? 'text-sm' : 'text-2xl'} ${c.isText ? c.accent : 'text-white'}`}>
                {c.value || (c.isText ? '—' : 0)}
              </div>
              <div className="text-[10px] text-white/45 mt-0.5 leading-tight">{c.label}</div>
              {c.sub && <div className="text-[9px] text-white/30 mt-0.5">{c.sub}</div>}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}