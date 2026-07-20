import React from "react";
import { Users, Inbox, Mail, Eye, FileQuestion, Calendar, CheckCircle2, Send, Zap, XCircle, Ban } from "lucide-react";

export default function CapacityDisplay({ capacity, accepted, remaining, underReview, approved, invited, activated, applicationsReceived, emailVerified, additionalInfoRequired, interview, invitationSent, declined, withdrawn, seatsRemaining, compact }) {
  const acceptedCount = accepted ?? (approved || 0) + (invitationSent || invited || 0) + (activated || 0);
  const pct = capacity > 0 ? Math.round((acceptedCount / capacity) * 100) : 0;
  const seats = seatsRemaining ?? remaining ?? Math.max(capacity - acceptedCount, 0);

  const counters = [
    { icon: Inbox, label: "Received", value: applicationsReceived ?? "—" },
    { icon: Mail, label: "Verified", value: emailVerified ?? 0 },
    { icon: Eye, label: "Under Review", value: underReview ?? 0 },
    { icon: FileQuestion, label: "Info Req.", value: additionalInfoRequired ?? 0 },
    { icon: Calendar, label: "Interview", value: interview ?? 0 },
    { icon: CheckCircle2, label: "Approved", value: approved ?? 0 },
    { icon: Send, label: "Invited", value: invitationSent ?? invited ?? 0 },
    { icon: Zap, label: "Activated", value: activated ?? 0 },
    { icon: XCircle, label: "Declined", value: declined ?? 0 },
    { icon: Ban, label: "Withdrawn", value: withdrawn ?? 0 },
  ];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Users size={14} className="text-amber-400" />
        <span className="text-xs text-white/50 font-medium">Founding Member Capacity</span>
        <span className="text-[10px] text-white/30 ml-auto">{acceptedCount} / {capacity} accepted</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-white/30">{pct}% filled</span>
        <span className="text-[10px] text-emerald-400 font-medium">{seats} seats remaining</span>
      </div>
      {!compact && (
        <div className="grid grid-cols-5 gap-2 mt-4 pt-3 border-t border-white/5">
          {counters.map((c) => (
            <div key={c.label} className="text-center">
              <c.icon size={11} className="text-white/30 mx-auto mb-1" />
              <div className="text-sm font-bold text-white">{c.value}</div>
              <div className="text-[8px] text-white/30 uppercase tracking-wider leading-tight">{c.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}