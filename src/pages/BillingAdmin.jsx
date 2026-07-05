import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { usePricingCatalog } from "@/hooks/usePricingCatalog";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Shield, DollarSign, Users, TrendingDown, Percent, Loader2, Tag, Plus, Ban, RefreshCcw, Activity, Receipt } from "lucide-react";

export default function BillingAdmin() {
  const { getPlanById } = usePricingCatalog();
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: "", discount_type: "percentage", discount_value: 10, max_uses: 100, expires_at: "", applicable_plans: [] });
  const [refunding, setRefunding] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        if (me.role === "admin") {
          const [userProfiles, invs, cpns] = await Promise.all([
            base44.entities.UserProfile.list(),
            base44.entities.Invoice.list("-created_date", 500),
            base44.entities.Coupon.list("-created_date", 100),
          ]);
          setProfiles(userProfiles);
          setInvoices(invs);
          setCoupons(cpns);
        }
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
          <Shield size={32} className="mx-auto text-white/20 mb-3" />
          <h2 className="text-white font-medium mb-1">Access Restricted</h2>
          <p className="text-white/30 text-sm">This area is restricted to platform administrators.</p>
        </div>
      </div>
    );
  }

  const paidSubs = profiles.filter((p) => p.subscription_status === "active" && p.subscription_plan !== "free");
  const trialing = profiles.filter((p) => p.subscription_status === "trialing");
  const canceled = profiles.filter((p) => p.subscription_status === "canceled");
  const totalRevenue = invoices.filter((i) => i.status === "paid").reduce((a, i) => a + (i.amount || 0), 0);

  const mrr = paidSubs.reduce((sum, p) => {
    const plan = getPlanById(p.subscription_plan);
    if (!plan) return sum;
    const price = p.subscription_cycle === "annual" ? plan.annualPrice / 12 : plan.monthlyPrice;
    return sum + (price || 0);
  }, 0);

  const arr = mrr * 12;
  const conversionRate = profiles.length > 0 ? ((paidSubs.length / profiles.length) * 100).toFixed(1) : 0;
  const churnRate = profiles.length > 0 ? ((canceled.length / profiles.length) * 100).toFixed(1) : 0;
  const arpu = paidSubs.length > 0 ? (totalRevenue / paidSubs.length).toFixed(2) : 0;

  const monthlyData = invoices.filter((i) => i.status === "paid").reduce((acc, inv) => {
    const d = new Date(inv.created_date);
    const key = d.toLocaleString("default", { month: "short" });
    acc[key] = (acc[key] || 0) + (inv.amount || 0);
    return acc;
  }, {});
  const chartData = Object.entries(monthlyData).map(([month, revenue]) => ({ month, revenue }));

  const handleCreateCoupon = async () => {
    try {
      await base44.entities.Coupon.create({
        code: newCoupon.code.toUpperCase(),
        discount_type: newCoupon.discount_type,
        discount_value: Number(newCoupon.discount_value),
        max_uses: Number(newCoupon.max_uses),
        expires_at: newCoupon.expires_at || null,
        applicable_plans: newCoupon.applicable_plans,
        is_active: true,
        used_count: 0,
      });
      const cpns = await base44.entities.Coupon.list("-created_date", 100);
      setCoupons(cpns);
      setShowCouponForm(false);
      setNewCoupon({ code: "", discount_type: "percentage", discount_value: 10, max_uses: 100, expires_at: "", applicable_plans: [] });
    } catch (e) {}
  };

  const handleDeactivateCoupon = async (id) => {
    try {
      await base44.entities.Coupon.update(id, { is_active: false });
      setCoupons(coupons.map((c) => (c.id === id ? { ...c, is_active: false } : c)));
    } catch (e) {}
  };

  const handleRefund = async (invoiceId) => {
    setRefunding(invoiceId);
    try {
      await base44.entities.Invoice.update(invoiceId, { status: "refunded" });
      setInvoices(invoices.map((i) => (i.id === invoiceId ? { ...i, status: "refunded" } : i)));
    } catch (e) {}
    setRefunding(null);
  };

  const failedInvoices = invoices.filter((i) => i.status === "failed" || i.status === "refunded");

  const revenueStats = [
    { label: "MRR", value: `$${mrr.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: DollarSign, color: "text-emerald-400" },
    { label: "ARR", value: `$${arr.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, icon: TrendingDown, color: "text-indigo-400" },
    { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-amber-400" },
    { label: "ARPU", value: `$${arpu}`, icon: Activity, color: "text-cyan-400" },
  ];

  const subscriberStats = [
    { label: "Total Users", value: profiles.length, icon: Users, color: "text-indigo-400" },
    { label: "Active Paid", value: paidSubs.length, icon: Shield, color: "text-emerald-400" },
    { label: "Trials", value: trialing.length, icon: Activity, color: "text-amber-400" },
    { label: "Conversion", value: `${conversionRate}%`, icon: Percent, color: "text-cyan-400" },
    { label: "Churn", value: `${churnRate}%`, icon: TrendingDown, color: "text-red-400" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Receipt size={12} className="text-emerald-400" /> Billing Administration
        </div>
        <h1 className="text-2xl font-bold text-white">Revenue & Subscriptions</h1>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {revenueStats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
            <s.icon size={18} className={s.color} />
            <div className="text-2xl font-bold text-white mt-2">{s.value}</div>
            <div className="text-white/30 text-xs">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Subscriber Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {subscriberStats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
            <s.icon size={16} className={s.color} />
            <div className="text-xl font-bold text-white mt-2">{s.value}</div>
            <div className="text-white/30 text-xs">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      {chartData.length > 0 && (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
          <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} />
              <Tooltip contentStyle={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} labelStyle={{ color: "rgba(255,255,255,0.5)" }} formatter={(v) => [`$${v}`, "Revenue"]} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Active Subscriptions */}
      <div>
        <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Active Subscriptions</h3>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-white/5">
              <tr className="text-left text-xs text-white/30 uppercase tracking-wider">
                <th className="px-4 py-3">User</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Cycle</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">MRR</th>
              </tr>
            </thead>
            <tbody>
              {paidSubs.slice(0, 20).map((p) => {
                const plan = getPlanById(p.subscription_plan);
                const mrrVal = p.subscription_cycle === "annual" ? (plan?.annualPrice || 0) / 12 : (plan?.monthlyPrice || 0);
                return (
                  <tr key={p.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3 text-white/70">{p.full_name || p.target_role || "Unknown"}</td>
                    <td className="px-4 py-3"><span className="text-xs capitalize text-indigo-400">{p.subscription_plan}</span></td>
                    <td className="px-4 py-3 text-white/50 capitalize">{p.subscription_cycle}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-400">{p.subscription_status}</span></td>
                    <td className="px-4 py-3 text-white/60">${mrrVal.toFixed(0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coupon Management */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider">Coupons</h3>
          <button onClick={() => setShowCouponForm(!showCouponForm)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium transition-colors">
            <Plus size={12} /> New Coupon
          </button>
        </div>

        {showCouponForm && (
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 mb-4 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <input type="text" placeholder="CODE" value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} className="bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 uppercase" />
              <select value={newCoupon.discount_type} onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value })} className="bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 focus:outline-none focus:border-indigo-500/50">
                <option value="percentage" className="bg-[#0d0d14]">Percentage</option>
                <option value="fixed" className="bg-[#0d0d14]">Fixed Amount</option>
              </select>
              <input type="number" placeholder="Value" value={newCoupon.discount_value} onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: e.target.value })} className="bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 focus:outline-none focus:border-indigo-500/50" />
              <input type="number" placeholder="Max uses (0=∞)" value={newCoupon.max_uses} onChange={(e) => setNewCoupon({ ...newCoupon, max_uses: e.target.value })} className="bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 focus:outline-none focus:border-indigo-500/50" />
            </div>
            <div className="flex gap-3">
              <input type="date" value={newCoupon.expires_at} onChange={(e) => setNewCoupon({ ...newCoupon, expires_at: e.target.value })} className="bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 focus:outline-none focus:border-indigo-500/50" />
              <button onClick={handleCreateCoupon} disabled={!newCoupon.code} className="px-4 h-10 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white text-sm font-medium transition-colors">Create</button>
            </div>
          </div>
        )}

        {coupons.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
            <Tag size={24} className="mx-auto text-white/20 mb-2" />
            <p className="text-white/30 text-sm">No coupons created yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {coupons.map((c) => (
              <div key={c.id} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center"><Tag size={14} className="text-indigo-400" /></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white/70 text-sm font-mono font-medium">{c.code}</span>
                      {!c.is_active && <span className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-full">INACTIVE</span>}
                    </div>
                    <span className="text-white/30 text-xs">{c.discount_type === "percentage" ? `${c.discount_value}% off` : `$${c.discount_value} off`} · {c.used_count || 0}/{c.max_uses || "∞"} used{c.expires_at ? ` · exp ${new Date(c.expires_at).toLocaleDateString()}` : ""}</span>
                  </div>
                </div>
                {c.is_active && <button onClick={() => handleDeactivateCoupon(c.id)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 text-xs transition-colors"><Ban size={12} /> Deactivate</button>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Failed / Refunded Payments */}
      {failedInvoices.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Payment Issues</h3>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-white/5">
                <tr className="text-left text-xs text-white/30 uppercase tracking-wider">
                  <th className="px-4 py-3">Invoice</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {failedInvoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3 text-white/60 font-mono text-xs">{inv.invoice_number}</td>
                    <td className="px-4 py-3 text-white/60">${inv.amount}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${inv.status === "refunded" ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400"}`}>{inv.status}</span></td>
                    <td className="px-4 py-3 text-right">
                      {inv.status === "failed" && <button onClick={() => handleRefund(inv.id)} disabled={refunding === inv.id} className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-indigo-400 transition-colors disabled:opacity-30">{refunding === inv.id ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />} Refund</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}