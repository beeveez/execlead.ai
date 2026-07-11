import React from "react";
import { Link } from "react-router-dom";
import { useExecutiveIntelligence } from "@/hooks/useExecutiveIntelligence";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Brain, ArrowRight, Sparkles } from "lucide-react";

// Hardcoded dark chart theme — Dashboard is always dark-themed.
// Removing useTheme/getChartTheme dependency eliminates a potential crash point.
const CHART_THEME = {
  axisLabel: "#A1A1AA",
  tickLabel: "#71717A",
  gridLine: "rgba(255,255,255,0.12)",
  radarFill: "rgba(99,102,241,0.20)",
  radarBorder: "#6366F1",
  pointFill: "#6366F1",
  tooltipBg: "#111827",
  tooltipText: "#FFFFFF",
  tooltipBorder: "transparent",
};

const GREY_THEME = {
  axisLabel: "rgba(255,255,255,0.2)",
  tickLabel: "rgba(255,255,255,0.15)",
  gridLine: "rgba(255,255,255,0.05)",
  radarFill: "rgba(255,255,255,0.03)",
  radarBorder: "rgba(255,255,255,0.15)",
  pointFill: "rgba(255,255,255,0.15)",
  tooltipBg: "#111827",
  tooltipText: "#FFFFFF",
  tooltipBorder: "transparent",
};

function RadarTooltip({ active, payload, theme }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  return (
    <div style={{ background: theme.tooltipBg, color: theme.tooltipText, border: `1px solid ${theme.tooltipBorder}`, borderRadius: 8, padding: "8px 12px", fontSize: 11 }}>
      <div style={{ fontWeight: 600 }}>{item.label}</div>
      <div style={{ opacity: 0.8 }}>{item.score}/100</div>
      <div style={{ opacity: 0.6, fontSize: 10 }}>{item.competencyCount} competencies</div>
    </div>
  );
}

export default function IntelligenceSummaryWidget() {
  const { chartData, overallScore, overallProficiency, loading, strongestDomain, growthDomain, competencies } = useExecutiveIntelligence();

  // Diagnostics — verify component is mounted and rendering
  console.log("[IntelligenceSummaryWidget]", {
    mounted: true,
    loading,
    competencyCount: competencies.length,
    overallScore,
    hasData: chartData.some((d) => d.score > 0),
  });

  const hasData = chartData.some((d) => d.score > 0);
  const activeTheme = hasData ? CHART_THEME : GREY_THEME;

  // Always render — loading state shows a visible card with spinner
  if (loading) {
    return (
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 h-[260px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
          <span className="text-white/30 text-xs">Loading Executive Intelligence...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Link to="/intelligence" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <Brain size={16} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">Executive Intelligence Center™</h3>
            <p className="text-white/30 text-xs">Six Capability Domains · ELIM™</p>
          </div>
        </Link>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{overallScore}</div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider">{overallProficiency?.label || "Not Assessed"}</div>
        </div>
      </div>

      {/* Radar Chart — ALWAYS renders. Greyed out when no data. */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={hasData ? 160 : 140} minWidth={0}>
          <RadarChart data={chartData} outerRadius="65%">
            <PolarGrid stroke={activeTheme.gridLine} />
            <PolarAngleAxis dataKey="domain" tick={{ fill: activeTheme.axisLabel, fontSize: 9 }} />
            <PolarRadiusAxis domain={[0, 100]} angle={90} tick={false} axisLine={false} />
            <Tooltip content={<RadarTooltip theme={activeTheme} />} />
            <Radar dataKey="score" stroke={activeTheme.radarBorder} fill={activeTheme.radarFill} strokeWidth={2}
              dot={{ r: 3, fill: activeTheme.pointFill, stroke: activeTheme.radarBorder, strokeWidth: 1 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Empty state — rich onboarding placeholder */}
      {!hasData && (
        <div className="mt-3 pt-3 border-t border-white/5 text-center">
          <p className="text-white/60 text-xs font-medium">Your Executive Intelligence profile is just getting started.</p>
          <p className="text-white/30 text-[10px] mt-1.5 max-w-sm mx-auto leading-relaxed">
            Complete Leadership DNA™, Executive Journey activities, Learning, Simulations, Experience, or Competency Assessments to begin building your Executive Intelligence.
          </p>
          <Link to="/leadership-dna" className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium hover:bg-indigo-500/20 transition-all">
            <Sparkles size={12} /> Start Building
          </Link>
        </div>
      )}

      {/* Footer — populated state */}
      {hasData && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-3 text-[10px] text-white/40">
            {strongestDomain && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: strongestDomain.color }} />{strongestDomain.label}</span>}
            {growthDomain && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: growthDomain.color }} />{growthDomain.label}</span>}
          </div>
          <Link to="/intelligence" className="flex items-center gap-1 text-indigo-400 text-xs group-hover:gap-2 transition-all">
            View Full Intelligence <ArrowRight size={12} />
          </Link>
        </div>
      )}
    </div>
  );
}