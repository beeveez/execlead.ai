import React from "react";
import {
  Inbox, Send, CheckCircle, XCircle, Clock, RotateCw, Activity,
} from "lucide-react";

const QUEUE_STATUSES = [
  { key: "pending", label: "Pending", icon: Inbox, color: "text-slate-300", bg: "bg-slate-500/10", dot: "bg-slate-400", desc: "queued" },
  { key: "processing", label: "Processing", icon: Send, color: "text-blue-300", bg: "bg-blue-500/10", dot: "bg-blue-400", desc: "actively sending" },
  { key: "delivered", label: "Delivered", icon: CheckCircle, color: "text-emerald-300", bg: "bg-emerald-500/10", dot: "bg-emerald-400", desc: "successfully sent" },
  { key: "failed", label: "Failed", icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", dot: "bg-red-500", desc: "bounced/spam/failed" },
  { key: "scheduled", label: "Scheduled", icon: Clock, color: "text-purple-300", bg: "bg-purple-500/10", dot: "bg-purple-400", desc: "future send" },
  { key: "retrying", label: "Retrying", icon: RotateCw, color: "text-amber-300", bg: "bg-amber-500/10", dot: "bg-amber-400", desc: "retry attempt" },
];

export default function EmailQueueStats({ events }) {
  const counts = {
    pending: 0,
    processing: 0,
    delivered: 0,
    failed: 0,
    scheduled: 0,
    retrying: 0,
  };

  events.forEach(e => {
    const s = e.delivery_status;
    if (s === "queued") counts.pending++;
    else if (s === "sending") counts.processing++;
    else if (s === "delivered" || s === "sent" || s === "opened" || s === "clicked") counts.delivered++;
    else if (s === "failed" || s === "bounced" || s === "spam") counts.failed++;
    else if (s === "retry") counts.retrying++;
    // scheduled is not currently used by the system
  });

  const total = events.length;
  const activeQueue = counts.pending + counts.processing + counts.retrying;

  return (
    <div className="space-y-4">
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Email Queue Management</h3>
            <p className="text-white/30 text-xs mt-0.5">Live counts of all email delivery states</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs text-white/30">
              <Activity size={11} className={activeQueue > 0 ? "text-amber-400 animate-pulse" : "text-emerald-400"} />
              {activeQueue > 0 ? `${activeQueue} active` : "Idle"}
            </span>
            <span className="text-xs text-white/30">{total} total</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUEUE_STATUSES.map(s => {
            const count = counts[s.key] || 0;
            return (
              <div key={s.key} className={`rounded-lg p-4 ${s.bg} border border-white/5 relative overflow-hidden`}>
                {count > 0 && <span className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`} />}
                <div className="flex items-center gap-1.5 mb-2">
                  <s.icon size={14} className={s.color} />
                  <span className="text-xs text-white/40">{s.label}</span>
                </div>
                <div className={`text-2xl font-bold ${s.color}`}>{count}</div>
                <div className="text-white/20 text-[10px] mt-1">{s.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {activeQueue > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4">
          <div className="flex items-center gap-2 text-amber-400 text-sm">
            <Activity size={14} className="animate-pulse" />
            <span className="font-medium">{activeQueue} email(s) currently in the active queue</span>
          </div>
          <p className="text-white/40 text-xs mt-1 ml-6">
            {counts.pending} pending, {counts.processing} processing, {counts.retrying} retrying. These emails are being processed by the system.
          </p>
        </div>
      )}
    </div>
  );
}