import React, { useState } from "react";
import { getTierById, getBadgeById } from "@/lib/reputationSystem";

export default function ReputationBadges({ score = 0, tier = 'new_member', badges = [], compact = false, context = {} }) {
  const [hovered, setHovered] = useState(null);

  const tierConfig = getTierById(tier);
  const earnedBadges = badges.map(b => {
    const config = getBadgeById(b.id);
    return config ? { ...config, earned_at: b.earned_at, reason: b.reason } : null;
  }).filter(Boolean);

  const renderTooltip = (title, icon, color, description, requirement, earnedAt, reason) => (
    <span className="absolute bottom-full left-0 mb-1 z-30 bg-[#0d0d14] border border-white/10 rounded-lg p-3 shadow-xl whitespace-nowrap min-w-[220px] max-w-[280px]">
      <div className={`text-xs font-semibold ${color} flex items-center gap-1`}>{icon} {title}</div>
      <div className="text-white/40 text-[10px] mt-1">{description}</div>
      <div className="text-white/30 text-[10px] mt-1">Requirement: {requirement}</div>
      {earnedAt && (
        <div className="text-white/30 text-[10px] mt-1">Earned: {new Date(earnedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
      )}
      {reason && (
        <div className="text-white/40 text-[10px] mt-1.5 pt-1.5 border-t border-white/5">
          <span className="text-white/30">Reason: </span>{reason}
        </div>
      )}
      {score > 0 && (
        <div className="mt-1.5 pt-1.5 border-t border-white/5 space-y-0.5">
          <div className="text-[10px] flex justify-between"><span className="text-white/30">Executive Reputation</span><span className="text-white/60 font-medium">{score}</span></div>
          {context.trustScore != null && <div className="text-[10px] flex justify-between"><span className="text-white/30">Community Trust</span><span className="text-white/60 font-medium">{context.trustScore}</span></div>}
          {context.leadershipLevel && <div className="text-[10px] flex justify-between"><span className="text-white/30">Leadership Level</span><span className="text-white/60 font-medium">{context.leadershipLevel}</span></div>}
        </div>
      )}
    </span>
  );

  return (
    <div className="inline-flex items-center gap-1 flex-wrap">
      <span className="relative inline-flex" onMouseEnter={() => setHovered('tier')} onMouseLeave={() => setHovered(null)}>
        <span className={`px-1.5 py-0.5 rounded border text-[9px] font-medium cursor-default ${tierConfig.bg} ${tierConfig.border} ${tierConfig.color}`}>
          {tierConfig.icon} {!compact && tierConfig.name}
        </span>
        {hovered === 'tier' && renderTooltip(tierConfig.name, tierConfig.icon, tierConfig.color, tierConfig.description, tierConfig.requirements, null, null)}
      </span>
      {earnedBadges.map((badge) => (
        <span key={badge.id} className="relative inline-flex" onMouseEnter={() => setHovered(badge.id)} onMouseLeave={() => setHovered(null)}>
          <span className={`inline-flex items-center px-1 py-0.5 rounded border text-[9px] ${badge.bg} ${badge.border} ${badge.color} cursor-default`}>
            {badge.icon}
          </span>
          {hovered === badge.id && renderTooltip(badge.name, badge.icon, badge.color, badge.description, badge.requirement, badge.earned_at, badge.reason)}
        </span>
      ))}
    </div>
  );
}