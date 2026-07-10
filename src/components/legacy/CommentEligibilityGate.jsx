import React, { useState } from "react";
import { Shield, Check, X, Star, FileText, Mail, UserCheck, Award, ScrollText } from "lucide-react";
import TrustBadge from "@/components/legacy/TrustBadge";

const REQUIREMENTS = [
  { key: "email", label: "Verified email", icon: Mail },
  { key: "standards", label: "Accepted Community Standards", icon: ScrollText },
  { key: "profile", label: "Profile completion ≥ 50%", icon: UserCheck },
  { key: "trust", label: "Community Trust Score ≥ 40", icon: Award },
  { key: "active", label: "Account in good standing", icon: Shield },
];

export default function CommentEligibilityGate({ eligibility, onAcceptStandards, accepting }) {
  const [showStandards, setShowStandards] = useState(false);
  const { reasons = [], trust_score = 0, trust_level = "limited", profile_completion = 0, community_standards_accepted = false } = eligibility;

  const status = {
    email: !reasons.some(r => r.includes("email")),
    standards: community_standards_accepted,
    profile: profile_completion >= 50,
    trust: trust_score >= 40,
    active: !reasons.some(r => r.includes("suspended") || r.includes("banned")),
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Shield size={14} className="text-indigo-400" />
        <h3 className="text-white/80 text-sm font-semibold">Commenting Eligibility</h3>
      </div>
      <p className="text-white/40 text-xs mb-3">Commenting is a privilege, not a right. Complete these requirements to participate in executive discussions.</p>

      <div className="flex items-center gap-2 mb-3 p-2 bg-white/[0.02] rounded-lg">
        <span className="text-white/40 text-xs">Your Trust:</span>
        <TrustBadge level={trust_level} score={trust_score} showLabel />
      </div>

      <div className="space-y-1.5 mb-3">
        {REQUIREMENTS.map((req) => {
          const met = status[req.key];
          const Icon = req.icon;
          return (
            <div key={req.key} className="flex items-center gap-2 text-xs">
              {met ? <Check size={12} className="text-emerald-400 flex-shrink-0" /> : <X size={12} className="text-red-400 flex-shrink-0" />}
              <Icon size={11} className={met ? "text-white/30" : "text-white/40"} />
              <span className={met ? "text-white/40 line-through" : "text-white/60"}>{req.label}</span>
              {req.key === "profile" && <span className="text-white/30 text-[10px]">({profile_completion}%)</span>}
            </div>
          );
        })}
      </div>

      {!community_standards_accepted && (
        showStandards ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 mb-2">
            <div className="text-white/60 text-xs font-medium mb-2">EXECLEAD.AI Community Principles</div>
            <ul className="space-y-1 mb-3">
              {["Be respectful.", "Challenge ideas, never individuals.", "Encourage constructive discussion.", "Share professional experiences.", "Avoid personal attacks.", "Support future leaders."].map((p, i) => (
                <li key={i} className="flex items-center gap-1.5 text-white/50 text-[11px]"><Check size={10} className="text-emerald-400" /> {p}</li>
              ))}
            </ul>
            <div className="flex gap-2">
              <button onClick={() => setShowStandards(false)} className="text-xs text-white/40 hover:text-white/60 px-3 py-1.5">Cancel</button>
              <button onClick={onAcceptStandards} disabled={accepting} className="flex-1 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-medium py-1.5 rounded-lg transition-colors">
                {accepting ? "Accepting..." : "I Agree & Accept"}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowStandards(true)} className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 text-sm font-medium py-2 rounded-lg transition-colors">
            Review & Accept Community Standards
          </button>
        )
      )}
    </div>
  );
}