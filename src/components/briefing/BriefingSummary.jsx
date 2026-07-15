import React from "react";
import { Trophy, AlertCircle, FileText } from "lucide-react";

export default function BriefingSummary({ briefing }) {
  const wins = briefing.leadershipWins || [];
  const areas = briefing.improvementAreas || [];
  const summary = briefing.executiveSummary || {};

  return (
    <div className="space-y-4">
      {summary.summary && (
        <Section icon={FileText} title="Executive Summary" accent="text-indigo-400">
          <p className="text-sm text-white/70 leading-relaxed">{summary.summary}</p>
        </Section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={16} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Leadership Wins</h3>
          </div>
          {wins.length > 0 ? (
            <div className="space-y-2">
              {wins.map((w, i) => (
                <div key={i} className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">
                  <div className="text-sm text-white font-medium">{w.title}</div>
                  <div className="text-xs text-white/50 mt-1">{w.description}</div>
                  {w.impact && <div className="text-xs text-emerald-400 mt-1">{w.impact}</div>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-white/30">No wins recorded this week.</p>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Areas for Improvement</h3>
          </div>
          {areas.length > 0 ? (
            <div className="space-y-2">
              {areas.map((a, i) => (
                <div key={i} className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-white font-medium">{a.area}</div>
                    <span className="text-xs text-amber-400 font-semibold">{a.potential_readiness_increase}</span>
                  </div>
                  <div className="text-xs text-white/50 mt-1">{a.why_it_matters}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-white/30">No improvement areas identified.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, accent, children }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className={accent} />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}