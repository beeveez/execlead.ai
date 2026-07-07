import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Gift, Users, UserPlus, DollarSign, Building2, Copy, Check } from "lucide-react";
import { getUserReferralCode, getShareUrl, getQrUrl, DEFAULT_REFERRAL_REWARDS } from "@/lib/socialShare";
import ShareButton from "@/components/social/ShareButton";

export default function ReferralDashboard({ user }) {
  const [referrals, setReferrals] = useState([]);
  const [rewards, setRewards] = useState(DEFAULT_REFERRAL_REWARDS);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const load = async () => {
      try {
        const refs = await base44.entities.Referral.filter({ referrer_user_id: user.id });
        setReferrals(refs);
        const dbRewards = await base44.entities.ReferralReward.filter({ is_active: true }, "sort_order", 20);
        if (dbRewards?.length > 0) setRewards(dbRewards);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, [user]);

  const referralCode = user ? getUserReferralCode(user.id) : null;
  const referralLink = referralCode ? getShareUrl(referralCode) : "";
  const signups = referrals.filter(r => r.status === "registered" || r.status === "converted").length;
  const stats = [
    { label: "Invites", value: referrals.length, icon: Users, color: "text-cyan-400" },
    { label: "Signups", value: signups, icon: UserPlus, color: "text-indigo-400" },
    { label: "Paid Users", value: referrals.filter(r => r.status === "converted").length, icon: DollarSign, color: "text-emerald-400" },
    { label: "Enterprise", value: referrals.filter(r => r.converted_plan === "enterprise").length, icon: Building2, color: "text-violet-400" },
  ];

  const copyLink = () => {
    try { navigator.clipboard.writeText(referralLink); } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-xl p-5">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <img src={getQrUrl(referralLink)} alt="Referral QR" className="w-20 h-20 rounded-lg shrink-0" />
          <div className="flex-1 w-full">
            <label className="text-white/40 text-xs uppercase tracking-wider mb-1 block">Your Referral Link</label>
            <div className="flex gap-2">
              <input readOnly value={referralLink} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 focus:outline-none truncate" />
              <button onClick={copyLink} className="flex items-center gap-1 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium transition-colors whitespace-nowrap">
                {copied ? <Check size={12} /> : <Copy size={12} />} {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="mt-2">
              <ShareButton shareType="referral" label="Share Referral" className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <s.icon size={16} className={s.color} />
            <div className="text-2xl font-bold text-white mt-2">{s.value}</div>
            <div className="text-white/30 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2"><Gift size={14} className="text-amber-400" /> Referral Rewards</h3>
        <div className="grid md:grid-cols-3 gap-3">
          {rewards.map((reward, i) => {
            const earned = signups >= reward.required_referrals;
            return (
              <div key={i} className={`rounded-xl p-4 border ${earned ? "bg-emerald-500/5 border-emerald-500/20" : "bg-white/[0.02] border-white/5"}`}>
                <div className="flex items-center justify-between mb-2">
                  <Gift size={18} className={earned ? "text-emerald-400" : "text-amber-400"} />
                  {earned && <Check size={14} className="text-emerald-400" />}
                </div>
                <h4 className="text-white font-semibold text-sm">{reward.name}</h4>
                <p className="text-white/40 text-xs mt-0.5">{reward.reward_description}</p>
                <div className="text-[10px] text-white/30 mt-2">{reward.required_referrals} referral{reward.required_referrals > 1 ? "s" : ""} needed</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}