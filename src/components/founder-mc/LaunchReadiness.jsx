import React from "react";
import SectionCard from "./SectionCard";
import ScoreRing from "./ScoreRing";
import { Rocket, AlertTriangle, CheckCircle2 } from "lucide-react";

const LEVELS = [
  { level: 0, name: "Development", short: "L0" },
  { level: 1, name: "Functional", short: "L1" },
  { level: 2, name: "Stable", short: "L2" },
  { level: 3, name: "Operational", short: "L3" },
  { level: 4, name: "Enterprise Ready", short: "L4" },
  { level: 5, name: "Public Launch Ready", short: "L5" },
];

export default function LaunchReadiness({ launch }) {
  return (
    <SectionCard
      title="Launch Readiness"
      subtitle={launch.launchReady ? "✓ Launch Ready" : "Not yet launch ready"}
      icon={Rocket}
      accent="emerald"
    >
      <div className="flex items-center gap-5 flex-wrap">
        <ScoreRing score={launch.score} size={90} label={launch.levelShort} color={launch.color} />
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-bold text-white">{launch.levelName}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ color: launch.color, backgroundColor: `${launch.color}1a` }}>
              {launch.levelShort}
            </span>
          </div>
          <div className="flex items-center gap-1 mb-3">
            {LEVELS.map((l) => (
              <div key={l.level} className={`h-1.5 flex-1 rounded-full ${l.level <= launch.level ? "" : "bg-white/5"}`}
                style={l.level <= launch.level ? { backgroundColor: launch.color } : {}} />
            ))}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-white/30">
            {LEVELS.map((l) => <span key={l.level} className={l.level === launch.level ? "text-white font-medium" : ""}>{l.short}</span>)}
          </div>
        </div>
      </div>
      {launch.blockers.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={12} className="text-amber-400" />
            <span className="text-[11px] font-medium text-amber-400 uppercase tracking-wider">Remaining Blockers ({launch.blockers.length})</span>
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {launch.blockers.map((b, i) => (
              <div key={i} className="flex items-center justify-between text-xs bg-white/[0.02] border border-white/5 rounded-lg px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-white/30 text-[10px]">{b.phase}</span>
                  <span className="text-white/60">{b.label}</span>
                </div>
                <span className="text-white/40 text-[10px]">{b.detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {launch.blockers.length === 0 && launch.launchReady && (
        <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm">
          <CheckCircle2 size={14} /> All launch criteria met — platform is ready for public launch.
        </div>
      )}
    </SectionCard>
  );
}