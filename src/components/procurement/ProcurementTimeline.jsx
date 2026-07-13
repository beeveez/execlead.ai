import React from "react";
import { parseTimeline } from "@/lib/procurementEngine";

const EVENT_STYLES = {
  created: { icon: "➕", color: "text-indigo-400", bg: "bg-indigo-500/10" },
  submitted: { icon: "📤", color: "text-blue-400", bg: "bg-blue-500/10" },
  approved: { icon: "✓", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  rejected: { icon: "✗", color: "text-red-400", bg: "bg-red-500/10" },
  withdrawn: { icon: "↩", color: "text-gray-400", bg: "bg-gray-500/10" },
  cancelled: { icon: "⊘", color: "text-gray-400", bg: "bg-gray-500/10" },
  fulfilled: { icon: "📦", color: "text-teal-400", bg: "bg-teal-500/10" },
  updated: { icon: "✎", color: "text-amber-400", bg: "bg-amber-500/10" },
  note: { icon: "💬", color: "text-violet-400", bg: "bg-violet-500/10" },
};

export default function ProcurementTimeline({ request }) {
  const events = parseTimeline(request);
  if (events.length === 0) return <div className="text-white/30 text-sm">No timeline events recorded.</div>;

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-white/5" />
      <div className="space-y-3">
        {events.map((event, i) => {
          const style = EVENT_STYLES[event.type] || EVENT_STYLES.updated;
          return (
            <div key={i} className="relative flex items-start gap-3 pl-0">
              <div className={`w-8 h-8 rounded-full ${style.bg} ${style.color} flex items-center justify-center text-xs font-bold shrink-0 z-10 border border-white/5`}>
                {style.icon}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <p className="text-sm text-white/70">{event.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {event.user_name && <span className="text-xs text-white/30">{event.user_name}</span>}
                  <span className="text-xs text-white/20">·</span>
                  <span className="text-xs text-white/30">{new Date(event.timestamp).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}