import React from "react";
import { ShieldCheck, Crown } from "lucide-react";
import FoundingMemberBadge from "@/components/founding/FoundingMemberBadge";
import { calculateTrustLevel, TRUST_LEVELS } from "@/lib/trustEngine";

/**
 * Compact trust badge for profile display.
 * Shows the user's highest verified level.
 * Hover tooltip shows verification details.
 */
export default function TrustBadge({ verification, showTooltip = true }) {
  if (!verification) return null;

  const level = calculateTrustLevel(verification);
  if (level === 0) return null;

  const levelMeta = TRUST_LEVELS.find(l => l.level === level);
  if (!levelMeta) return null;

  const isIdentityVerified = verification.identity_verified;
  const isFounder = verification.founding_member;

  return (
    <div className="relative group inline-flex">
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium"
        style={{
          background: `${levelMeta.color}15`,
          borderColor: `${levelMeta.color}30`,
          color: levelMeta.color,
        }}
      >
        {level === 5 ? <Crown size={12} /> : <ShieldCheck size={12} />}
        {levelMeta.name}
      </div>

      {showTooltip && isIdentityVerified && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-[#0d0d14] border border-white/10 rounded-xl shadow-xl p-3 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
          <div className="text-white/80 text-xs font-semibold mb-1">✔ Identity Verified</div>
          <p className="text-white/40 text-[11px] leading-relaxed">
            Verified using government-issued identification.
          </p>
          {verification.identity_verified_date && (
            <p className="text-white/40 text-[11px] mt-1">
              Verified on: {new Date(verification.identity_verified_date).toLocaleDateString()}
            </p>
          )}
          {verification.identity_verified_method && (
            <p className="text-white/30 text-[10px] mt-1">
              Method: {verification.identity_verified_method === "manual_review" ? "Manual Review" : verification.identity_verified_method === "ai_assisted" ? "AI-Assisted" : "Third-Party Provider"}
            </p>
          )}
        </div>
      )}

      {isFounder && (
        <div className="ml-1.5">
          <FoundingMemberBadge />
        </div>
      )}
    </div>
  );
}