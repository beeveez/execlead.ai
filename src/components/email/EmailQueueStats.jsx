import React from "react";

const QUEUE_STATUSES = [
  { key: "queued", label: "Queued", color: "text-slate-300", bg: "bg-slate-500/10", dot: "bg-slate-400" },
  { key: "sending", label: "Sending", color: "text-blue-300", bg: "bg-blue-500/10", dot: "bg-blue-400" },
  { key: "delivered", label: "Delivered", color: "text-emerald-300", bg: "bg-emerald-500/10", dot: "bg-emerald-400" },
  { key: "opened", label: "Opened", color: "text-cyan-300", bg: "bg-cyan-500/10", dot: "bg-cyan-400" },
  { key: "clicked", label: "Clicked", color: "text-teal-300", bg: "bg-teal-500/10", dot: "bg-teal-400" },
  { key: "bounced", label: "Bounced", color: "text-orange-300", bg: "bg-orange-500/10", dot: "bg-orange-400" },
  { key: "spam", label: "Spam", color: "text-red-300", bg: "bg-red-500/10", dot: "bg-red-400" },
  { key: "failed", label: "Failed", color: "text-red-400", bg: "bg-red-500/10", dot: "bg-red-500" },
  { key: "retry", label: "Retry", color: "text-amber-300", bg: "bg-amber-500/10", dot: "bg-amber-400" },
  { key: "cancelled", label: "Cancelled", color: "text-white/40", bg: "bg-white/5", dot: "bg-white/30" },
];

export default function EmailQueueStats({ events }) {
  // Map legacy "sent" status to "delivered" for display
  const counts = {};
  events.forEach(e => {
    const status = e.delivery_status === "sent" ? "delivered" : e.delivery_status;
    counts[status] = (counts[status] || 0) + 1;
  });

  const total = events.length;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Email Queue</h3>
        <span className="text-xs text-white/30">{total} total events</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {QUEUE_STATUSES.map(s => {
          const count = counts[s.key] || 0;
          return (
            <div key={s.key} className={`rounded-lg p-4 ${s.bg} border border-white/5`}>
              <div className="flex items-center gap-1.5 mb-2">
                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                <span className="text-xs text-white/40">{s.label}</span>
              </div>
              <div className={`text-2xl font-bold ${s.color}`}>{count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}