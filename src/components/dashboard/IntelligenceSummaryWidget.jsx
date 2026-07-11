import React from "react";
import { Link } from "react-router-dom";
import { useExecutiveIntelligence } from "@/hooks/useExecutiveIntelligence";
import { useTheme } from "@/lib/ThemeContext";
import { getChartTheme } from "@/lib/chartTheme";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Brain, ArrowRight } from "lucide-react";

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
  const { resolvedTheme } = useTheme();
  const theme = getChartTheme(resolvedTheme);
  const { chartData, overallScore, overallProficiency, loading, strongestDomain, growthDomain } = useExecutiveIntelligence();

  if (loading) {
    return (
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 h-[260px] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Link to="/intelligence" className="group block bg-white/[0.03] border border-white/10 rounded-xl p-5 hover:border-indigo-500/20 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <Brain size={16} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Executive Intelligence Center™</h3>
            <p className="text-white/30 text-xs">Six Capability Domains · ELIM™</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{overallScore}</div>
          <div className="text-[10px] text-white/30 uppercase tracking-wider">{overallProficiency?.label || "Not Assessed"}</div>
        </div>
      </div>

      {chartData.some((d) => d.score > 0) ? (
        <div className="relative">
          <ResponsiveContainer width="100%" height={160} minWidth={0}>
            <RadarChart data={chartData} outerRadius="65%">
              <PolarGrid stroke={theme.gridLine} />
              <PolarAngleAxis dataKey="domain" tick={{ fill: theme.axisLabel, fontSize: 9 }} />
              <PolarRadiusAxis domain={[0, 100]} angle={90} tick={false} axisLine={false} />
              <Tooltip content={<RadarTooltip theme={theme} />} />
              <Radar dataKey="score" stroke={theme.radarBorder} fill={theme.radarFill} strokeWidth={2}
                dot={{ r: 3, fill: theme.pointFill, stroke: theme.radarBorder, strokeWidth: 1 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[160px] text-center">
          <Brain size={20} className="text-white/30 mb-2" />
          <p className="text-white/50 text-xs font-medium">No competency data yet</p>
          <p className="text-white/30 text-[10px] mt-1 max-w-[200px]">Complete Leadership DNA™ or simulations to generate your intelligence.</p>
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        <div className="flex items-center gap-3 text-[10px] text-white/40">
          {strongestDomain && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: strongestDomain.color }} />{strongestDomain.label}</span>}
          {growthDomain && <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: growthDomain.color }} />{growthDomain.label}</span>}
        </div>
        <div className="flex items-center gap-1 text-indigo-400 text-xs group-hover:gap-2 transition-all">
          View Full Intelligence <ArrowRight size={12} />
        </div>
      </div>
    </Link>
  );
}