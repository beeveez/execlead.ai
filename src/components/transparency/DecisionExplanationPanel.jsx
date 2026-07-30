import React from "react";
import { Sparkles, FileDown, BookOpen, TrendingUp, ShieldCheck, Layers, GitBranch } from "lucide-react";

/**
 * DecisionExplanationPanel — renders the AI Decision Transparency™ explanation
 * for a recommendation: why, primary evidence, reason, historical effectiveness,
 * confidence, expected improvement, alternatives, model version, + trace export.
 */
export default function DecisionExplanationPanel({ explanation, onExport }) {
  if (!explanation) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <Header />
        <div className="text-center py-6 text-xs text-white/30">
          Generate and complete recommendations to surface a decision explanation.
        </div>
      </div>
    );
  }

  const e = explanation;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <Header onExport={onExport} />

      {/* Why this recommendation */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-white mb-1">
          Why this recommendation? <span className="text-white/40 font-normal">— {e.recommendation.label} for {e.recommendation.competency}</span>
        </h4>
        <p className="text-xs text-white/60 leading-relaxed">{e.reason}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Primary Evidence */}
        <Section icon={BookOpen} title="Primary Evidence" color="#0ea5e9">
          {e.evidenceUsed.length ? (
            <ul className="space-y-1">
              {e.evidenceUsed.map((x, i) => (
                <li key={i} className="text-xs text-white/60 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  {x.count} {x.type}
                </li>
              ))}
              <li className="text-[11px] text-white/40 pt-1">Reliability {e.reliability}%</li>
            </ul>
          ) : (
            <p className="text-xs text-white/40">No outcomes attributed yet.</p>
          )}
        </Section>

        {/* Historical Effectiveness */}
        <Section icon={TrendingUp} title="Historical Effectiveness" color="#10b981">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{e.historicalEffectiveness.score}</span>
            <span className="text-xs text-white/40">/100</span>
          </div>
          <div className="text-xs mt-1" style={{ color: e.historicalEffectiveness.grade?.color || "#f59e0b" }}>
            {e.historicalEffectiveness.grade?.label || "Unproven"}
          </div>
          <div className="text-[11px] text-white/40 mt-1">
            {e.outcomeHistory.count} outcome{e.outcomeHistory.count === 1 ? "" : "s"} · +{e.outcomeHistory.totalGain} total gain
          </div>
        </Section>

        {/* Confidence */}
        <Section icon={ShieldCheck} title="Confidence" color="#8b5cf6">
          <div className="text-lg font-bold text-white">{e.confidence.label}</div>
          <div className="text-xs text-white/40">{e.confidence.value}%</div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
            <div className="h-full rounded-full bg-violet-500" style={{ width: `${e.confidence.value}%` }} />
          </div>
        </Section>

        {/* Expected Improvement */}
        <Section icon={Sparkles} title="Expected Improvement" color="#f59e0b">
          <div className="space-y-1 text-xs">
            <Row label="Readiness" value={`+${e.expectedGain.readiness}`} />
            <Row label="Confidence" value={`+${e.expectedGain.confidence}`} />
            <Row label="Reliability" value={`+${e.expectedGain.reliability}`} />
          </div>
        </Section>
      </div>

      {/* Alternatives */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <Layers size={13} className="text-white/40" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Alternatives Considered</span>
        </div>
        {e.alternatives.length ? (
          <div className="space-y-1.5">
            {e.alternatives.map((a) => (
              <div key={a.activityType} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
                <div>
                  <div className="text-xs text-white/80">{a.label}</div>
                  <div className="text-[11px] text-white/40">{a.whyNot}</div>
                </div>
                <div className="text-xs text-white/50">{a.effectivenessScore}/100</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-white/40">No alternatives tracked yet.</p>
        )}
      </div>

      {/* Model + trace footer */}
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-white/40">
          <GitBranch size={11} />
          Model {e.modelVersion} · Trace ts {new Date(e.trace.timestamp).toLocaleDateString()}
        </div>
        {onExport && (
          <button
            onClick={onExport}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-white/60 hover:text-white/80 transition-colors"
          >
            <FileDown size={12} />
            Export Decision Trace™
          </button>
        )}
      </div>
    </div>
  );
}

function Header({ onExport }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Sparkles size={16} className="text-cyan-400" />
      <h3 className="text-white font-semibold text-sm">AI Decision Transparency™</h3>
      <span className="text-[10px] text-white/30">Why this recommendation?</span>
    </div>
  );
}

function Section({ icon: Icon, title, color, children }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={12} style={{ color }} />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">{title}</span>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/50">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  );
}