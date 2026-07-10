import React, { useState } from "react";
import { REPUTATION_TIERS, SPECIAL_BADGES, getTierById, getBadgeById } from "@/lib/reputationSystem";

export default function ReputationBadges({ score, tier, badges = [], compact = false }) {
  const [hovered, setHovered] = useState(null);

  const tierConfig = getTierById(tier);
  const earnedBadges = badges.map(b => {
    const config = getBadgeById(b.id);
    return config ? { ...config, earned_at: b.earned_at } : null;
  }).filter(Boolean);

  return (
    <div className="inline-flex items-center gap-1 flex-wrap">
      {/* Tier badge */}
      <span
        className="relative inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-[9px] font-medium cursor-default"
        onMouseEnter={() => setHovered('tier')}
        onMouseLeave={() => setHovered(null)}
        style={{}}
      >
        <span className={`${tierConfig.bg} ${tierConfig.border} ${tierConfig.color} px-1.5 py-0.5 rounded border`}>
          {tierConfig.icon} {!compact && tierConfig.name}
        </span>
        {hovered === 'tier' && (
          <span className="absolute bottom-full left-0 mb-1 z-20 bg-[#0d0d14] border border-white/10 rounded-lg p-2 shadow-xl whitespace-nowrap min-w-[180px]">
            <div className={`text-xs font-semibold ${tierConfig.color}`}>{tierConfig.icon} {tierConfig.name}</div>
            <div className="text-white/40 text-[10px] mt-0.5">{tierConfig.description}</div>
            <div className="text-white/30 text-[10px] mt-1">Requirement: {tierConfig.requirements}</div>
          </span>
        )}
      </span>

      {/* Special badges */}
      {earnedBadges.map((badge) => (
        <span
          key={badge.id}
          className="relative inline-flex items-center"
          onMouseEnter={() => setHovered(badge.id)}
          onMouseLeave={() => setHovered(null)}
        >
          <span className={`inline-flex items-center px-1 py-0.5 rounded border text-[9px] ${badge.bg} ${badge.border} ${badge.color} cursor-default`}>
            {badge.icon}
          </span>
          {hovered === badge.id && (
            <span className="absolute bottom-full left-0 mb-1 z-20 bg-[#0d0d14] border border-white/10 rounded-lg p-2 shadow-xl whitespace-nowrap min-w-[200px]">
              <div className={`text-xs font-semibold ${badge.color}`}>{badge.icon} {badge.name}</div>
              <div className="text-white/40 text-[10px] mt-0.5">{badge.description}</div>
              <div className="text-white/30 text-[10px] mt-1">Requirement: {badge.requirement}</div>
              {badge.earned_at && (
                <div className="text-white/20 text-[9px] mt-1">Earned: {new Date(badge.earned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              )}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}