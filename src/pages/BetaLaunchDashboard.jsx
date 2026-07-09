import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useLaunchMode, LAUNCH_MODES, PROVIDER_STATUSES } from "@/lib/launchMode";
import { COUNTRIES } from "@/lib/payments";
import { Rocket, Users, Trophy, CheckCircle, TrendingUp, DollarSign, Globe, Share2, Loader2, Mail, Crown, Zap, X } from "lucide-react";

const PLAN_LABELS = { professional: "Professional", executive: "Executive", founding_member: "Founding Member", enterprise: "Enterprise" };
const EARLY_ACCESS_PLANS = [
  { id: "professional", label: "Professional" },
  { id: "executive", label: "Executive" },
  { id: "founding_member", label: "Founding Member" },
  { id: "developer_unlimited", label: "Developer Unlimited" },
  { id: "beta_tester", label: "Beta Tester" },
];
const STATUS_STYLES = {
  reserved: "bg-blue-500/10 text-blue-400",
  approved: "bg-amber-500/10 text-amber-400",
  invited: "bg-purple-500/10 text-purple-400",
  activated: "bg-emerald-500/10 text-emerald-400",
  cancelled: "bg-red-500/10 text-red-400",
  declined: "bg-red-500/10 text-red-400",
};

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 text-xs font-medium mb-2" style={{ color }}>
        <Icon size={14} /> {label}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

export default function BetaLaunchDashboard() {
  const launch = useLaunchMode();
  const [stats, setStats] = useState(null);
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showEarlyAccess, setShowEarlyAccess] = useState(false);
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, listRes] = await Promise.all([
        base44.functions.invoke("reserveFoundingMembership", { action: "stats" }),
        base44.functions.invoke("reserveFoundingMembership", { action: "list" }),
      ]);
      setStats(statsRes.data || statsRes);
      setWaitlist((listRes.data || listRes).waitlist || []);
    } catch (e) {
      console.error("[BetaLaunch] Load error:", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (action, payload, label) => {
    setActionLoading(label);
    try {
      await base44.functions.invoke("reserveFoundingMembership", { action, ...payload });
      await load();
    } catch (e) {
      console.error("[BetaLaunch] Action error:", e);
    }
    setActionLoading(null);
  };

  const filtered = waitlist.filter((w) => filter === "all" ? true : w.status === filter);

  const providerStatus = launch.providerStatus;
  const launchMode = launch.launchMode;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Rocket size={12} className="text-amber-400" /> Platform · Beta Launch Strategy
        </div>
        <h1 className="text-2xl font-bold text-white">Beta Launch Dashboard</h1>
        <p className="text-white/40 text-sm mt-2">Manage founding member reservations, waitlist, and manual activations.</p>
      </div>

      {/* Launch Mode + Provider Status */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="text-xs text-white/30 uppercase tracking-wider mb-2">Launch Mode</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{launchMode?.icon}</span>
            <div>
              <div className="text-lg font-bold" style={{ color: launchMode?.color }}>{launchMode?.label}</div>
              <div className="text-xs text-white/40">{launchMode?.description}</div>
            </div>
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <div className="text-xs text-white/30 uppercase tracking-wider mb-2">Payment Provider Status</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: providerStatus?.color }} />
            <div>
              <div className="text-lg font-bold" style={{ color: providerStatus?.color }}>{providerStatus?.label}</div>
              <div className="text-xs text-white/40">
                {launch.betaBillingMode ? "Beta Billing Mode active — reservations instead of payments" : "Live payments enabled"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Beta billing notice */}
      {launch.betaBillingMode && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <Rocket size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-white/60">
            <span className="text-amber-400 font-medium">Beta Billing Mode is active.</span> Premium plans remain visible, but "Subscribe" buttons show "Reserve My Founding Membership" instead of attempting payment. Users can register, explore, compare plans, and join the waitlist.
          </div>
        </div>
      )}

      {/* Stats */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-amber-400" /></div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <StatCard icon={Users} label="Total Waitlist" value={stats.total_waitlist} color="#94a3b8" />
            <StatCard icon={Trophy} label="Founding Reservations" value={stats.founding_reservations} color="#f59e0b" />
            <StatCard icon={CheckCircle} label="Manual Activations" value={stats.manual_activations} color="#10b981" />
            <StatCard icon={TrendingUp} label="Conversion Forecast" value={`${stats.conversion_forecast}%`} color="#a855f7" />
            <StatCard icon={DollarSign} label="Estimated MRR" value={`$${stats.estimated_mrr}`} color="#3b82f6" />
          </div>

          {/* Country Distribution + Top Referral Sources */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <div className="flex items-center gap-2 text-white/50 text-xs font-medium mb-3"><Globe size={14} /> Country Distribution</div>
              {stats.country_distribution.length === 0 ? (
                <p className="text-white/30 text-xs">No data yet.</p>
              ) : (
                <div className="space-y-2">
                  {stats.country_distribution.slice(0, 6).map(({ country, count }) => {
                    const c = COUNTRIES.find((x) => x.code === country);
                    const pct = Math.round((count / stats.total_waitlist) * 100);
                    return (
                      <div key={country}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/60">{c?.name || country}</span>
                          <span className="text-white/40">{count} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500/50 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <div className="flex items-center gap-2 text-white/50 text-xs font-medium mb-3"><Share2 size={14} /> Top Referral Sources</div>
              {stats.top_referral_sources.length === 0 ? (
                <p className="text-white/30 text-xs">No data yet.</p>
              ) : (
                <div className="space-y-2">
                  {stats.top_referral_sources.map(({ source, count }) => (
                    <div key={source} className="flex items-center justify-between text-xs">
                      <span className="text-white/60">{source}</span>
                      <span className="text-white/40">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setShowEarlyAccess(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/15 text-amber-400 text-xs font-medium hover:bg-amber-500/25 transition-colors"
        >
          <Zap size={14} /> Grant Early Access
        </button>
        <button
          onClick={() => handleAction("notify_all", {}, "notify_all")}
          disabled={actionLoading === "notify_all"}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 text-white/60 text-xs font-medium hover:bg-white/10 transition-colors disabled:opacity-40"
        >
          {actionLoading === "notify_all" ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />} Notify All — Payments Live
        </button>
      </div>

      {/* Waitlist table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <h3 className="text-sm font-semibold text-white">Founding Member Waitlist</h3>
          <div className="flex items-center gap-1">
            {["all", "reserved", "approved", "activated"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors ${filter === f ? "bg-amber-500/15 text-amber-400" : "text-white/30 hover:text-white/60"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-amber-400" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-white/30 text-xs text-center py-8">No reservations yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-white/30 border-b border-white/5">
                  <th className="px-4 py-2 font-medium">#</th>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Email</th>
                  <th className="px-4 py-2 font-medium">Plan</th>
                  <th className="px-4 py-2 font-medium">Country</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((w) => (
                  <tr key={w.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                    <td className="px-4 py-3 text-amber-400 font-bold">#{w.priority_number}</td>
                    <td className="px-4 py-3 text-white/80">{w.full_name || "—"}</td>
                    <td className="px-4 py-3 text-white/50 text-xs">{w.email}</td>
                    <td className="px-4 py-3 text-white/60 text-xs">{PLAN_LABELS[w.preferred_plan] || w.preferred_plan}</td>
                    <td className="px-4 py-3 text-white/50 text-xs">{w.country || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_STYLES[w.status] || "bg-white/5 text-white/40"}`}>{w.status}</span>
                    </td>
                    <td className="px-4 py-3 text-white/30 text-xs">{w.reservation_date ? new Date(w.reservation_date).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {w.status === "reserved" && (
                          <button
                            onClick={() => handleAction("approve", { reservation_id: w.id }, `approve-${w.id}`)}
                            disabled={actionLoading === `approve-${w.id}`}
                            className="px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 text-xs hover:bg-amber-500/20 transition-colors disabled:opacity-40"
                            title="Approve reservation"
                          >
                            {actionLoading === `approve-${w.id}` ? <Loader2 size={12} className="animate-spin" /> : "Approve"}
                          </button>
                        )}
                        {!w.activated && (
                          <button
                            onClick={() => handleAction("activate", { reservation_id: w.id, assigned_plan: w.preferred_plan, payment_method: "manual", activation_reason: "Manual activation" }, `activate-${w.id}`)}
                            disabled={actionLoading === `activate-${w.id}`}
                            className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs hover:bg-emerald-500/20 transition-colors disabled:opacity-40"
                            title="Activate subscription"
                          >
                            {actionLoading === `activate-${w.id}` ? <Loader2 size={12} className="animate-spin" /> : "Activate"}
                          </button>
                        )}
                        {!w.founding_member_assigned && (
                          <button
                            onClick={() => handleAction("grant_founding", { reservation_id: w.id }, `founding-${w.id}`)}
                            disabled={actionLoading === `founding-${w.id}`}
                            className="px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs hover:bg-purple-500/20 transition-colors disabled:opacity-40"
                            title="Assign Founding Member"
                          >
                            {actionLoading === `founding-${w.id}` ? <Loader2 size={12} className="animate-spin" /> : <Crown size={12} />}
                          </button>
                        )}
                        {w.founding_member_assigned && (
                          <span className="text-xs text-purple-400 font-medium">FM</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Early Access Modal */}
      {showEarlyAccess && (
        <EarlyAccessModal
          onClose={() => setShowEarlyAccess(false)}
          onGranted={async () => { setShowEarlyAccess(false); await load(); }}
        />
      )}
    </div>
  );
}

function EarlyAccessModal({ onClose, onGranted }) {
  const [form, setForm] = useState({ full_name: "", email: "", plan: "professional", reason: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email.trim()) { setError("Email is required"); return; }
    setSubmitting(true);
    try {
      await base44.functions.invoke("reserveFoundingMembership", { action: "early_access", ...form });
      await onGranted();
    } catch (e) {
      setError(e.response?.data?.error || "Failed to grant early access");
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-amber-400" />
            <h3 className="text-base font-bold text-white">Grant Early Access</h3>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <p className="text-white/40 text-xs">Manually grant a plan without payment — for investors, partners, advisors, pilot customers, or internal testing.</p>
          <input type="text" placeholder="Full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-amber-500/50" />
          <input type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-amber-500/50" />
          <select value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 focus:outline-none focus:border-amber-500/50">
            {EARLY_ACCESS_PLANS.map((p) => <option key={p.id} value={p.id} className="bg-[#0d0d14]">{p.label}</option>)}
          </select>
          <input type="text" placeholder="Reason (e.g. Investor, Partner, Advisor)" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-amber-500/50" />
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          <button type="submit" disabled={submitting} className="w-full h-10 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />} Grant Early Access
          </button>
        </form>
      </div>
    </div>
  );
}