import React from "react";


const STATUS_STYLE = {
  current: { dot: "bg-indigo-500", text: "text-indigo-400", label: "Current" },
  active: { dot: "bg-amber-500", text: "text-amber-400", label: "Active" },
  upcoming: { dot: "bg-white/20", text: "text-white/50", label: "Upcoming" },
  future: { dot: "bg-white/10", text: "text-white/30", label: "Future" },
};

export default function JourneyTimeline({ timeline }) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Journey Timeline™</h2>
      <div className="relative">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10" />
        <div className="space-y-4">
          {timeline.map((item, i) => {
            const style = STATUS_STYLE[item.status] || STATUS_STYLE.future;
            return (
              <div key={i} className="relative pl-8">
                <div className={`absolute left-0 top-1 w-3.5 h-3.5 rounded-full border-2 border-background ${style.dot}`} />
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${style.text}`}>{style.label}</span>
                </div>
                <p className="text-white/80 text-sm font-medium">{item.label}</p>
                <p className="text-white/40 text-xs">{item.detail}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}