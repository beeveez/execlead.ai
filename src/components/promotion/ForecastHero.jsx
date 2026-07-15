import React from 'react';
import { Gauge, TrendingUp, TrendingDown, Minus, Clock, ShieldCheck } from 'lucide-react';

const MOMENTUM_CONFIG = {
  increasing: { icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Increasing" },
  stable: { icon: Minus, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", label: "Stable" },
  declining: { icon: TrendingDown, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", label: "Declining" },
};

export default function ForecastHero({ forecast }) {
  const readinessColor = forecast.readiness_score >= 75 ? "text-emerald-400" : forecast.readiness_score >= 50 ? "text-amber-400" : "text-rose-400";
  const probColor = forecast.probability_score >= 60 ? "text-emerald-400" : forecast.probability_score >= 40 ? "text-amber-400" : "text-rose-400";
  const confColor = forecast.confidence_score >= 75 ? "text-emerald-400" : forecast.confidence_score >= 50 ? "text-amber-400" : "text-rose-400";
  const mom = MOMENTUM_CONFIG[forecast.momentum] || MOMENTUM_CONFIG.stable;
  const MomIcon = mom.icon;

  return (
    <div className="bg-gradient-to-br from-indigo-500/5 via-cyan-500/[0.02] to-transparent border border-indigo-500/10 rounded-2xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Promotion Readiness */}
        <ScoreGauge
          icon={Gauge}
          label="Promotion Readiness™"
          value={forecast.readiness_score}
          max={100}
          suffix="%"
          color={readinessColor}
          sublabel={`${forecast.current_level} → ${forecast.target_level}`}
        />

        {/* Promotion Probability */}
        <ScoreGauge
          icon={TrendingUp}
          label="Promotion Probability™"
          value={forecast.probability_score}
          max={100}
          suffix="%"
          color={probColor}
          sublabel="likelihood of promotion"
        />

        {/* Career Momentum */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center">
          <div className="flex items-center gap-1.5 mb-2">
            <MomIcon size={12} className={mom.color} />
            <span className="text-[10px] uppercase tracking-wider text-white/40">Career Momentum™</span>
          </div>
          <div className={`text-xl font-bold ${mom.color}`}>{mom.label}</div>
          <div className="text-[9px] text-white/30 mt-1">activity trend (30d)</div>
        </div>

        {/* Timeline */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center">
          <div className="flex items-center gap-1.5 mb-2">
            <Clock size={12} className="text-indigo-400" />
            <span className="text-[10px] uppercase tracking-wider text-white/40">Promotion Timeline™</span>
          </div>
          <div className="text-xl font-bold text-white">{forecast.timeline_label}</div>
          <span className={`text-[9px] uppercase mt-1 ${
            forecast.timeline_confidence === "high" ? "text-emerald-400" :
            forecast.timeline_confidence === "medium" ? "text-amber-400" : "text-rose-400"
          }`}>{forecast.timeline_confidence} confidence</span>
        </div>
      </div>

      {/* Confidence + Component Scores */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className={confColor} />
            <span className="text-[10px] uppercase tracking-wider text-white/40">Forecast Confidence™</span>
            <span className={`text-sm font-bold ${confColor}`}>{forecast.confidence_score}%</span>
          </div>
          {forecast.component_scores && Object.entries(forecast.component_scores).map(([key, comp]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="text-[9px] text-white/30 uppercase">{key}</span>
              <span className={`text-[11px] font-medium ${comp.score >= 70 ? "text-emerald-400" : comp.score >= 50 ? "text-amber-400" : "text-rose-400"}`}>{comp.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScoreGauge({ icon: Icon, label, value, max, suffix, color, sublabel }) {
  const pct = (value / max) * 100;
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={12} className={color} />
        <span className="text-[10px] uppercase tracking-wider text-white/40">{label}</span>
      </div>
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-white/5" />
          <circle
            cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6"
            className={color}
            strokeDasharray={`${(pct / 100) * 264} 264`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-lg font-bold ${color}`}>{value}{suffix}</span>
        </div>
      </div>
      {sublabel && <div className="text-[9px] text-white/30 mt-1 text-center">{sublabel}</div>}
    </div>
  );
}