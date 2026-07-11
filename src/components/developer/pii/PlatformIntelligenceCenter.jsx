import React, { useMemo } from "react";
import {
  TrendingUp, TrendingDown, Sparkles, Brain,
  Award, Target, Zap, Download,
} from "lucide-react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { computePlatformIntelligence, generateIntelligenceReport, PIQ_LEVELS } from "@/lib/platformIntelligenceEngine";
import PlatformIntelligenceMap from "./PlatformIntelligenceMap";
import PlatformIQHistoricalTrend from "./PlatformIQHistoricalTrend";
import PlatformIQAIConfidence from "./PlatformIQAIConfidence";

/**
 * Platform Intelligence Center™
 * The dedicated operational workspace for the Platform Intelligence Quotient™ (PIQ™).
 * Displays overall score, domain breakdown, radar chart, strengths,
 * weaknesses, recommendations, AI/foundation readiness, EXEC™ confidence.
 */
// Maps each PIQ domain to its corresponding Operations Center workspace
const DOMAIN_WORKSPACE_MAP = {
  foundation: "foundation-certification",
  metadata: "architecture-center",
  discoverability: "architecture-center",
  knowledge: "knowledge-operations",
  explainability: "knowledge-operations",
  dependencies: "architecture-center",
  governance: "platform-governance",
  ai_readiness: "knowledge-operations",
};

export default function PlatformIntelligenceCenter({ onNavigate }) {
  const piq = useMemo(() => computePlatformIntelligence(), []);

  const ringColor = piq.maturity.color;
  const cognitiveReady = piq.piqScore >= 96;

  const radarData = piq.domains.map((d) => ({
    domain: d.label.replace("™", ""),
    domainId: d.id,
    score: d.score,
    fullMark: 100,
  }));

  const handleDomainClick = (domainId) => {
    const ws = DOMAIN_WORKSPACE_MAP[domainId];
    if (ws && onNavigate) onNavigate(ws);
  };

  const renderAxisTick = ({ payload, x, y }) => {
    const domainId = payload?.payload?.domainId;
    const label = payload?.value;
    if (!domainId) return null;
    return (
      <text
        x={x} y={y}
        fill="rgba(255,255,255,0.5)"
        fontSize={10}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ cursor: onNavigate ? "pointer" : "default" }}
        onClick={() => handleDomainClick(domainId)}
        onMouseEnter={(e) => { if (onNavigate) e.target.style.fill = "#a78bfa"; }}
        onMouseLeave={(e) => { e.target.style.fill = "rgba(255,255,255,0.5)"; }}
      >
        {label}
      </text>
    );
  };

  // Returns maturity info for a domain score: current level, next level, gap
  const getDomainMaturity = (score) => {
    let current = PIQ_LEVELS[0];
    let next = null;
    for (let i = 0; i < PIQ_LEVELS.length; i++) {
      if (score >= PIQ_LEVELS[i].minScore) {
        current = PIQ_LEVELS[i];
        next = PIQ_LEVELS[i + 1] || null;
      }
    }
    const shortName = (name) => name.split(" ")[0];
    return {
      maturity: shortName(current.name),
      maturityColor: current.color,
      next: next ? shortName(next.name) : null,
      gap: next ? next.minScore - score : 0,
    };
  };

  // Returns a human-readable "remaining" label for a domain
  const getRemainingLabel = (domain) => {
    if (domain.id === "metadata" && piq.metadataMissingEntries != null) {
      return `${piq.metadataMissingEntries} metadata entries`;
    }
    const m = getDomainMaturity(domain.score);
    return m.next ? `${m.gap} pts to ${m.next}` : "Max level";
  };

  const downloadReport = () => {
    const report = generateIntelligenceReport(piq);
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `execlead-platform-intelligence-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* ── PIQ Hero ── */}
      <div className="rounded-xl border border-white/5 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Score Ring */}
          <div className="relative flex-shrink-0">
            <svg width="150" height="150" viewBox="0 0 150 150">
              <circle cx="75" cy="75" r="65" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
              <circle
                cx="75" cy="75" r="65" fill="none" stroke={ringColor} strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 65 * (piq.piqScore / 100)} ${2 * Math.PI * 65}`}
                strokeLinecap="round" transform="rotate(-90 75 75)"
                style={{ transition: "stroke-dasharray 1s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-white">{piq.piqScore}</span>
              <span className="text-[10px] text-white/30 uppercase tracking-wider">PIQ Score</span>
            </div>
          </div>

          {/* Status */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
              <Brain size={20} className="text-indigo-400" />
              <h2 className="text-lg font-bold text-white">Platform Intelligence Quotient™</h2>
            </div>
            <div className="text-2xl font-bold mb-1" style={{ color: ringColor }}>
              {piq.maturity.short} — {piq.maturity.name}
            </div>
            <p className="text-sm text-white/50">
              {cognitiveReady
                ? "Cognitive Ready — Sprint 2 (EXEC™ Cognitive Engine™) is authorized."
                : `${96 - piq.piqScore} points from Cognitive Readiness (L5). Est. gain available: +${piq.estGain} pts`}
            </p>
            <div className="flex items-center gap-3 mt-3 justify-center md:justify-start">
              <span className="text-[10px] text-white/30">Last Analysis: {new Date(piq.computedAt).toLocaleTimeString()}</span>
              <button
                onClick={downloadReport}
                className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20"
              >
                <Download size={10} /> Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Historical Trend — Platform IQ™ ── */}
      <PlatformIQHistoricalTrend currentScore={piq.piqScore} />

      {/* ── AI Confidence ── */}
      <PlatformIQAIConfidence piqScore={piq.piqScore} aiConfidence={piq.execConfidence} />

      {/* ── Radar Chart + Readiness ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Radar */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider">
              Intelligence Domain Radar
            </h3>
            {onNavigate && (
              <span className="text-[10px] text-indigo-400/60 flex items-center gap-1">
                Click a domain to explore →
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="domain" tick={renderAxisTick} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9 }} />
              <Radar
                name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3}
                strokeWidth={2}
                style={{ cursor: onNavigate ? "pointer" : "default" }}
                onClick={(props) => handleDomainClick(props?.payload?.domainId)}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Readiness Cards */}
        <div className="space-y-3">
          <ReadinessCard
            label="AI Readiness"
            value={piq.aiReadiness}
            icon={Zap}
            color="#14b8a6"
          />
          <ReadinessCard
            label="Foundation Readiness"
            value={piq.foundationReadiness}
            icon={Award}
            color="#10b981"
            certified={piq.foundationCertified}
          />
          <ReadinessCard
            label="EXEC™ Confidence"
            value={piq.execConfidence}
            icon={Sparkles}
            color="#8b5cf6"
          />
        </div>
      </div>

      {/* ── Domain Breakdown ── */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-4">
          Domain Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {piq.domains.map((d) => (
            <div key={d.id} className="bg-white/[0.02] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-white/70">{d.label}</span>
                <span className="text-[10px] text-white/30">{d.weight}% weight</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${d.score}%`, backgroundColor: d.color }}
                  />
                </div>
                <span className="text-sm font-bold text-white w-10 text-right">{d.score}%</span>
              </div>
              {/* Maturity / Next / Remaining */}
              {(() => {
                const m = getDomainMaturity(d.score);
                return (
                  <div className="flex items-center gap-3 mt-2 text-[10px]">
                    <span className="text-white/30">Maturity <span className="font-medium" style={{ color: m.maturityColor }}>{m.maturity}</span></span>
                    {m.next && <span className="text-white/30">Next <span className="text-white/70 font-medium">{m.next}</span></span>}
                    <span className="text-white/30 ml-auto">Remaining <span className="text-white/70 font-medium">{getRemainingLabel(d)}</span></span>
                  </div>
                );
              })()}
              <div className="mt-2 flex flex-wrap gap-1">
                {d.subMetrics.slice(0, 4).map((sm) => (
                  <span
                    key={sm.label}
                    className={`text-[9px] px-1.5 py-0.5 rounded ${
                      sm.value >= 90
                        ? "bg-emerald-500/10 text-emerald-400"
                        : sm.value >= 70
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {sm.label}: {sm.value}%
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Strengths & Weaknesses ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-emerald-400" />
            <h3 className="text-sm font-medium text-white/80">Top Strengths</h3>
          </div>
          <div className="space-y-2">
            {piq.strengths.map((d, i) => (
              <div key={d.id} className="flex items-center gap-3">
                <span className="text-[10px] text-white/30 w-4">{i + 1}.</span>
                <span className="text-xs text-white/70 flex-1">{d.label}</span>
                <span className="text-sm font-bold text-emerald-400">{d.score}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown size={14} className="text-red-400" />
            <h3 className="text-sm font-medium text-white/80">Weakest Domains</h3>
          </div>
          <div className="space-y-2">
            {piq.weaknesses.map((d, i) => (
              <div key={d.id} className="flex items-center gap-3">
                <span className="text-[10px] text-white/30 w-4">{i + 1}.</span>
                <span className="text-xs text-white/70 flex-1">{d.label}</span>
                <span className="text-sm font-bold text-red-400">{d.score}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Improvement Recommendations ── */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Target size={14} className="text-indigo-400" />
          <h3 className="text-sm font-medium text-white/80">Improvement Recommendations</h3>
          <span className="ml-auto text-xs text-white/40">Est. gain: +{piq.estGain} pts</span>
        </div>
        <div className="space-y-2">
          {piq.recommendations.map((r, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-white/60">
              <span className="text-indigo-400 mt-0.5">•</span>
              <span>{r.recommendation}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Platform Intelligence Map™ ── */}
      <PlatformIntelligenceMap piq={piq} onNavigate={onNavigate} />
    </div>
  );
}

function ReadinessCard({ label, value, icon, color, certified }) {
  const Icon = icon;
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} style={{ color }} />
        <span className="text-[10px] text-white/40 uppercase tracking-wider">{label}</span>
        {certified !== undefined && (
          <span
            className={`text-[9px] px-1.5 py-0.5 rounded ml-auto ${
              certified ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
            }`}
          >
            {certified ? "Certified" : "Not Certified"}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color }} />
        </div>
        <span className="text-lg font-bold text-white">{value}%</span>
      </div>
    </div>
  );
}