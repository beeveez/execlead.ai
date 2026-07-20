import React from "react";
import { Users, Inbox, Eye, CheckCircle2, Mail, Zap } from "lucide-react";

export default function CapacityDisplay({ capacity, accepted, remaining, underReview, approved, invited, activated, applicationsReceived }) {
  const pct = capacity > 0 ? Math.round((accepted / capacity) * 100) : 0;
  const counters = [
    { icon: Inbox, label: "Received", value: applicationsReceived ?? "—" },
    { icon: Eye, label: "Under Review", value: underReview ?? "—" },
    { icon: CheckCircle2, label: "Approved", value: approved ?? "—" },
    { icon: Mail, label: "Invited", value: invited ?? "—" },
    { icon: Zap, label: "Activated", value: activated ?? "—" },
  ];
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Users size={14} className="text-amber-400" />
        <span className="text-xs text-white/50 font-medium">Founding Member Capacity</span>
        <span className="text-[10px] text-white/30 ml-auto">{approved ?? 0} / {capacity} approved</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-white/30">{pct}% full</span>
        <span className="text-[10px] text-emerald-400">{remaining} seats remaining</span>
      </div>
      <div className="grid grid-cols-5 gap-2 mt-4 pt-3 border-t border-white/5">
        {counters.map((c) => (
          <div key={c.label} className="text-center">
            <c.icon size={11} className="text-white/30 mx-auto mb-1" />
            <div className="text-sm font-bold text-white">{c.value}</div>
            <div className="text-[8px] text-white/30 uppercase tracking-wider">{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}