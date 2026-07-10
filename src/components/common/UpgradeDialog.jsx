import React from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Lock, Check, ArrowRight } from "lucide-react";
import { useSubscription } from "@/lib/SubscriptionContext";
import { PLANS } from "@/lib/plans";

/**
 * UpgradeDialog — explains why a feature is locked and what plan unlocks it.
 *
 * Shown when a Free user clicks a locked feature's Upgrade button.
 * Displays: current plan, feature requested, benefit list, CTA.
 */
export default function UpgradeDialog({ open, onClose, featureName, description, benefits, requiredPlan }) {
  const { profile } = useSubscription();
  const currentPlanLabel = PLANS[profile?.subscription_plan || "free"]?.name || "Free";
  const planDef = PLANS[requiredPlan];
  const planLabel = planDef?.name || (requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-3">
            <Lock className="text-indigo-400" size={20} />
          </div>
          <DialogTitle className="text-center text-xl">{featureName}</DialogTitle>
          {description && <DialogDescription className="text-center">{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="flex items-center justify-between bg-white/[0.03] rounded-lg p-3">
            <span className="text-white/40 text-xs uppercase tracking-wider">Current Plan</span>
            <span className="text-white/80 text-sm font-medium">{currentPlanLabel}</span>
          </div>
          <div className="flex items-center justify-between bg-white/[0.03] rounded-lg p-3">
            <span className="text-white/40 text-xs uppercase tracking-wider">Feature Requested</span>
            <span className="text-indigo-400 text-sm font-medium">{featureName}</span>
          </div>
          {benefits?.length > 0 && (
            <div className="bg-white/[0.03] rounded-lg p-3">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Benefits</p>
              <ul className="space-y-1.5">
                {benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <Check size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <Link to="/billing" className="block">
          <button className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-xl transition-colors">
            Upgrade to {planLabel} <ArrowRight size={16} />
          </button>
        </Link>
      </DialogContent>
    </Dialog>
  );
}