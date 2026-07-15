import React from "react";
import { TrendingUp, Gauge, Fingerprint, Building2 } from "lucide-react";

export default function BriefingForecast({ briefing }) {
  const forecast = briefing.promotionForecast || {};
  const momentum = briefing.careerMomentum || {};
  const dna = briefing.leadershipDna || [];
  const companies = briefing.companyIntelligence || [];

  return (
    <div className="space-y-4">
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Promotion Forecast Update</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Metric label="Readiness" value={`${forecast.readiness ?? briefing.executive_readiness ?? 0}%`} sub={forecast.change ? `${forecast.change > 0 ? "+" : ""}${forecast.change}` : null} />
          <Metric label="Probability" value={`${forecast.probability ?? briefing.promotion_probability ?? 0}%`} />
          <Metric label="Timeline" value={forecast.timeline || "—"} small />
          <Metric label="Confidence" value={`${forecast.confidence ?? 0}%`} />
        </div>
        {forecast.reason && <p className="text-xs text-white/50 mt-3 leading-relaxed">{forecast.reason}</p>}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Gauge size={16} className="text-violet-400" />
          <h3 className="text-sm font-semibold text-white">Career Momentum™</h3>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <span className={`text-lg font-bold capitalize ${momentum.current === "increasing" ? "text-emerald-400" : momentum.current === "declining" ? "text-red-400" : "text-amber-400"}`}>
            {momentum.current || "Stable"}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {(momentum.drivers || []).map((d, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2">
              <div className="text-[10px] text-white/40 uppercase tracking-wider">{d.label}</div>
              <div className="text-xs text-white/70">{d.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Fingerprint size={16} className="text-cyan-400" />
          <h3 className="text-sm font-semibold text-white">Leadership DNA Update</h3>
        </div>
        {dna.length > 0 ? (
          <div className="space-y-2">
            {dna.map((c, i) => (
              <div key={i} className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2">
                <span className="text-sm text-white/70">{c.competency}</span>
                <span className={`text-sm font-semibold ${c.change > 0 ? "text-emerald-400" : c.change < 0 ? "text-red-400" : "text-white/40"}`}>
                  {c.change > 0 ? "+" : ""}{c.change}%
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-white/30">No competency changes this week.</p>
        )}
      </div>

      {companies.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={16} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Company Intelligence</h3>
          </div>
          <div className="space-y-2">
            {companies.map((c, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/5 rounded-lg p-3">
                <div className="text-sm text-white font-medium">{c.company}</div>
                <div className="text-xs text-white/50 mt-1">{c.trend}</div>
                <div className="text-xs text-amber-400 mt-1">{c.recommendation}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, sub, small }) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2">
      <div className="text-[10px] text-white/40 uppercase tracking-wider">{label}</div>
      <div className={`${small ? "text-xs" : "text-lg"} font-semibold text-white`}>{value}</div>
      {sub && <div className={`text-xs font-medium ${sub.startsWith("+") ? "text-emerald-400" : "text-red-400"}`}>{sub}</div>}
    </div>
  );
}