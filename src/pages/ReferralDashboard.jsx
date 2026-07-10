import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useSubscription } from "@/lib/SubscriptionContext";
import {
  generateReferralCode, getReferralUrl, ensureReferralCode,
} from "@/lib/referralEngine";
import {
  AMBASSADOR_LEVELS, getAmbassadorProgress, getRewardsForPlan,
  computeImpactScore, getReachedMilestones, getNextMilestone,
  REFERRAL_MILESTONES, AMBASSADOR_LANGUAGE,
} from "@/lib/ambassadorEngine";
import { getQrUrl } from "@/lib/socialShare";
import ShareButton from "@/components/social/ShareButton";
import {
  Users, Copy, Check, Loader2, Crown, Target, TrendingUp,
  Award, Gift, Sparkles, Star, Shield, Zap,
} from "lucide-react";

export default function ReferralDashboard() {
  const { user } = useAuth();
  const { subscription, membership } = useSubscription();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const referralCode = user ? generateReferralCode(user.id) : null;
  const referralLink = referralCode ? getReferralUrl(referralCode) : "";
  const isFoundingMember = Boolean(membership);
  const currentPlan = subscription?.planTier || "free";

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    if (referralCode) ensureReferralCode(user.id, referralCode);
    const load = async () => {
      try {
        const refs = await base44.entities.Referral.filter(
          { referrer_user_id: user.id }, "-created_date", 500
        );
        setReferrals(refs.filter(r => r.status !== "code_registered"));
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, [user?.id, referralCode]);

  const successfulReferrals = useMemo(
    () => referrals.filter(r => ["registered", "verified", "converted"].includes(r.status)).length,
    [referrals]
  );
  const convertedReferrals = useMemo(
    () => referrals.filter(r => r.status === "converted").length,
    [referrals]
  );

  const progress = useMemo(() => getAmbassadorProgress(convertedReferrals), [convertedReferrals]);
  const impact = useMemo(() => computeImpactScore(referrals), [referrals]);
  const reachedMilestones = useMemo(() => getReachedMilestones(convertedReferrals), [convertedReferrals]);
  const nextMilestone = useMemo(() => getNextMilestone(convertedReferrals), [convertedReferrals]);
  const currentRewards = useMemo(() => getRewardsForPlan(currentPlan, isFoundingMember), [currentPlan, isFoundingMember]);

  const copyLink = () => {
    try { navigator.clipboard.writeText(referralLink); } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-amber-400" /></div>;
  }

  const IMPACT_STATS = [
    { label: "People Introduced", value: impact.peopleIntroduced, icon: Users, color: "text-cyan-400" },
    { label: "Professionals Mentored", value: impact.professionalsMentored, icon: Star, color: "text-indigo-400" },
    { label: "Paid Members Generated", value: impact.paidMembersGenerated, icon: Target, color: "text-emerald-400" },
    { label: "Organizations Referred", value: impact.organizationsReferred, icon: Crown, color: "text-amber-400" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Sparkles size={12} className="text-amber-400" /> Executive Ambassador Program™
        </div>
        <h1 className="text-2xl font-bold text-white">Your Leadership Impact</h1>
        <p className="text-white/40 text-sm mt-1">
          Great leaders create more leaders. Share your link, introduce future executives, and earn platform value — not commissions.
        </p>
      </div>

      {/* Ambassador Level Card */}
      <div className="bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-transparent border border-amber-500/20 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          {/* Level Badge */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: `${progress.current.color}20`, border: `1px solid ${progress.current.color}40` }}>
              {progress.current.icon}
            </div>
            <div>
              <div className="text-white/30 text-xs uppercase tracking-wider">Ambassador Level</div>
              <div className="text-xl font-bold text-white">{progress.current.title}</div>
              <div className="text-white/40 text-xs mt-0.5">{progress.current.description}</div>
            </div>
          </div>

          {/* Progress to Next Level */}
          {progress.next && (
            <div className="flex-1 w-full md:ml-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/40 text-xs">Progress to {progress.next.title}</span>
                <span className="text-white/60 text-xs font-medium">{convertedReferrals} / {progress.next.minReferrals}</span>
              </div>
              <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${progress.progress}%` }} />
              </div>
              <p className="text-white/30 text-xs mt-1.5">{progress.referralsToNext} more {progress.referralsToNext === 1 ? "introduction" : "introductions"} to reach {progress.next.title} {progress.next.icon}</p>
            </div>
          )}
          {!progress.next && (
            <div className="flex-1 md:ml-6">
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 rounded-lg text-amber-400 text-sm font-medium w-fit">
                <Crown size={14} /> Highest Ambassador Level Achieved
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Referral Link + QR */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <img src={getQrUrl(referralLink)} alt="Referral QR" className="w-20 h-20 rounded-lg shrink-0" />
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 mb-1">
              <label className="text-white/40 text-xs uppercase tracking-wider">Your Ambassador Code</label>
              <span className="px-2 py-0.5 bg-amber-500/10 rounded text-amber-400 text-xs font-mono font-bold">{referralCode}</span>
              {isFoundingMember && (
                <span className="px-2 py-0.5 bg-amber-500/20 rounded text-amber-400 text-xs font-medium flex items-center gap-1">
                  <Crown size={10} /> Founder 1.5× Multiplier
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <input readOnly value={referralLink} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/60 focus:outline-none truncate" />
              <button onClick={copyLink} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors whitespace-nowrap">
                {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <ShareButton shareType="referral" label="Share Your Impact" className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400" />
              <span className="text-white/30 text-xs">90-day attribution · Last-click wins</span>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Score */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-indigo-400" />
          <h3 className="text-sm font-medium text-white/80">Executive Impact Score</h3>
          <span className="text-white/30 text-xs">— your leadership influence, not just numbers</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {IMPACT_STATS.map((s, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <s.icon size={16} className={s.color} />
              <div className="text-2xl font-bold text-white mt-2">{s.value}</div>
              <div className="text-white/30 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-white/40 text-xs">Estimated Lifetime Referral Impact</div>
            <div className="text-white/60 text-sm mt-0.5">Based on introductions, conversions, and organizations referred</div>
          </div>
          <div className="text-2xl font-bold text-amber-400">{impact.lifetimeImpact.toLocaleString()}</div>
        </div>
      </div>

      {/* Plan Rewards */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Gift size={16} className="text-amber-400" />
          <h3 className="text-sm font-medium text-white/80">{currentRewards.label}</h3>
          <span className="px-2 py-0.5 bg-white/5 rounded text-white/40 text-xs capitalize">{currentPlan} Plan</span>
        </div>
        <p className="text-white/40 text-xs mb-4">When a referral activates their account, both you and the new member receive platform value rewards — not cash.</p>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Referrer Rewards */}
          <div>
            <div className="text-white/30 text-[10px] uppercase tracking-widest mb-2">You Earn (Ambassador)</div>
            <div className="space-y-1.5">
              {currentRewards.referrer.journeyPoints > 0 && (
                <RewardRow icon="⭐" label="Journey Points" value={`+${currentRewards.referrer.journeyPoints}`} />
              )}
              {currentRewards.referrer.execCredits > 0 && (
                <RewardRow icon="🤖" label="EXEC™ Credits" value={`+${currentRewards.referrer.execCredits}`} />
              )}
              {currentRewards.referrer.reputation > 0 && (
                <RewardRow icon="🏆" label="Executive Reputation" value={`+${currentRewards.referrer.reputation}`} />
              )}
              {currentRewards.referrer.simulationCredits > 0 && (
                <RewardRow icon="🎯" label="Simulation Credits" value={`+${currentRewards.referrer.simulationCredits}`} />
              )}
              {currentRewards.referrer.professionalTrialDays > 0 && (
                <RewardRow icon="📅" label="Professional Features" value={`${currentRewards.referrer.professionalTrialDays} days`} />
              )}
              {currentRewards.referrer.professionalExtensionDays > 0 && (
                <RewardRow icon="📅" label="Plan Extension" value={`+${currentRewards.referrer.professionalExtensionDays} days`} />
              )}
              {currentRewards.referrer.priorityBetaAccess && (
                <RewardRow icon="🔓" label="Priority Beta Access" value="Enabled" />
              )}
              {currentRewards.referrer.webinarAccess && (
                <RewardRow icon="🎥" label="Executive Webinar" value="Access" />
              )}
              {currentRewards.referrer.earlyFeatureAccess && (
                <RewardRow icon="⚡" label="Early Feature Access" value="Enabled" />
              )}
              {currentRewards.referrer.organizationCredits && (
                <RewardRow icon="🏢" label="Organization Credits" value="Granted" />
              )}
              {currentRewards.referrer.seatDiscounts && (
                <RewardRow icon="💺" label="Seat Discounts" value="Applied" />
              )}
              {currentRewards.referrer.customerSuccessSession && (
                <RewardRow icon="🤝" label="Customer Success" value="Session" />
              )}
            </div>
          </div>
          {/* Invitee Rewards */}
          <div>
            <div className="text-white/30 text-[10px] uppercase tracking-widest mb-2">New Member Receives</div>
            <div className="space-y-1.5">
              {currentRewards.invitee.journeyPoints > 0 && (
                <RewardRow icon="⭐" label="Journey Points" value={`+${currentRewards.invitee.journeyPoints}`} />
              )}
              {currentRewards.invitee.execCredits > 0 && (
                <RewardRow icon="🤖" label="EXEC™ Credits" value={`+${currentRewards.invitee.execCredits}`} />
              )}
              {currentRewards.invitee.professionalTrialDays > 0 && (
                <RewardRow icon="📅" label="Professional Trial" value={`${currentRewards.invitee.professionalTrialDays} days`} />
              )}
              {currentRewards.invitee.executiveTrialDays > 0 && (
                <RewardRow icon="📅" label="Executive Trial" value={`${currentRewards.invitee.executiveTrialDays} days`} />
              )}
              {currentRewards.invitee.enterpriseTrialDays > 0 && (
                <RewardRow icon="📅" label="Enterprise Trial" value={`${currentRewards.invitee.enterpriseTrialDays} days`} />
              )}
              {currentRewards.invitee.badge && (
                <RewardRow icon="🏅" label="Welcome Badge" value={currentRewards.invitee.badge} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Award size={16} className="text-purple-400" />
          <h3 className="text-sm font-medium text-white/80">Ambassador Milestones</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {REFERRAL_MILESTONES.map(m => {
            const reached = convertedReferrals >= m.count;
            return (
              <div key={m.count} className={`rounded-xl p-4 border transition-all ${reached ? "bg-amber-500/5 border-amber-500/20" : "bg-white/[0.02] border-white/5 opacity-60"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{m.icon}</span>
                  <span className={`text-sm font-medium ${reached ? "text-amber-400" : "text-white/40"}`}>{m.title}</span>
                  {reached && <Check size={14} className="text-emerald-400 ml-auto" />}
                </div>
                <div className="text-white/30 text-xs">{m.count} successful {m.count === 1 ? "introduction" : "introductions"}</div>
                {reached && <div className="text-amber-400/60 text-xs mt-1">+{m.journeyPoints} Journey Points earned</div>}
                {!reached && nextMilestone?.count === m.count && (
                  <div className="text-white/40 text-xs mt-1">{m.count - convertedReferrals} to go</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* All Ambassador Levels */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Crown size={16} className="text-amber-400" />
          <h3 className="text-sm font-medium text-white/80">Ambassador Progression</h3>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {AMBASSADOR_LEVELS.map(l => {
            const reached = convertedReferrals >= l.minReferrals;
            const isCurrent = progress.current.id === l.id;
            return (
              <div key={l.id} className={`flex-shrink-0 rounded-xl p-3 border min-w-[140px] transition-all ${isCurrent ? "bg-amber-500/10 border-amber-500/30" : reached ? "bg-white/[0.03] border-white/10" : "bg-white/[0.02] border-white/5 opacity-50"}`}>
                <div className="text-2xl mb-1">{l.icon}</div>
                <div className={`text-xs font-medium ${isCurrent ? "text-amber-400" : reached ? "text-white/70" : "text-white/40"}`}>{l.title}</div>
                <div className="text-white/30 text-[10px] mt-0.5">{l.minReferrals}+ referrals</div>
                {isCurrent && <div className="text-amber-400 text-[10px] font-medium mt-1">← You are here</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Anti-Fraud Notice */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-start gap-3">
        <Shield size={16} className="text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <div className="text-white/60 text-sm font-medium">Fair & Authentic Community</div>
          <p className="text-white/40 text-xs mt-0.5">Rewards are only granted for verified, authentic accounts. Self-referrals, duplicate emails, temporary emails, and suspicious activity are automatically detected and blocked. This protects the integrity of the Executive Ambassador Program™ and ensures meaningful community growth.</p>
        </div>
      </div>

      {/* Referral Table */}
      <div>
        <h3 className="text-sm font-medium text-white/80 mb-3">Your Leadership Introductions</h3>
        <div className="overflow-x-auto bg-white/[0.02] border border-white/5 rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02]">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-white/40 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs text-white/40 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs text-white/40 uppercase">Plan</th>
                <th className="text-left px-4 py-3 text-xs text-white/40 uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map(r => (
                <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white/80">{r.invitee_name || r.invitee_email || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      r.status === "converted" ? "bg-emerald-500/10 text-emerald-400" :
                      r.status === "registered" ? "bg-indigo-500/10 text-indigo-400" :
                      r.status === "cancelled" ? "bg-red-500/10 text-red-400" :
                      "bg-white/5 text-white/40"
                    }`}>
                      {r.status === "converted" ? "Activated" :
                       r.status === "registered" ? "Joined" :
                       r.status === "cancelled" ? r.fraud_reason ? "Blocked" : "Cancelled" :
                       r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/40 text-xs capitalize">{r.converted_plan || "—"}</td>
                  <td className="px-4 py-3 text-white/30 text-xs">{r.registration_date ? new Date(r.registration_date).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
              {referrals.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-white/30 text-sm">No introductions yet. Share your link to begin your ambassador journey! 🌱</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RewardRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5 px-2 bg-white/[0.02] rounded-lg">
      <span className="text-white/50 text-xs flex items-center gap-1.5"><span>{icon}</span> {label}</span>
      <span className="text-white/80 text-xs font-medium">{value}</span>
    </div>
  );
}