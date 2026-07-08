import React from "react";
import { Clock } from "lucide-react";

export default function AgendaTimeline({ agenda }) {
  if (!agenda || agenda.length === 0) return null;

  return (
    <div className="space-y-0">
      {agenda.map((item, idx) => (
        <div key={idx} className="flex gap-3 relative">
          {/* Timeline line */}
          {idx < agenda.length - 1 && (
            <div className="absolute left-[15px] top-8 bottom-0 w-px bg-white/5" />
          )}
          <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 z-10">
            <Clock size={13} className="text-indigo-400" />
          </div>
          <div className="flex-1 pb-4">
            <div className="flex items-baseline gap-2">
              {item.time && <span className="text-xs font-mono text-indigo-300">{item.time}</span>}
              <h4 className="text-white text-sm font-medium">{item.title}</h4>
            </div>
            {item.speaker && <p className="text-white/40 text-xs mt-0.5">{item.speaker}</p>}
            {item.description && <p className="text-white/30 text-xs mt-1 leading-relaxed">{item.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}