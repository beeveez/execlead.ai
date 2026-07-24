import React from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#a855f7"];

export default function ModelComparisonRadar({ data, models }) {
  return (
    <div className="w-full h-[420px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis dataKey="axis" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 8 }} stroke="rgba(255,255,255,0.05)" />
          {models.map((model, i) => (
            <Radar key={model} name={model} dataKey={model} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.15} strokeWidth={2} />
          ))}
          <Legend wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}