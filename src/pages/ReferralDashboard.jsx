import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import {
  generateReferralCode, getReferralUrl, ensureReferralCode,
  aggregateReferralStats, buildLeaderboard, COMMISSION_STATUSES,
  getReferralSettings, DEFAULT_SETTINGS,
} from "@/lib/referralEngine";
import { getQrUrl } from "@/lib/socialShare";
import ShareButton from "@/components/social/ShareButton";
import {
  Gift, Users, MousePointerClick, UserCheck, DollarSign, Clock,
  TrendingUp, Trophy, Copy, Check, Loader2, Filter, Crown, Target,
} from "lucide-react";

const PLAN_BADGE = {
  free: "bg-slate-500/10 text-slate-400",
  professional: "bg-indigo-500/10 text-indigo-400",
  executive: "bg-purple-500/10 text-purple-400",
  enterprise: "bg-emerald-500/10 text-emerald-400",
};

export default function ReferralDashboard() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [events, setEvents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");

  const referralCode = user ? generateReferralCode(user.id) : null;
  const referralLink = referralCode ? getReferralUrl(referralCode) : "";

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    if (referralCode) ensureReferralCode(user.id, referralCode);
    const load = async () => {
      try {
        const [refs, evts, txns, allRefs] = await Promise.all([
          base44.entities.Referral.filter({ referrer_user_id: user.id }, "-created_date", 500),
          base44.entities.ReferralEvent.filter({ referrer_user_id: user.id }, "-created_date", 500),
          base44.entities.ReferralTransaction.filter({ referrer_user_id: user.id }, "-created_date", 500),
          base44.entities.Referral.list("-created_date", 1000),
        ]);
        setReferrals(refs.filter(r => r.status !== "code_registered"));
        setEvents(evts);
        setTransactions(txns);
        setLeaderboard(buildLeaderboard(allRefs));
      } catch (e) {}
      try { setSettings(await getReferralSettings()); } catch (e) {}
      setLoading(false);
    };
    load();
  }, [user?.id, referralCode]);

  const stats = useMemo(() => aggregateReferralStats(referrals, events, transactions), [referrals, events, transactions]);
  const myRank = leaderboard.find(l => l.referrer_user_id === user?.id);

  const filtered = useMemo(() => referrals.filter(r => {
    if (statusFilter && r.commission_status !== statusFilter) return false;
    if (planFilter && r.converted_plan !== planFilter) return false;
    return true;
  }), [referrals, statusFilter, planFilter]);

  const copyLink = () => {
    try { navigator.clipboard.writeText(referralLink); } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const STAT_CARDS = [
    { label: "Total Clicks", value: stats.totalClicks, icon: MousePointerClick, color: "text-cyan-400" },
    { label: "Registrations", value: stats.registrations, icon: UserCheck, color: "text-indigo-400" },
    { label: "Conversions", value: stats.professional + stats.executive + stats.enterprise, icon: Target, color: "text-emerald-400" },
    { label: "Conversion Rate", value: `${stats.conversionRate}%`, icon: TrendingUp, color: "text-amber-400" },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-amber-400" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Gift size={12} className="text-amber-400" /> Referral & Affiliate Program
        </div>
        <h1 className="text-2xl font-bold text-white">Referral Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Share your link, track attribution, and earn commission automatically.</p>
      </div>

      {/* Referral Link Card */}
      <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-xl p-5">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <img src={getQrUrl(referralLink)} alt="Referral QR" className="w-20 h-20 rounded-lg shrink-0" />
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 mb-1">
              <label className="text-white/40 text-xs uppercase tracking-wider">Your Referral Code</label>
              <span className="px-2 py-0.5 bg-amber-500/10 rounded text-amber-400 text-xs font-mono font-bold">{referralCode}</span>
            </div>
            <div className="flex gap-2">
              <input readOnly value={referralLink} className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/60 focus:outline-none truncate" />
              <button onClick={copyLink} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium transition-colors whitespace-nowrap">
                {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <ShareButton shareType="referral" label="Share Referral Link" className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400" />
              <span className="text-white/30 text-xs">90-day cookie · Last-click attribution · {settings.commission_percentage}% commission{settings.founding_member_bonus_percentage > 0 ? ` · +${settings.founding_member_bonus_percentage}% founding bonus` : ""}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STAT_CARDS.map((s, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <s.icon size={16} className={s.color} />
            <div className="text-2xl font-bold text-white mt-2">{s.value}</div>
            <div className="text-white/30 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Earnings + Rank */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4"><DollarSign size={16} className="text-emerald-400" /><h3 className="text-sm font-medium text-white/80">Earnings</h3></div>
          <div className="grid grid-cols-2 gap-3">
            <div><div className="text-2xl font-bold text-white">${stats.totalEarnings.toFixed(2)}</div><div className="text-white/30 text-xs">Total</div></div>
            <div><div className="text-2xl font-bold text-amber-400">${stats.pendingEarnings.toFixed(2)}</div><div className="text-white/30 text-xs">Pending</div></div>
            <div><div className="text-2xl font-bold text-emerald-400">${stats.paidEarnings.toFixed(2)}</div><div className="text-white/30 text-xs">Paid</div></div>
            <div><div className="text-2xl font-bold text-red-400">${stats.rejectedEarnings.toFixed(2)}</div><div className="text-white/30 text-xs">Rejected</div></div>
          </div>
          {stats.pendingEarnings > 0 && settings.minimum_payout_threshold > 0 && (
            <div className="mt-3 text-xs text-white/40">
              {stats.pendingEarnings >= settings.minimum_payout_threshold
                ? `✓ Above $${settings.minimum_payout_threshold} payout threshold — queued for ${settings.payout_schedule} payout`
                : `$${(settings.minimum_payout_threshold - stats.pendingEarnings).toFixed(2)} until $${settings.minimum_payout_threshold} payout threshold`}
            </div>
          )}
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4"><Trophy size={16} className="text-amber-400" /><h3 className="text-sm font-medium text-white/80">Leaderboard Rank</h3></div>
          {myRank ? (
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold ${myRank.rank <= 3 ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-white/60"}`}>#{myRank.rank}</div>
              <div>
                <div className="text-white font-semibold">{myRank.referrals} referrals · {myRank.conversions} conversions</div>
                <div className="text-white/40 text-xs">{myRank.conversionRate}% conversion rate · ${myRank.commission.toFixed(2)} earned</div>
                {myRank.isFounding && <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 rounded text-amber-400 text-xs"><Crown size={10} /> Founding Member Bonus</div>}
              </div>
            </div>
          ) : (
            <div className="text-center py-4"><Trophy size={24} className="mx-auto text-white/20 mb-2" /><p className="text-white/30 text-sm">Make your first referral to appear on the leaderboard.</p></div>
          )}
        </div>
      </div>

      {/* Referral Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white/80">Your Referrals</h3>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-white/30" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none">
              <option value="">All Statuses</option>
              {Object.entries(COMMISSION_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none">
              <option value="">All Plans</option>
              <option value="free">Free</option>
              <option value="professional">Professional</option>
              <option value="executive">Executive</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto bg-white/[0.02] border border-white/5 rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02]">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-white/40 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs text-white/40 uppercase">Email</th>
                <th className="text-left px-4 py-3 text-xs text-white/40 uppercase">Plan</th>
                <th className="text-left px-4 py-3 text-xs text-white/40 uppercase">Registered</th>
                <th className="text-left px-4 py-3 text-xs text-white/40 uppercase">Purchased</th>
                <th className="text-right px-4 py-3 text-xs text-white/40 uppercase">Revenue</th>
                <th className="text-right px-4 py-3 text-xs text-white/40 uppercase">Commission</th>
                <th className="text-left px-4 py-3 text-xs text-white/40 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const cs = COMMISSION_STATUSES[r.commission_status] || COMMISSION_STATUSES.pending;
                return (
                  <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-white/80">{r.invitee_name || "—"}</td>
                    <td className="px-4 py-3 text-white/40 text-xs">{r.invitee_email || "—"}</td>
                    <td className="px-4 py-3">{r.converted_plan ? <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${PLAN_BADGE[r.converted_plan] || PLAN_BADGE.free}`}>{r.converted_plan}</span> : <span className="text-white/30 text-xs">—</span>}</td>
                    <td className="px-4 py-3 text-white/30 text-xs">{r.registration_date ? new Date(r.registration_date).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3 text-white/30 text-xs">{r.purchase_date ? new Date(r.purchase_date).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3 text-right text-white/60">${(r.subscription_amount || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-emerald-400 font-medium">${(r.commission_amount || 0).toFixed(2)}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${cs.bg} ${cs.color}`}>{cs.label}</span></td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center text-white/30 text-sm">No referrals yet. Share your link to get started!</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}