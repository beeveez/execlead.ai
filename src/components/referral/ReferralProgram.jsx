import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Gift, Users, TrendingUp, Copy, Check, Link2, ArrowRight, UserPlus, CheckCircle2 } from "lucide-react";
import { getUserReferralCode, getShareUrl, DEFAULT_REFERRAL_REWARDS } from "@/lib/socialShare";

const STEPS = [
  { icon: Link2, title: "Share Your Link", desc: "Send your unique referral link to colleagues and friends" },
  { icon: UserPlus, title: "They Join", desc: "Your referral signs up and starts their leadership journey" },
  { icon: Gift, title: "You Earn", desc: "Unlock free months, plan upgrades, and exclusive rewards" },
];

export default function ReferralProgram({ authed }) {
  const [user, setUser] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [rewards, setRewards] = useState(DEFAULT_REFERRAL_REWARDS);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authed) { setLoading(false); return; }
    const load = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        const refs = await base44.entities.Referral.filter({ referrer_user_id: me.id });
        setReferrals(refs);
        const dbRewards = await base44.entities.ReferralReward.filter({ is_active: true }, "sort_order", 20);
        if (dbRewards && dbRewards.length > 0) setRewards(dbRewards);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, [authed]);

  const referralCode = user ? getUserReferralCode(user.id) : null;
  const referralLink = referralCode ? getShareUrl(referralCode) : "";
  const stats = {
    invites: referrals.length,
    registrations: referrals.filter(r => r.status === "registered" || r.status === "converted").length,
    conversions: referrals.filter(r => r.status === "converted").length,
  };

  const handleCopy = () => {
    try { navigator.clipboard.writeText(referralLink); } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full mb-4">
          <Gift size={14} className="text-amber-400" />
          <span className="text-amber-400 text-xs font-medium">Refer & Earn</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Share Leadership, Earn Rewards</h2>
        <p className="text-white/40 max-w-2xl mx-auto text-lg">Invite colleagues to begin their executive leadership journey. Earn free months, plan upgrades, and exclusive rewards for every successful referral.</p>
      </div>

      {/* How it works */}
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {STEPS.map((step, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <step.icon size={20} className="text-amber-400" />
            </div>
            <div className="text-amber-400 text-xs font-bold mb-1">STEP {i + 1}</div>
            <h3 className="text-white font-semibold text-sm mb-1">{step.title}</h3>
            <p className="text-white/40 text-xs">{step.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Rewards */}
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {rewards.map((reward, i) => {
          const earned = authed && stats.registrations >= reward.required_referrals;
          return (
            <div key={i} className={`rounded-2xl p-6 border ${earned ? "bg-emerald-500/5 border-emerald-500/20" : "bg-white/[0.02] border-white/5"}`}>
              <div className="flex items-center justify-between mb-3">
                <Gift size={20} className={earned ? "text-emerald-400" : "text-amber-400"} />
                {earned && <CheckCircle2 size={16} className="text-emerald-400" />}
              </div>
              <h3 className="text-white font-semibold text-sm mb-1">{reward.name}</h3>
              <p className="text-white/40 text-xs mb-3">{reward.reward_description}</p>
              <div className="text-xs text-white/30">
                {reward.plan_scope === "enterprise" ? "Enterprise referrals" : `${reward.required_referrals} referral${reward.required_referrals > 1 ? "s" : ""} needed`}
              </div>
            </div>
          );
        })}
      </div>

      {/* Referral link + stats (authed only) */}
      {authed && !loading ? (
        <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="flex-1 w-full">
              <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Your Referral Link</label>
              <div className="flex gap-2">
                <input readOnly value={referralLink} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/60 focus:outline-none" />
                <button onClick={handleCopy} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors whitespace-nowrap">
                  {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                </button>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-center"><div className="text-2xl font-bold text-white">{stats.invites}</div><div className="text-white/30 text-[10px] uppercase tracking-wider">Invites</div></div>
              <div className="text-center"><div className="text-2xl font-bold text-cyan-400">{stats.registrations}</div><div className="text-white/30 text-[10px] uppercase tracking-wider">Joined</div></div>
              <div className="text-center"><div className="text-2xl font-bold text-emerald-400">{stats.conversions}</div><div className="text-white/30 text-[10px] uppercase tracking-wider">Paid</div></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <Link to="/register" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors">
            Start Free to Get Your Link <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </div>
  );
}