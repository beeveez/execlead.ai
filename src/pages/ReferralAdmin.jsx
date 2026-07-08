import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import {
  getReferralSettings, DEFAULT_SETTINGS, REWARD_TYPES, PAYOUT_SCHEDULES,
  buildLeaderboard, COMMISSION_STATUSES,
} from "@/lib/referralEngine";
import { Settings2, DollarSign, Trophy, Shield, Save, Loader2, CheckCircle, Clock, Users, TrendingUp } from "lucide-react";

const TOGGLE = ({ label, value, onChange, hint }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <div className="text-white/80 text-sm">{label}</div>
      {hint && <div className="text-white/30 text-xs">{hint}</div>}
    </div>
    <button onClick={() => onChange(!value)} className={`relative w-10 h-5 rounded-full transition-colors ${value ? "bg-emerald-500" : "bg-white/10"}`}>
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? "translate-x-5" : ""}`} />
    </button>
  </div>
);

export default function ReferralAdmin() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [settingsId, setSettingsId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState("settings");

  useEffect(() => {
    const load = async () => {
      try {
        const s = await getReferralSettings();
        setSettings(s);
        setSettingsId(s.id || null);
        const [txns, allRefs] = await Promise.all([
          base44.entities.ReferralTransaction.list("-created_date", 200),
          base44.entities.Referral.list("-created_date", 1000),
        ]);
        setTransactions(txns);
        setLeaderboard(buildLeaderboard(allRefs));
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  const update = (key, value) => setSettings(s => ({ ...s, [key]: value }));

  const toggleReward = (type) => {
    const list = settings.reward_types_enabled || [];
    update("reward_types_enabled", list.includes(type) ? list.filter(t => t !== type) : [...list, type]);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (settingsId) {
        const { id, created_date, updated_date, created_by_id, ...patch } = settings;
        await base44.entities.ReferralSettings.update(settingsId, { ...patch, last_updated_by: user?.id || "" });
      } else {
        const created = await base44.entities.ReferralSettings.create({ ...settings, last_updated_by: user?.id || "" });
        setSettingsId(created.id);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {}
    setSaving(false);
  };

  const handlePayoutAction = async (txnId, action) => {
    try {
      await base44.functions.invoke("processReferral", { action, transaction_id: txnId });
      const txns = await base44.entities.ReferralTransaction.list("-created_date", 200);
      setTransactions(txns);
    } catch (e) {}
  };

  const pendingTxns = transactions.filter(t => t.status === "pending");
  const approvedTxns = transactions.filter(t => t.status === "approved");

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2"><Settings2 size={12} className="text-indigo-400" /> Platform Administration</div>
        <h1 className="text-2xl font-bold text-white">Referral & Affiliate Engine</h1>
        <p className="text-white/40 text-sm mt-1">Configure commission rules, fraud detection, payouts, and rewards.</p>
      </div>

      <div className="flex gap-1 bg-white/[0.02] border border-white/5 rounded-lg p-1 w-fit">
        {[["settings", "Settings", Settings2], ["payouts", "Payouts", DollarSign], ["leaderboard", "Leaderboard", Trophy]].map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === key ? "bg-indigo-500/15 text-indigo-400" : "text-white/40 hover:text-white/70"}`}>
            <Icon size={14} /> {label}
            {key === "payouts" && pendingTxns.length > 0 && <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs">{pendingTxns.length}</span>}
          </button>
        ))}
      </div>

      {tab === "settings" && (
        <div className="space-y-4">
          {/* Commission */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-medium text-white/80 mb-4 flex items-center gap-2"><DollarSign size={14} className="text-emerald-400" /> Commission Rules</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">Base Commission %</label>
                <input type="number" min="0" max="100" value={settings.commission_percentage} onChange={e => update("commission_percentage", Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">Founding Member Bonus %</label>
                <input type="number" min="0" max="100" value={settings.founding_member_bonus_percentage} onChange={e => update("founding_member_bonus_percentage", Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
              </div>
              <TOGGLE label="Recurring Commission" hint="Earn on renewals, not just first purchase" value={settings.recurring_commission_enabled} onChange={v => update("recurring_commission_enabled", v)} />
              {settings.recurring_commission_enabled && (
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">Recurring Rate %</label>
                  <input type="number" min="0" max="100" value={settings.recurring_commission_percentage} onChange={e => update("recurring_commission_percentage", Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
                </div>
              )}
            </div>
          </div>

          {/* Attribution & Payouts */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-medium text-white/80 mb-4 flex items-center gap-2"><Clock size={14} className="text-cyan-400" /> Attribution & Payouts</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">Cookie Duration (days)</label>
                <input type="number" min="1" value={settings.cookie_duration_days} onChange={e => update("cookie_duration_days", Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">Attribution Model</label>
                <select value={settings.attribution_model} onChange={e => update("attribution_model", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                  <option value="last_click">Last-click wins</option>
                  <option value="first_click">First-click wins</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">Payout Schedule</label>
                <select value={settings.payout_schedule} onChange={e => update("payout_schedule", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                  {Object.entries(PAYOUT_SCHEDULES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">Minimum Payout ($)</label>
                <input type="number" min="0" value={settings.minimum_payout_threshold} onChange={e => update("minimum_payout_threshold", Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wider mb-1 block">Referral Expiration (days, 0=never)</label>
                <input type="number" min="0" value={settings.referral_expiration_days} onChange={e => update("referral_expiration_days", Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
              </div>
            </div>
          </div>

          {/* Fraud Rules */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-medium text-white/80 mb-2 flex items-center gap-2"><Shield size={14} className="text-red-400" /> Anti-Fraud Rules</h3>
            <div className="grid md:grid-cols-2 gap-x-6">
              <TOGGLE label="Block Self-Referrals" value={settings.self_referral_blocked} onChange={v => update("self_referral_blocked", v)} />
              <TOGGLE label="Block Duplicate Emails" value={settings.duplicate_email_blocked} onChange={v => update("duplicate_email_blocked", v)} />
              <TOGGLE label="Block Same IP Address" hint="May block legitimate shared networks" value={settings.duplicate_ip_blocked} onChange={v => update("duplicate_ip_blocked", v)} />
              <TOGGLE label="Block Same Payment Method" value={settings.same_payment_method_blocked} onChange={v => update("same_payment_method_blocked", v)} />
              <TOGGLE label="VPN Abuse Check (optional)" value={settings.vpn_check_enabled} onChange={v => update("vpn_check_enabled", v)} />
            </div>
          </div>

          {/* Reward Types */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2"><Trophy size={14} className="text-amber-400" /> Enabled Reward Types</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(REWARD_TYPES).map(([key, rt]) => {
                const enabled = (settings.reward_types_enabled || []).includes(key);
                return (
                  <button key={key} onClick={() => toggleReward(key)} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${enabled ? "bg-amber-500/10 border-amber-500/30 text-amber-400" : "bg-white/5 border-white/5 text-white/40 hover:text-white/60"}`}>
                    <span>{rt.icon}</span> {rt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors">
            {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckCircle size={16} /> : <Save size={16} />}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Settings"}
          </button>
        </div>
      )}

      {tab === "payouts" && (
        <div className="space-y-4">
          {pendingTxns.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-white/80 mb-2 flex items-center gap-2"><Clock size={14} className="text-amber-400" /> Pending Approval ({pendingTxns.length})</h3>
              <PayoutTable items={pendingTxns} onApprove={(id) => handlePayoutAction(id, "approve")} onPay={(id) => handlePayoutAction(id, "pay")} />
            </div>
          )}
          {approvedTxns.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-white/80 mb-2 flex items-center gap-2"><DollarSign size={14} className="text-emerald-400" /> Ready for Payout ({approvedTxns.length})</h3>
              <PayoutTable items={approvedTxns} onPay={(id) => handlePayoutAction(id, "pay")} />
            </div>
          )}
          {pendingTxns.length === 0 && approvedTxns.length === 0 && (
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center"><DollarSign size={24} className="mx-auto text-white/20 mb-2" /><p className="text-white/30 text-sm">No pending payouts.</p></div>
          )}
        </div>
      )}

      {tab === "leaderboard" && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02]"><tr>
              <th className="text-left px-4 py-3 text-xs text-white/40 uppercase">Rank</th>
              <th className="text-left px-4 py-3 text-xs text-white/40 uppercase">Referrer</th>
              <th className="text-right px-4 py-3 text-xs text-white/40 uppercase">Referrals</th>
              <th className="text-right px-4 py-3 text-xs text-white/40 uppercase">Conversions</th>
              <th className="text-right px-4 py-3 text-xs text-white/40 uppercase">Revenue</th>
              <th className="text-right px-4 py-3 text-xs text-white/40 uppercase">Commission</th>
              <th className="text-right px-4 py-3 text-xs text-white/40 uppercase">Conv. Rate</th>
            </tr></thead>
            <tbody>
              {leaderboard.slice(0, 20).map(l => (
                <tr key={l.referrer_user_id} className="border-t border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-3"><span className={`font-bold ${l.rank <= 3 ? "text-amber-400" : "text-white/50"}`}>#{l.rank}</span></td>
                  <td className="px-4 py-3 text-white/80">{l.referrer_name}{l.isFounding && <span className="ml-1">🏆</span>}</td>
                  <td className="px-4 py-3 text-right text-white/60">{l.referrals}</td>
                  <td className="px-4 py-3 text-right text-white/60">{l.conversions}</td>
                  <td className="px-4 py-3 text-right text-white/60">${l.revenue.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-emerald-400 font-medium">${l.commission.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right text-white/40">{l.conversionRate}%</td>
                </tr>
              ))}
              {leaderboard.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center text-white/30 text-sm">No referral activity yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PayoutTable({ items, onApprove, onPay }) {
  return (
    <div className="overflow-x-auto bg-white/[0.02] border border-white/5 rounded-xl">
      <table className="w-full text-sm">
        <thead className="bg-white/[0.02]"><tr>
          <th className="text-left px-4 py-3 text-xs text-white/40 uppercase">Referrer</th>
          <th className="text-left px-4 py-3 text-xs text-white/40 uppercase">Invitee</th>
          <th className="text-left px-4 py-3 text-xs text-white/40 uppercase">Plan</th>
          <th className="text-right px-4 py-3 text-xs text-white/40 uppercase">Amount</th>
          <th className="text-right px-4 py-3 text-xs text-white/40 uppercase">Commission</th>
          <th className="text-right px-4 py-3 text-xs text-white/40 uppercase">Actions</th>
        </tr></thead>
        <tbody>
          {items.map(t => (
            <tr key={t.id} className="border-t border-white/5 hover:bg-white/[0.02]">
              <td className="px-4 py-3 text-white/80">{t.referrer_name}{t.founding_bonus_applied && <span className="ml-1">🏆</span>}</td>
              <td className="px-4 py-3 text-white/50 text-xs">{t.invitee_email}</td>
              <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-indigo-500/10 text-indigo-400 capitalize">{t.plan}</span></td>
              <td className="px-4 py-3 text-right text-white/60">${(t.subscription_amount || 0).toFixed(2)}</td>
              <td className="px-4 py-3 text-right text-emerald-400 font-medium">${(t.commission_amount || 0).toFixed(2)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  {onApprove && <button onClick={() => onApprove(t.id)} className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-xs hover:bg-blue-500/20">Approve</button>}
                  <button onClick={() => onPay(t.id)} className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs hover:bg-emerald-500/20">Mark Paid</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}