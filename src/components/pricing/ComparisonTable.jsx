import React, { useState, useEffect } from "react";
import { usePricingCatalog } from "@/hooks/usePricingCatalog";
import { PLAN_TIERS, DEFAULT_FEATURES, getFeatureCatalog, getFeatureCategories } from "@/lib/featureCatalog";
import { Check, X, Loader2 } from "lucide-react";

function cellStatus(feature, planId) {
  const fTier = PLAN_TIERS[feature.minimumPlan] ?? 0;
  const pTier = PLAN_TIERS[planId] ?? 0;
  if (pTier < fTier) return "excluded";
  if (feature.limitLabel && pTier === fTier) return "limited";
  return "included";
}

export default function ComparisonTable() {
  const { plans, getPrice } = usePricingCatalog();
  const [features, setFeatures] = useState(DEFAULT_FEATURES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeatureCatalog().then((catalog) => {
      setFeatures(catalog.filter((f) => f.isEnabled));
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-32"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  const categories = getFeatureCategories(features);

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] border-b border-white/10">
            <tr>
              <th className="text-left px-4 py-4 text-white/40 text-xs uppercase tracking-wider font-medium w-2/5">Feature</th>
              {plans.map((plan) => (
                <th key={plan.id} className="px-4 py-4 text-center min-w-[120px]">
                  <div className="text-xl mb-1">{plan.icon}</div>
                  <div className="text-white font-semibold">{plan.name}</div>
                  <div className="text-white/40 text-xs">
                    {plan.customPricing ? "Custom" : getPrice(plan) === 0 ? "Free" : `$${getPrice(plan)}`}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <React.Fragment key={cat}>
                <tr className="bg-white/[0.02]">
                  <td colSpan={plans.length + 1} className="px-4 py-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">{cat}</td>
                </tr>
                {features.filter((f) => f.category === cat).map((feature) => (
                  <tr key={feature.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3">
                      <div className="text-white/80 text-sm">{feature.name}</div>
                      {feature.description && <div className="text-white/30 text-xs mt-0.5">{feature.description}</div>}
                    </td>
                    {plans.map((plan) => {
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
      <div className="flex items-center justify-center gap-6 text-xs text-white/30 mt-4">
        <span className="flex items-center gap-1"><Check size={14} className="text-emerald-400" /> Included</span>
        <span className="flex items-center gap-1"><X size={14} className="text-white/20" /> Not Included</span>
        <span className="flex items-center gap-1"><span className="text-amber-400 font-medium">Label</span> Limited</span>
      </div>
    </>
  );
}