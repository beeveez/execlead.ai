import React, { useState } from "react";
import SectionCard from "./SectionCard";
import StreamIntelligenceDrawer from "./StreamIntelligenceDrawer";
import { ChevronRight, Activity } from "lucide-react";

const STATUS_COLORS = { healthy: "#10b981", attention: "#f59e0b", blocked: "#ef4444" };

function StreamRow({ stream, onClick }) {
  const color = STATUS_COLORS[stream.status];
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0 text-left group hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm text-white font-medium truncate group-hover:text-indigo-300 transition-colors">{stream.name}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ color, backgroundColor: `${color}1a` }}>
            {stream.status === "healthy" ? "Healthy" : stream.status === "attention" ? "Attention" : "Blocked"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${stream.completion}%`, backgroundColor: color }} />
          </div>
          <span className="text-xs font-medium text-white/60 w-8 text-right">{stream.completion}%</span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-[10px] text-white/30">
          <span>Next: {stream.nextMilestone}</span>
          <span>·</span>
          <span>Est. {stream.estimatedEffort}</span>
        </div>
      </div>
      <ChevronRight size={14} className="text-white/20 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
    </button>
  );
}

export default function StreamProgress({ streams, snapshot, user }) {
  const [activeStream, setActiveStream] = useState(null);

  return (
    <>
      <SectionCard
        title="Executive Stream Intelligence™"
        subtitle="Click any stream for full diagnostics, blockers, trends, and EXEC™ analysis"
        icon={Activity}
        accent="cyan"
        action={<span className="text-[10px] text-white/30 hidden sm:inline">Primary Operational Control Center</span>}
      >
        <div className="space-y-0">
          {streams.map((s) => (
            <StreamRow key={s.id} stream={s} onClick={() => setActiveStream(s.id)} />
          ))}
        </div>
      </SectionCard>

      {activeStream && (
        <StreamIntelligenceDrawer
          streamId={activeStream}
          snapshot={snapshot}
          user={user}
          onClose={() => setActiveStream(null)}
        />
      )}
    </>
  );
}