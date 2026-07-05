import React from "react";
import { Link } from "react-router-dom";
import { Lock, ArrowRight, Loader2 } from "lucide-react";
import { useEntitlements } from "@/hooks/useEntitlements";

export default function FeatureGate({ featureId, children, title }) {
  const { hasAccess, getFeature, getUpgradePlan, loading } = useEntitlements();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (hasAccess(featureId)) return children;

  const feature = getFeature(featureId);
  const upgradePlan = getUpgradePlan(featureId);
  const planLabel = upgradePlan.charAt(0).toUpperCase() + upgradePlan.slice(1);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="max-w-md w-full text-center bg-white/[0.02] border border-white/10 rounded-2xl p-8">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
          <Lock className="text-indigo-400" size={24} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">{title || feature?.name || "Premium Feature"}</h2>
        <p className="text-white/40 text-sm mb-6">{feature?.description || "This feature requires a subscription upgrade."}</p>
        <div className="bg-white/[0.03] rounded-lg p-3 mb-6">
          <p className="text-white/50 text-xs uppercase tracking-wider">Available in</p>
          <p className="text-indigo-400 font-semibold">{planLabel} plan</p>
        </div>
        <Link to="/billing" className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-6 py-3 rounded-xl transition-colors">
          Upgrade to {planLabel} <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}