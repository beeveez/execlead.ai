import React, { useState } from "react";
import { TrendingUp, Download, ChevronDown, ChevronUp } from "lucide-react";
import { EXPLAINABLE_PRIVACY_CONTROLS, PRIVACY_HISTORICAL_TREND } from "@/lib/privacyEngine";

export default function ExplainablePrivacyScore() {
  const [expanded, setExpanded] = useState(null);
  const totalScore = Math.round(EXPLAINABLE_PRIVACY_CONTROLS.reduce((s, c) => s + c.contribution, 0));
  const totalGap = EXPLAINABLE_PRIVACY_CONTROLS.reduce((s, c) => s + c.gap, 0).toFixed(2);
  const totalEngHours = EXPLAINABLE_PRIVACY_CONTROLS.reduce((s, c) => s + c.eng_hours, 0);

  return (
    <div className="space-y-6">
      {/* Overall Score + Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 text-center">
          <div className="text-5xl font-bold text-emerald-400">{totalScore}</div>
          <div className="text-white/30 text-xs mt-1">Overall Privacy Readiness™</div>
          <div className="text-white/20 text-[10px] mt-1">/100</div>
        </div>
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-emerald-400" />
            <span className="text-white/60 text-xs font-medium">Historical Trend</span>
          </div>
          <div className="flex items-end justify-between gap-1 h-16">
            {PRIVACY_HISTORICAL_TREND.map((t) => (
              <div key={t.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-emerald-500/20 rounded-t" style={{ height: `${t.score}%` }} />
                <span className="text-[8px] text-white/30">{t.month}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white/40 text-xs">Remaining Gap</span>
              <span className="text-amber-400 text-xs font-medium">{totalGap} pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40 text-xs">Est. Engineering Hours</span>
              <span className="text-white/60 text-xs font-medium">{totalEngHours}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40 text-xs">Blocking Issues</span>
              <span className="text-emerald-400 text-xs font-medium">0</span>
            </div>
            <button className="w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/60 transition-colors">
              <Download size={12} /> Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Control Breakdown */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Explainable Privacy Score™ — Control Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-3 py-2 text-white/40 font-medium">Control</th>
                <th className="text-center px-3 py-2 text-white/40 font-medium">Weight</th>
                <th className="text-center px-3 py-2 text-white/40 font-medium">Score</th>
                <th className="text-center px-3 py-2 text-white/40 font-medium">Contribution</th>
                <th className="text-center px-3 py-2 text-white/40 font-medium">Gap</th>
                <th className="text-center px-3 py-2 text-white/40 font-medium">Eng Hours</th>
                <th className="text-center px-3 py-2 text-white/40 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {EXPLAINABLE_PRIVACY_CONTROLS.map((c) => (
                <React.Fragment key={c.id}>
                  <tr className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer" onClick={() => setExpanded(expanded === c.id ? null : c.id)}>
                    <td className="px-3 py-2.5 text-white/70">{c.label}</td>
                    <td className="px-3 py-2.5 text-center text-white/40">{c.weight}%</td>
                    <td className="px-3 py-2.5 text-center text-white/60">{c.score}</td>
                    <td className="px-3 py-2.5 text-center text-emerald-400">{c.contribution.toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-center text-amber-400">{c.gap > 0 ? c.gap.toFixed(2) : '—'}</td>
                    <td className="px-3 py-2.5 text-center text-white/40">{c.eng_hours > 0 ? `${c.eng_hours}h` : '—'}</td>
                    <td className="px-3 py-2.5 text-center">
                      {expanded === c.id ? <ChevronUp size={12} className="inline text-white/40" /> : <ChevronDown size={12} className="inline text-white/40" />}
                    </td>
                  </tr>
                  {expanded === c.id && (
                    <tr>
                      <td colSpan={7} className="px-3 py-3 bg-white/[0.02]">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px]">
                          <div>
                            <div className="text-white/40 font-medium mb-1">Recommendations</div>
                            {c.recommendations.length > 0 ? (
                              <ul className="space-y-0.5">{c.recommendations.map((r, i) => <li key={i} className="text-amber-400/80">• {r}</li>)}</ul>
                            ) : <span className="text-emerald-400/60">No recommendations — fully compliant</span>}
                          </div>
                          <div>
                            <div className="text-white/40 font-medium mb-1">Dependencies</div>
                            <ul className="space-y-0.5">{c.dependencies.map((d, i) => <li key={i} className="text-white/50">• {d}</li>)}</ul>
                          </div>
                          <div>
                            <div className="text-white/40 font-medium mb-1">Status</div>
                            <span className={c.blocking ? 'text-red-400' : 'text-emerald-400'}>
                              {c.blocking ? '⚠ Blocking Issue' : '✓ No blocking issues'}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}