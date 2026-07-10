import React from "react";
import { EXECUTIVE_ACHIEVEMENTS, EXECUTIVE_MILESTONES, parseJSON } from "@/lib/reputationSystem";
import { Award, Target } from "lucide-react";

export default function AchievementsMilestones({ reputation }) {
  if (!reputation) return null;
  const earnedAchievements = parseJSON(reputation.achievements_json, []);
  const earnedMilestones = parseJSON(reputation.milestones_json, []);

  const achievementConfigs = earnedAchievements.map(a => {
    const config = EXECUTIVE_ACHIEVEMENTS.find(ea => ea.id === a.id);
    return config ? { ...config, earned_at: a.earned_at, reason: a.reason } : null;
  }).filter(Boolean);

  const milestoneConfigs = earnedMilestones.map(m => {
    const config = EXECUTIVE_MILESTONES.find(em => em.id === m.id);
    return config ? { ...config, earned_at: m.earned_at, value: m.value } : null;
  }).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Achievements */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Award size={14} className="text-indigo-400" />
          <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Executive Achievements ({achievementConfigs.length})</h3>
        </div>
        {achievementConfigs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {achievementConfigs.map((a) => (
              <div key={a.id} className="bg-white/[0.02] rounded-xl p-3 hover:bg-white/[0.04] transition-colors" title={`${a.name}: ${a.reason || a.requirement}`}>
                <div className="text-xl mb-1">{a.icon}</div>
                <div className={`text-[11px] font-medium ${a.color}`}>{a.name}</div>
                <div className="text-white/30 text-[9px] mt-0.5">{a.description}</div>
                {a.earned_at && <div className="text-white/20 text-[8px] mt-1">{new Date(a.earned_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/30 text-sm text-center py-4">No achievements earned yet. Contribute to unlock achievements!</p>
        )}
      </div>

      {/* Milestones */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target size={14} className="text-amber-400" />
          <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Executive Milestones ({milestoneConfigs.length})</h3>
        </div>
        {milestoneConfigs.length > 0 ? (
          <div className="space-y-2">
            {milestoneConfigs.map((m) => (
              <div key={m.id} className="flex items-center gap-3 bg-white/[0.02] rounded-lg p-2.5">
                <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-base flex-shrink-0">{m.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-white/70 text-xs font-medium">{m.name}</div>
                  <div className="text-white/30 text-[10px]">{m.description}</div>
                </div>
                {m.earned_at && <div className="text-white/20 text-[9px] flex-shrink-0">{new Date(m.earned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/30 text-sm text-center py-4">No milestones reached yet. Keep contributing!</p>
        )}
      </div>
    </div>
  );
}