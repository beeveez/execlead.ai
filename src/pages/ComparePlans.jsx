import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePricingCatalog } from "@/hooks/usePricingCatalog";
import { PLAN_TIERS, DEFAULT_FEATURES, getFeatureCatalog, getFeatureCategories } from "@/lib/featureCatalog";
import { Check, X, Minus, Loader2, Layers } from "lucide-react";

function cellStatus(feature, planId) {
  const fTier = PLAN_TIERS[feature.minimumPlan] ?? 0;
  const pTier = PLAN_TIERS[planId] ?? 0;
  if (pTier < fTier) return "excluded";
  if (feature.limitLabel && pTier === fTier) return "limited";
  return "included";
}

export default function ComparePlans() {
  const { plans, getPrice } = usePricingCatalog();
  const [features, setFeatures] = useState(DEFAULT_FEATURES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeatureCatalog().then(catalog => {
      setFeatures(catalog.filter(f => f.isEnabled));
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  const categories = getFeatureCategories(features);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Layers size={12} className="text-indigo-400" /> Entitlements
        </div>
        <h1 className="text-2xl font-bold text-white">Compare Plans</h1>
        <p className="text-white/40 text-sm mt-1">Every feature, every plan. See exactly what's included.</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] border-b border-white/10 sticky top-0">
            <tr>
              <th className="text-left px-4 py-4 text-white/40 text-xs uppercase tracking-wider font-medium w-2/5">Feature</th>
              {plans.map(plan => (
                <th key={plan.id} className="px-4 py-4 text-center">
                  <div className="text-xl mb-1">{plan.icon}</div>
                  <div className="text-white font-semibold">{plan.name}</div>
                  <div className="text-white/40 text-xs">${getPrice(plan)}/{getPrice(plan) === 0 ? "forever" : "mo"}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <React.Fragment key={cat}>
                <tr className="bg-white/[0.02]">
                  <td colSpan={plans.length + 1} className="px-4 py-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">{cat}</td>
                </tr>
                {features.filter(f => f.category === cat).map(feature => (
                  <tr key={feature.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3">
                      <div className="text-white/80 text-sm">{feature.name}</div>
                      {feature.description && <div className="text-white/30 text-xs mt-0.5">{feature.description}</div>}
                    </td>
                    {plans.map(plan => {
                      const status = cellStatus(feature, plan.id);
                      return (
                        <td key={plan.id} className="px-4 py-3 text-center">
                          {status === "included" && <Check size={16} className="text-emerald-400 mx-auto" />}
                          {status === "excluded" && <X size={16} className="text-white/20 mx-auto" />}
                          {status === "limited" && <span className="text-xs text-amber-400 font-medium">{feature.limitLabel}</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center gap-3 text-xs text-white/30">
        <span className="flex items-center gap-1"><Check size={14} className="text-emerald-400" /> Included</span>
        <span className="flex items-center gap-1"><X size={14} className="text-white/20" /> Not Included</span>
        <span className="flex items-center gap-1"><Minus size={14} className="text-amber-400" /> Limited</span>
      </div>

      <div className="text-center">
        <Link to="/billing" className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-6 py-3 rounded-xl transition-colors">
          Manage Your Plan
        </Link>
      </div>
    </div>
  );
}