import React, { useState } from "react";
import { Lock, ArrowRight } from "lucide-react";
import UpgradeDialog from "./UpgradeDialog";

/**
 * LockedFeatureSection — inline placeholder for a premium sub-module.
 *
 * Displays a lock icon, feature title, plan badge, short description,
 * and an Upgrade button that opens an UpgradeDialog.
 *
 * Use this inside pages where a premium section would normally render.
 * The component is self-contained — no API calls, no errors.
 */
export default function LockedFeatureSection({ title, description, benefits, requiredPlan = "professional", icon: Icon }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const planLabel = requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1);

  return (
    <>
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-3">
          {Icon ? <Icon size={20} className="text-indigo-400" /> : <Lock size={20} className="text-indigo-400" />}
        </div>
        <h3 className="font-semibold text-white/90 mb-1">{title}</h3>
        <p className="text-indigo-400/60 text-xs font-medium uppercase tracking-wider mb-2">{planLabel} Feature</p>
        <p className="text-white/40 text-sm mb-4 max-w-sm mx-auto leading-relaxed">{description}</p>
        <button
          onClick={() => setDialogOpen(true)}
          className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
        >
          <Lock size={14} /> Upgrade to {planLabel} <ArrowRight size={14} />
        </button>
      </div>
      <UpgradeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        featureName={title}
        description={description}
        benefits={benefits}
        requiredPlan={requiredPlan}
      />
    </>
  );
}