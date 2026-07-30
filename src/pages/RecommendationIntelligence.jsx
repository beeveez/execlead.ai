import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useRecommendationIntelligence } from "@/hooks/useRecommendationIntelligence";
import { useDecisionTransparency } from "@/hooks/useDecisionTransparency";
import AITrustScorePanel from "@/components/transparency/AITrustScorePanel";
import DecisionExplanationPanel from "@/components/transparency/DecisionExplanationPanel";
import {
  Sparkles,
  TrendingUp,
  Target,
  Award,
  AlertTriangle,
  Gauge,
  History,
  RefreshCw,
  FlaskConical,
  ArrowUpCircle,
  ArrowDownCircle,
  CheckCircle2,
  BarChart3,
  Layers,
} from "lucide-react";

const PRIORITY_COLORS = { high: "#ef4444", medium: "#f59e0b", low: "#64748b" };

export default function RecommendationIntelligence() {
  const {
    loading,
    intelligence,
    activeModel,
    challenger,
    generateRecommendation,
    registerModel,
    promoteChallenger,
    rollbackTo,
    refresh,
  } = useRecommendationIntelligence();
  const { explanation, trustScore, exportTrace } = useDecisionTransparency();
  const [newVersion, setNewVersion] = useState("");
  const [genOpen, setGenOpen] = useState(false);

  if (loading || !intelligence) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
        <span className="text-white/40 text-sm">Loading Recommendation Intelligence…</span>
      </div>
    );
  }

  const o = intelligence.overall;
  const archiveVersions = []; // archived models are read from registry if needed; kept minimal

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-400" />
              Recommendation Intelligence™
            </h1>
            <p className="text-white/40 text-xs mt-1">
              Continuously evaluates whether recommendations produce better leadership outcomes — and
              automatically improves future recommendations. Recommend. Measure. Learn. Improve.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-medium text-indigo-400">
              Model {o.modelVersion}
            </span>
            {o.challengerVersion && (
              <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-[11px] font-medium text-amber-400">
                Challenger {o.challengerVersion}
              </span>
            )}
            <button
              onClick={() => setGenOpen((s) => !s)}
              className="px-3 py-1.5 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-medium hover:opacity-90 transition-opacity"
            >
              + Generate
            </button>
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Kpi icon={Target} label="Generated" value={o.recommendationsGenerated} color="#6366f1" />
        <Kpi icon={CheckCircle2} label="Acceptance" value={`${o.acceptanceRate}%`} color="#0ea5e9" />
        <Kpi icon={Award} label="Completion" value={`${o.completionRate}%`} color="#10b981" />
        <Kpi icon={TrendingUp} label="Avg Readiness Gain" value={`+${o.averageReadinessGain}`} color="#f59e0b" />
        <Kpi icon={Gauge} label="Prediction Accuracy" value={`${o.predictionAccuracy}%`} color="#8b5cf6" />
        <Kpi icon={Sparkles} label="Effectiveness" value={`${o.effectivenessScore}/100`} color="#ec4899" />
      </div>

      {/* AI Trust Score™ */}
      <AITrustScorePanel trustScore={trustScore} />

      {/* Generate panel */}
      {genOpen && (
        <GeneratePanel
          onGenerate={(payload) => {
            generateRecommendation(payload);
            refresh();
            setGenOpen(false);
          }}
        />
      )}

      {/* Top / Lowest performing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PerfList
          title="Top Performing Recommendations"
          icon={ArrowUpCircle}
          color="#10b981"
          items={intelligence.topPerformers}
          empty="No top performers yet — complete recommendations to surface them."
        />
        <PerfList
          title="Lowest Performing / Retire"
          icon={ArrowDownCircle}
          color="#ef4444"
          items={intelligence.lowestPerformers}
          empty="No underperformers — every tracked recommendation is producing outcomes."
        />
      </div>

      {/* Effectiveness by activity */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} className="text-indigo-400" />
          <h3 className="text-white font-semibold text-sm">Effectiveness Score™ by Recommendation</h3>
        </div>
        {intelligence.byActivityType.length === 0 ? (
          <EmptyState text="No recommendations tracked yet. Generate one to start measuring effectiveness." />
        ) : (
          <div className="space-y-2">
            {intelligence.byActivityType.map((r) => (
              <div key={r.activityType} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{r.label}</span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-semibold"
                      style={{ background: `${r.grade.color}20`, color: r.grade.color }}
                    >
                      {r.grade.label}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-white">{r.effectivenessScore}/100</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${r.effectivenessScore}%`, background: r.grade.color }}
                  />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/40">
                  <span>Generated {r.generated}</span>
                  <span>Accepted {r.acceptanceRate}%</span>
                  <span>Completed {r.completionRate}%</span>
                  <span>Outcomes {r.outcomes} ({r.outcomeImprovementRate}%)</span>
                  <span>Evidence quality {r.evidenceQuality}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Grade legend */}
        <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-white/5">
          {intelligence.grades.map((g) => (
            <div key={g.id} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: g.color }} />
              <span className="text-[10px] text-white/40">{g.label} ≥{g.min}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Decision Transparency™ — why this recommendation */}
      <DecisionExplanationPanel explanation={explanation} onExport={exportTrace} />

      {/* Model Calibration */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Gauge size={16} className="text-violet-400" />
          <h3 className="text-white font-semibold text-sm">Model Calibration™ — Predicted vs Actual</h3>
        </div>
        {intelligence.modelCalibration.byType.length === 0 ? (
          <EmptyState text="No calibration data yet. Complete recommendations with predicted gains to measure accuracy." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-white/40 border-b border-white/5">
                  <th className="text-left py-2 font-medium">Recommendation</th>
                  <th className="text-right py-2 font-medium">Predicted</th>
                  <th className="text-right py-2 font-medium">Actual</th>
                  <th className="text-right py-2 font-medium">Accuracy</th>
                  <th className="text-right py-2 font-medium">Bias</th>
                  <th className="text-right py-2 font-medium">Direction</th>
                </tr>
              </thead>
              <tbody>
                {intelligence.modelCalibration.byType.map((c) => (
                  <tr key={c.activityType} className="border-b border-white/5 last:border-0">
                    <td className="py-2 text-white/80">{c.label}</td>
                    <td className="py-2 text-right text-white/60">+{c.avgPredicted}</td>
                    <td className="py-2 text-right text-white/60">+{c.avgActual}</td>
                    <td className="py-2 text-right text-white font-semibold">{c.accuracy}%</td>
                    <td className="py-2 text-right text-white/60">{c.bias > 0 ? `+${c.bias}` : c.bias}</td>
                    <td className="py-2 text-right">
                      <span
                        className="text-[10px]"
                        style={{
                          color:
                            c.direction === "accurate"
                              ? "#10b981"
                              : c.direction === "overestimation"
                              ? "#ef4444"
                              : "#f59e0b",
                        }}
                      >
                        {c.direction}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trends */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <History size={16} className="text-cyan-400" />
          <h3 className="text-white font-semibold text-sm">Recommendation Trends</h3>
        </div>
        {intelligence.trends.length === 0 ? (
          <EmptyState text="No trend data yet." />
        ) : (
          <div className="flex items-end gap-2 h-32">
            {intelligence.trends.map((t) => {
              const max = Math.max(...intelligence.trends.map((x) => x.generated), 1);
              return (
                <div key={t.week} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col justify-end h-24 gap-0.5">
                    <div className="w-full bg-indigo-500/60 rounded-t" style={{ height: `${(t.generated / max) * 100}%` }} title={`Generated ${t.generated}`} />
                  </div>
                  <span className="text-[9px] text-white/30">{t.week.replace(/.*-W/, "W")}</span>
                </div>
              );
            })}
          </div>
        )}
        <div className="flex gap-4 mt-2 text-[10px] text-white/40">
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-indigo-500/60 rounded" />Generated</span>
        </div>
      </div>

      {/* Model versioning controls */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Layers size={16} className="text-amber-400" />
          <h3 className="text-white font-semibold text-sm">Model Versioning — Champion / Challenger</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-medium text-white">Champion</span>
            </div>
            <div className="text-sm text-white/80">{activeModel?.version || "v1"}</div>
            <p className="text-[11px] text-white/40 mt-1">{activeModel?.description || "Active recommendation model"}</p>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-xs font-medium text-white">Challenger</span>
            </div>
            {challenger ? (
              <>
                <div className="text-sm text-white/80">{challenger.version}</div>
                <p className="text-[11px] text-white/40 mt-1">{challenger.description}</p>
                <button
                  onClick={() => promoteChallenger()}
                  className="mt-2 px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium hover:bg-emerald-500/25 transition-colors"
                >
                  Promote to Champion
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <input
                  value={newVersion}
                  onChange={(e) => setNewVersion(e.target.value)}
                  placeholder="v2"
                  className="flex-1 bg-white/5 border border-white/10 rounded-md px-2 py-1 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/40"
                />
                <button
                  onClick={() => {
                    if (newVersion.trim()) {
                      registerModel(newVersion.trim(), `Challenger model ${newVersion.trim()}`);
                      setNewVersion("");
                    }
                  }}
                  className="px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-medium hover:bg-amber-500/25 transition-colors"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
          <FlaskConical size={12} className="text-white/30" />
          <span className="text-[11px] text-white/40">
            Promote a challenger once it outperforms the champion. The previous champion is archived for rollback.
          </span>
        </div>
      </div>

      <div className="text-center pt-2">
        <Link to="/outcome-intelligence" className="text-xs text-indigo-400 hover:text-indigo-300">
          ← Back to Executive Outcome Intelligence
        </Link>
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon size={14} style={{ color }} />
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-[10px] text-white/30 uppercase tracking-wider">{label}</div>
    </div>
  );
}

function PerfList({ title, icon: Icon, color, items, empty }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} style={{ color }} />
        <h3 className="text-white font-semibold text-sm">{title}</h3>
      </div>
      {items.length === 0 ? (
        <EmptyState text={empty} />
      ) : (
        <div className="space-y-2">
          {items.map((r) => (
            <div key={r.activityType} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl p-3">
              <div>
                <div className="text-sm text-white font-medium">{r.label}</div>
                <div className="text-[11px] text-white/40">
                  {r.outcomes} outcomes · +{r.avgActual} avg gain · {r.outcomeImprovementRate}% improvement
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold" style={{ color: r.grade.color }}>{r.effectivenessScore}</div>
                <div className="text-[10px] text-white/30">{r.grade.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GeneratePanel({ onGenerate }) {
  const [activityType, setActivityType] = useState("simulation_completed");
  const [competency, setCompetency] = useState("");
  const [predictedGain, setPredictedGain] = useState(6);
  const [priority, setPriority] = useState("medium");

  const activities = [
    { id: "simulation_completed", label: "Executive Simulation" },
    { id: "coaching_session", label: "Coaching Session" },
    { id: "challenge_solved", label: "Daily Challenge" },
    { id: "debate_completed", label: "Executive Debate" },
    { id: "journal_entry", label: "Journal Reflection" },
    { id: "lesson_completed", label: "Academy Lesson" },
  ];

  return (
    <div className="bg-white/[0.02] border border-indigo-500/20 rounded-2xl p-4">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <Sparkles size={14} className="text-indigo-400" /> Generate Recommendation
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Recommendation Type">
          <select value={activityType} onChange={(e) => setActivityType(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500/40">
            {activities.map((a) => (
              <option key={a.id} value={a.id} className="bg-[#0a0a0f]">{a.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Competency">
          <input value={competency} onChange={(e) => setCompetency(e.target.value)} placeholder="Strategic Thinking" className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" />
        </Field>
        <Field label="Predicted Gain (+readiness)">
          <input type="number" value={predictedGain} onChange={(e) => setPredictedGain(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500/40" />
        </Field>
        <Field label="Priority">
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500/40">
            <option value="high" className="bg-[#0a0a0f]">High</option>
            <option value="medium" className="bg-[#0a0a0f]">Medium</option>
            <option value="low" className="bg-[#0a0a0f]">Low</option>
          </select>
        </Field>
      </div>
      <button
        onClick={() => onGenerate({ activityType, competency, predictedGain, priority })}
        className="mt-3 px-4 py-1.5 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-medium hover:opacity-90 transition-opacity"
      >
        Generate Recommendation
      </button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">{label}</label>
      {children}
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="text-center py-6 text-xs text-white/30">{text}</div>;
}