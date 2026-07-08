import React from "react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from "recharts";
import { useTheme } from "@/lib/ThemeContext";
import { getChartTheme } from "@/lib/chartTheme";

/**
 * Theme-aware tooltip for the radar chart.
 * Colors come from the centralized chart theme tokens.
 */
function RadarTooltip({ active, payload, theme }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  return (
    <div
      style={{
        background: theme.tooltipBg,
        color: theme.tooltipText,
        border: `1px solid ${theme.tooltipBorder}`,
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 12,
        fontWeight: 500,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 2 }}>{item.payload.competency}</div>
      <div style={{ opacity: 0.8 }}>Score: {item.value}</div>
    </div>
  );
}

export default function CompetencyRadar({ data }) {
  const { resolvedTheme } = useTheme();
  const theme = getChartTheme(resolvedTheme);

  return (
    <ResponsiveContainer width="100%" height={380} minWidth={0}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke={theme.gridLine} />
        <PolarAngleAxis
          dataKey="competency"
          tick={{ fill: theme.axisLabel, fontSize: 13, fontWeight: 500 }}
        />
        <PolarRadiusAxis
          domain={[0, 100]}
          angle={90}
          tick={{ fill: theme.tickLabel, fontSize: 11 }}
          axisLine={false}
        />
        <Tooltip content={<RadarTooltip theme={theme} />} />
        <Radar
          dataKey="score"
          stroke={theme.radarBorder}
          fill={theme.radarFill}
          strokeWidth={2}
          dot={{ r: 4, fill: theme.pointFill, stroke: theme.radarBorder, strokeWidth: 1.5 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}