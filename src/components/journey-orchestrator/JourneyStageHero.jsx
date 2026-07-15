import React from "react";
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";

const MOMENTUM_ICON = { increasing: TrendingUp, stable: Minus, declining: TrendingDown };
const MOMENTUM_COLOR = { increasing: "text-emerald-400", stable: "text-white/50", declining: "text-rose-400" };

export default function JourneyStageHero({ data, user }) {
  const { stage, careerGoal, readiness } = data;
  const MomentumIcon = MOMENTUM_ICON[readiness.momentum] || Minus;

  return (
    <div className="bg-gradient-to-br from-indigo-500/10 via-violet-500/5 to-transparent border border-indigo-500/15 rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="text-4xl">{stage.icon}</div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-indigo-400 font-semibold">Journey Stage</div>
            <h1 className="text-2xl font-bold text-white">{stage.title}</h1>
            <p className="text-white/40 text-sm">{stage.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className={`flex items-center gap-1 ${MOMENTUM_COLOR[readiness.momentum]}`}>
            <MomentumIcon size={14} />
            {readiness.momentum}
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm text-white/50">
        <span className="text-white/30">Goal:</span>
        <span className="text-white font-medium">{careerGoal.label}</span>
        <ArrowRight size={12} className="text-white/30" />
        <span className="text-indigo-400">{stage.nextStage ? stage.nextStage.title : "Legacy"}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric label="Executive Readiness™" value={`${readiness.score}%`} />
        <Metric label="Promotion Probability" value={`${readiness.probability}%`} />
        <Metric label="Timeline" value={readiness.timeline} />
        <Metric label="Confidence" value={`${readiness.confidence}%`} />
      </div>

      {stage.nextStage && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-white/40 mb-1.5">
            <span>Progress to {stage.nextStage.title}</span>
            <span className="text-white/60 font-medium">{stage.progress}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all" style={{ width: `${stage.progress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-lg px-3 py-2">
      <div className="text-white/30 text-[10px] uppercase tracking-wider">{label}</div>
      <div className="text-white font-bold text-sm mt-0.5">{value}</div>
    </div>
  );
}