import React from "react";
import { ArrowRight } from "lucide-react";

const STAGES = [
  ["Assess", "Establish readiness"],
  ["Identify Gaps", "Prioritize capabilities"],
  ["Coach", "Receive AI guidance"],
  ["Practice", "Work through scenarios"],
  ["Build Evidence", "Capture development"],
  ["Track Journey", "See progress over time"],
  ["Demonstrate & Grow", "Strengthen readiness"],
];

export default function LeadershipJourneyModel() {
  return (
    <div className="relative mx-auto mt-12 max-w-7xl border-t border-white/10 pt-7">
      <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-wider text-white/45">
        One Leadership Journey. One AI Platform.
      </p>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-7">
        {STAGES.map(([stage, detail], index) => (
          <div key={stage} className="flex min-w-0 items-center gap-2">
            <div className="flex min-h-16 flex-1 flex-col items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-2 text-center">
              <span className="text-xs font-semibold text-white/80">{stage}</span>
              <span className="mt-1 text-[10px] leading-tight text-white/35">{detail}</span>
            </div>
            {index < STAGES.length - 1 && <ArrowRight size={13} className="hidden shrink-0 text-brand-exec-gold/60 md:block" />}
          </div>
        ))}
      </div>
    </div>
  );
}