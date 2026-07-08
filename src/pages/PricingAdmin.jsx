import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { DEFAULT_CATALOG } from "@/lib/pricingCatalog";
import { Loader2, Plus, RefreshCw, DollarSign } from "lucide-react";
import PlanEditor from "@/components/admin/PlanEditor";

export default function PricingAdmin() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const records = await base44.entities.PricingPlan.list("sort_order", 50);
      setPlans(records);
    } catch (e) {}
    setLoading(false);
  };

  const initializeCatalog = async () => {
    setSaving("init");
    try {
      await base44.entities.PricingPlan.bulkCreate(
        DEFAULT_CATALOG.map(p => ({
          plan_id: p.id,
          name: p.name,
          description: p.description,
          monthly_price: p.monthlyPrice,
          annual_price: p.annualPrice,
          currency: p.currency,
          badge: p.badge || "",
          button_text: p.buttonText,
          features: p.features,
          recommended: p.recommended,
          enterprise_only: p.enterpriseOnly,
          visible: p.visible,
          sort_order: p.sortOrder,
          color: p.color,
          icon: p.icon
        }))
      );
      await loadPlans();
    } catch (e) { console.error(e); }
    setSaving(null);
  };

  const savePlan = async (plan) => {
    setSaving(plan.id);
    try {
      await base44.entities.PricingPlan.update(plan.id, {
        name: plan.name,
        description: plan.description,
        monthly_price: Number(plan.monthly_price),
        annual_price: Number(plan.annual_price),
        currency: plan.currency,
        badge: plan.badge || "",
        button_text: plan.button_text,
        features: plan.features,
        recommended: plan.recommended,
        enterprise_only: plan.enterprise_only,
        visible: plan.visible,
        sort_order: Number(plan.sort_order)
      });
      setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, ...plan, features: plan.features } : p));
    } catch (e) { console.error(e); }
    setSaving(null);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  if (user?.role !== "admin") return <div className="text-center text-white/40 py-20">Access denied. Admin role required.</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <DollarSign size={12} className="text-emerald-400" /> Configuration
          </div>
          <h1 className="text-2xl font-bold text-white">Pricing Catalog Admin</h1>
          <p className="text-white/40 text-sm mt-1">Manage prices, features, and visibility across all pages.</p>
        </div>
        <button onClick={loadPlans} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-white/60 transition-colors">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
          <p className="text-white/40 mb-2">No pricing records in the database yet.</p>
          <p className="text-white/30 text-sm mb-6">Initialize the catalog with default values, then edit as needed. Changes will instantly reflect on the Billing page.</p>
          <button onClick={initializeCatalog} disabled={saving === "init"} className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white font-medium px-6 py-2.5 rounded-lg transition-colors">
            {saving === "init" ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Initialize Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {plans.map(plan => (
            <PlanEditor key={plan.id} plan={plan} onSave={savePlan} saving={saving === plan.id} />
          ))}
        </div>
      )}
    </div>
  );
}