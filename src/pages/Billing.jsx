import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { PLANS, PLAN_LIST, getPlan } from "@/lib/plans";
import { PAYMENT_PROVIDERS, processPayment } from "@/lib/payments";
import { CreditCard, Check, Loader2, Calendar, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Billing() {
  const [profile, setProfile] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [cycle, setCycle] = useState("monthly");
  const [upgradePlan, setUpgradePlan] = useState(null);
  const [provider, setProvider] = useState("stripe");
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const profiles = await base44.entities.UserProfile.list();
        if (profiles.length > 0) {
          setProfile(profiles[0]);
          setCycle(profiles[0].subscription_cycle || "monthly");
        }
        const invs = await base44.entities.Invoice.list("-created_date", 10);
        setInvoices(invs);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  const currentPlan = getPlan(profile);

  const handleUpgrade = async () => {
    if (!upgradePlan || !profile) return;
    setProcessing(true);
    try {
      const price = upgradePlan.price[cycle];
      const result = await processPayment({ provider, amount: price, currency: "USD", planId: upgradePlan.id, billingCycle: cycle });

      if (result.success) {
        await base44.entities.UserProfile.update(profile.id, {
          subscription_plan: upgradePlan.id,
          subscription_status: "active",
          subscription_cycle: cycle,
        });

        const now = new Date();
        const periodEnd = new Date(now);
        if (cycle === "annual") periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        else periodEnd.setMonth(periodEnd.getMonth() + 1);

        await base44.entities.Invoice.create({
          amount: price, currency: "USD", status: "paid",
          period_start: now.toISOString().split("T")[0],
          period_end: periodEnd.toISOString().split("T")[0],
          plan: upgradePlan.id, billing_cycle: cycle,
          invoice_number: `INV-${Date.now()}`,
        });

        await base44.entities.Notification.create({
          type: "subscription", title: "Subscription Updated",
          message: `You're now on the ${upgradePlan.name} plan. Enjoy premium features!`,
          icon: "🎉", action_url: "/billing",
        });

        setProfile({ ...profile, subscription_plan: upgradePlan.id, subscription_cycle: cycle });
        setUpgradePlan(null);
        const invs = await base44.entities.Invoice.list("-created_date", 10);
        setInvoices(invs);
      }
    } catch (e) { console.error(e); }
    setProcessing(false);
  };

  const handleCancel = async () => {
    if (!profile) return;
    try {
      await base44.entities.UserProfile.update(profile.id, { subscription_plan: "free", subscription_status: "canceled" });
      await base44.entities.Notification.create({
        type: "subscription", title: "Subscription Canceled",
        message: "Your subscription has been canceled. You're now on the Free plan.",
        icon: "⚠️",
      });
      setProfile({ ...profile, subscription_plan: "free", subscription_status: "canceled" });
    } catch (e) {}
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <CreditCard size={12} className="text-emerald-400" /> Billing & Subscription
        </div>
        <h1 className="text-2xl font-bold text-white">Manage Your Plan</h1>
      </div>

      {/* Current Plan */}
      <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{currentPlan.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-white">{currentPlan.name} Plan</h2>
                <p className="text-white/40 text-sm">{currentPlan.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <span className="text-2xl font-bold text-white">${currentPlan.price[cycle]}<span className="text-sm text-white/40 font-normal">/{cycle === "monthly" ? "mo" : "yr"}</span></span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">{profile?.subscription_status || "active"}</span>
            </div>
          </div>
          {currentPlan.id !== "free" && (
            <button onClick={handleCancel} className="text-red-400 hover:text-red-300 text-xs">Cancel subscription</button>
          )}
        </div>
      </div>

      {/* Cycle Toggle */}
      <div className="flex items-center justify-center gap-3">
        <button onClick={() => setCycle("monthly")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${cycle === "monthly" ? "bg-indigo-500/15 text-indigo-400" : "text-white/40 hover:text-white/70"}`}>Monthly</button>
        <button onClick={() => setCycle("annual")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${cycle === "annual" ? "bg-indigo-500/15 text-indigo-400" : "text-white/40 hover:text-white/70"}`}>Annual <span className="text-emerald-400 text-xs">Save 20%</span></button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLAN_LIST.map(plan => {
          const isCurrent = plan.id === currentPlan.id;
          const isUpgrade = PLAN_LIST.findIndex(p => p.id === plan.id) > PLAN_LIST.findIndex(p => p.id === currentPlan.id);
          return (
            <div key={plan.id} className={`relative rounded-xl border p-5 transition-all ${isCurrent ? "border-indigo-500/30 bg-indigo-500/5" : "border-white/5 bg-white/[0.02]"}`}>
              {isCurrent && <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-indigo-500 rounded-full text-[10px] font-bold text-white">CURRENT</div>}
              <div className="text-2xl mb-2">{plan.icon}</div>
              <h3 className="text-white font-bold">{plan.name}</h3>
              <p className="text-white/40 text-xs mb-3">{plan.description}</p>
              <div className="mb-4"><span className="text-2xl font-bold text-white">${plan.price[cycle]}</span><span className="text-white/40 text-sm">/{cycle === "monthly" ? "mo" : "yr"}</span></div>
              <ul className="space-y-1.5 mb-5">
                {plan.features.slice(0, 5).map((f, i) => (<li key={i} className="flex items-start gap-2 text-xs text-white/50"><Check size={12} className="text-emerald-400 mt-0.5 flex-shrink-0" /> {f}</li>))}
                {plan.features.length > 5 && <li className="text-xs text-white/30">+ {plan.features.length - 5} more</li>}
              </ul>
              {isCurrent ? <div className="w-full py-2.5 rounded-lg text-center text-sm text-white/30 bg-white/5">Current Plan</div>
                : isUpgrade ? <button onClick={() => setUpgradePlan(plan)} className="w-full py-2.5 rounded-lg text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white transition-colors">Upgrade</button>
                : <div className="w-full py-2.5 rounded-lg text-center text-sm text-white/30 bg-white/5">Included</div>}
            </div>
          );
        })}
      </div>

      {/* Invoices */}
      <div>
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Payment History</h2>
        {invoices.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
            <CreditCard size={24} className="mx-auto text-white/20 mb-2" />
            <p className="text-white/30 text-sm">No invoices yet. Your payment history will appear here.</p>
          </div>
        ) : (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-white/5"><tr className="text-left text-xs text-white/30 uppercase tracking-wider"><th className="px-4 py-3">Invoice</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th></tr></thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3 text-white/60 font-mono text-xs">{inv.invoice_number}</td>
                    <td className="px-4 py-3 text-white/40">{new Date(inv.created_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-white/60 capitalize">{inv.plan}</td>
                    <td className="px-4 py-3 text-white/60">${inv.amount}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-400">{inv.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {upgradePlan && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setUpgradePlan(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#0d0d14] border border-white/10 rounded-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Upgrade to {upgradePlan.name}</h3>
                <button onClick={() => setUpgradePlan(null)} className="text-white/30 hover:text-white/60"><X size={18} /></button>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2"><span className="text-white/60 text-sm">{upgradePlan.name} Plan</span><span className="text-white font-bold">${upgradePlan.price[cycle]}/{cycle === "monthly" ? "mo" : "yr"}</span></div>
                <p className="text-white/40 text-xs">Billed {cycle}</p>
              </div>
              <div className="mb-4">
                <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(PAYMENT_PROVIDERS).map(p => (
                    <button key={p.id} onClick={() => setProvider(p.id)} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all ${provider === p.id ? "bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/30" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>
                      <span>{p.icon}</span> {p.name}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleUpgrade} disabled={processing} className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                {processing ? <Loader2 size={18} className="animate-spin" /> : <>Pay ${upgradePlan.price[cycle]} & Upgrade</>}
              </button>
              <p className="text-white/20 text-xs text-center mt-3">Secure payment via {PAYMENT_PROVIDERS[provider].name}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}