import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Clock, AlertTriangle, ArrowRight, X } from "lucide-react";

/**
 * GracePeriodBanner — shown when a member's enterprise membership
 * is ending. Displays a countdown and CTA to the Transfer Wizard.
 *
 * Renders nothing if no active transfer exists.
 */
export default function GracePeriodBanner() {
  const [transfer, setTransfer] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let active = true;
    base44.auth.isAuthenticated()
      .then(ok => ok ? base44.functions.invoke("manageIdentityTransfer", { action: "get_my_transfer" }) : null)
      .then(res => {
        if (!active || !res) return;
        const d = res.data || res;
        if (d.active_transfer) {
          setTransfer(d.active_transfer);
          setDaysRemaining(d.days_remaining);
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  if (!transfer || dismissed) return null;

  const isExpired = daysRemaining === 0;
  const isUrgent = daysRemaining <= 7 && !isExpired;

  return (
    <div className={`px-4 md:px-8 pt-4 max-w-7xl mx-auto`}>
      <div className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${
        isExpired
          ? "bg-red-500/10 border-red-500/20 text-red-400"
          : isUrgent
            ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
            : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
      }`}>
        {isExpired ? <AlertTriangle size={16} className="flex-shrink-0" /> : <Clock size={16} className="flex-shrink-0" />}
        <div className="flex-1 min-w-0">
          {isExpired ? (
            <span className="font-medium">Your Enterprise grace period has ended. Complete your transfer now to continue your executive journey.</span>
          ) : (
            <span className="font-medium">
              Enterprise Membership Ending · <span className="font-bold">{daysRemaining} {daysRemaining === 1 ? "Day" : "Days"} Remaining</span>
              <span className="text-white/50 font-normal ml-1.5 hidden sm:inline">Choose your next membership.</span>
            </span>
          )}
        </div>
        <Link
          to="/identity-transfer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium whitespace-nowrap transition-colors"
        >
          Continue Journey <ArrowRight size={12} />
        </Link>
        <button onClick={() => setDismissed(true)} className="text-white/30 hover:text-white/60 flex-shrink-0">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}