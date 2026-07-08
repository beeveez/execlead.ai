import React from "react";
import Panel from "./Panel";
import { Infinity as InfinityIcon, Package } from "lucide-react";
import { fmtNum, fmtPct } from "@/lib/aiOperations";

export default function SubscriptionLimits({ token, subscription }) {
  const { isUnlimited, allowance, used, remaining, usagePct } = token;
  return (
    <Panel title="Subscription Limits" icon={Package}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs text-white/30">Current Plan</div>
          <div className="text-sm font-semibold text-white flex items-center gap-1.5">
            <span>{subscription?.icon}</span> {subscription?.planName || "Free"}
          </div>
        </div>
        {isUnlimited ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium">
            <InfinityIcon size={14} /> Unlimited
          </div>
        ) : null}
      </div>
      {isUnlimited ? (
        <div className="text-center py-4">
          <InfinityIcon size={28} className="mx-auto text-emerald-400/60 mb-1" />
          <p className="text-emerald-400 text-sm font-medium">Unlimited Token Allowance</p>
          <p className="text-white/30 text-xs mt-1">{fmtNum(used)} tokens used this month</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/40">Monthly Allowance</span>
            <span className="text-white">{fmtNum(allowance)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/40">Used</span>
            <span className="text-amber-400">{fmtNum(used)} ({fmtPct(usagePct)})</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/40">Remaining</span>
            <span className="text-emerald-400">{fmtNum(remaining)}</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden mt-2">
            <div className={`h-full rounded-full ${usagePct >= 90 ? "bg-red-500" : usagePct >= 70 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${usagePct}%` }} />
          </div>
        </div>
      )}
    </Panel>
  );
}