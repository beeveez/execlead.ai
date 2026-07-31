import React from "react";
import { motion } from "framer-motion";
import { History, Calendar, TrendingUp } from "lucide-react";

const STEP_LABELS = [
  'Assessment Completed', 'Simulation Completed', 'Leadership Evidence Added',
  'Executive Coaching Completed', 'Promotion Forecast Improved', 'Executive Readiness Increased',
];

/**
 * Evidence Timeline + Quarterly Snapshots — the living record of development.
 * Built from the member's ReadinessAssessment history.
 */
export default function EvidenceTimeline({ history, snapshots }) {
  return (
    <div className="space-y-5">
      {/* Evidence timeline */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white/[0.02] border border-white/8 p-5">
        <div className="flex items-center gap-2 mb-4"><History size={15} className="text-amber-400" /><div><div className="text-[10px] uppercase tracking-wider text-white/30">Living Record</div><h3 className="text-sm font-semibold text-white">Evidence Timeline</h3></div></div>
        {history?.length ? (
          <div className="relative pl-5">
            <div className="absolute left-1.5 top-1 bottom-1 w-px bg-white/10" />
            {history.map((r, i) => (
              <div key={r.id || i} className="relative mb-3 last:mb-0">
                <span className="absolute -left-[14px] top-1 w-2.5 h-2.5 rounded-full bg-accent-orange border-2 border-[#0a0a0f]" />
                <div className="text-[11px] text-white/75 font-medium">Assessment — {r.overall_score}% · {r.classification_label}</div>
                <div className="text-[10px] text-white/35">{r.completed_at ? new Date(r.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-white/40">Your evidence timeline begins now. Complete simulations, coaching, and learning to grow this record.</p>
        )}
      </motion.div>

      {/* Quarterly snapshots */}
      {snapshots?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white/[0.02] border border-white/8 p-5">
          <div className="flex items-center gap-2 mb-4"><Calendar size={15} className="text-indigo-400" /><div><div className="text-[10px] uppercase tracking-wider text-white/30">Quarterly Snapshots</div><h3 className="text-sm font-semibold text-white">Your Growth Over Time</h3></div></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {snapshots.map((q) => {
              const latest = q.items[q.items.length - 1];
              const first = q.items[0];
              const delta = (latest.overall_score || 0) - (first.overall_score || 0);
              return (
                <div key={q.quarter} className="rounded-xl bg-white/[0.03] border border-white/8 p-3">
                  <div className="text-[11px] font-semibold text-white mb-1">{q.quarter}</div>
                  <div className="text-[10px] text-white/40 mb-2">{q.items.length} assessment{q.items.length > 1 ? 's' : ''}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-white">{latest.overall_score}%</span>
                    {delta !== 0 && <span className={`flex items-center gap-0.5 text-[10px] font-medium ${delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}><TrendingUp size={10} className={delta >= 0 ? '' : 'rotate-180'} /> {delta >= 0 ? '+' : ''}{delta}</span>}
                  </div>
                  <div className="text-[10px] text-white/35 mt-0.5">{latest.classification_label}</div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}