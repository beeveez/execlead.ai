import React from "react";
import { COMMUNITY_AWARDS, parseJSON } from "@/lib/reputationSystem";
import { History, Award, BookOpen, Star, GraduationCap, Shield, TrendingUp } from "lucide-react";

export default function ReputationTimeline({ reputation, history = [] }) {
  if (!reputation) return null;

  const recognitions = parseJSON(reputation.monthly_recognitions_json, []);

  // Build timeline events from audit history + recognitions
  const events = [];

  history.forEach((h) => {
    let icon = '📊';
    let type = h.action_type || h.source;
    if (h.source === 'badge_earned') { icon = '🎉'; type = 'badge_earned'; }
    else if (h.source === 'badge_revoked') { icon = '❌'; type = 'badge_revoked'; }
    else if (h.source === 'manual_adjustment') { icon = '✏️'; type = 'score_adjusted'; }
    else if (h.source === 'community_recognition') { icon = '🏆'; type = 'award'; }
    else if (h.source === 'suspension') { icon = '⚠️'; type = 'suspended'; }
    else if (h.source === 'restoration') { icon = '✅'; type = 'restored'; }
    else if (h.source === 'feature') { icon = '⭐'; type = 'featured'; }
    else if (h.source === 'recalculation') { icon = '📊'; type = 'recalculated'; }

    events.push({
      timestamp: h.timestamp,
      icon,
      type,
      title: h.reason || h.action_type || 'Reputation update',
      scoreChange: h.change_amount,
      prevScore: h.previous_score,
      newScore: h.new_score,
      reviewer: h.reviewer_name,
    });
  });

  // Sort by timestamp descending
  events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const typeColors = {
    badge_earned: 'text-emerald-400',
    badge_revoked: 'text-red-400',
    score_adjusted: 'text-blue-400',
    award: 'text-amber-400',
    suspended: 'text-red-400',
    restored: 'text-emerald-400',
    featured: 'text-yellow-400',
    recalculated: 'text-indigo-400',
  };

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <History size={14} className="text-indigo-400" />
          <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Reputation Timeline</h3>
        </div>
        {events.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-8">No reputation events yet. Start contributing to build your timeline.</p>
        ) : (
          <div className="relative pl-6">
            {/* Vertical line */}
            <div className="absolute left-2 top-0 bottom-0 w-px bg-white/5" />
            <div className="space-y-4">
              {events.slice(0, 50).map((event, i) => (
                <div key={i} className="relative">
                  {/* Dot */}
                  <div className="absolute -left-4 top-1 w-3 h-3 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[8px]">
                    {event.icon}
                  </div>
                  <div className="bg-white/[0.02] rounded-lg p-3 hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className={`text-xs font-medium ${typeColors[event.type] || 'text-white/60'}`}>{event.title}</span>
                      {event.scoreChange !== 0 && (
                        <span className={`text-[10px] font-semibold ${event.scoreChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {event.scoreChange > 0 ? '+' : ''}{event.scoreChange} pts
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-white/30">
                      <span>{new Date(event.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      {event.reviewer && <span>· by {event.reviewer}</span>}
                      {event.scoreChange !== 0 && <span>· {event.prevScore} → {event.newScore}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Community Awards */}
      {recognitions.length > 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Award size={14} className="text-amber-400" />
            <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider">Community Awards ({recognitions.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {recognitions.map((r, i) => {
              const award = COMMUNITY_AWARDS.find(a => a.id === r.type);
              return (
                <div key={i} className="bg-white/[0.02] rounded-lg p-3 flex items-center gap-2">
                  <span className="text-lg">{award?.icon || '🏆'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-white/70 text-xs font-medium truncate">{award?.name || r.title || r.type}</div>
                    <div className="text-white/30 text-[10px]">{r.month}/{r.year}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}