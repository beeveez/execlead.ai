import React, { useState } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from "recharts";
import { BarChart3 } from "lucide-react";

const COMPARE_OPTIONS = [
  { id: "none", label: "Current Only" },
  { id: "benchmark", label: "Industry Average" },
  { id: "target", label: "Target Role" },
];

/**
 * CompetencyRadar — 12-dimension executive competency radar chart
 * with comparison overlays (industry average, target role).
 */
export default function CompetencyRadar({ dimensions = [] }) {
  const [compare, setCompare] = useState("benchmark");

  const data = dimensions.map((d) => ({
    subject: d.label,
    current: d.current || 0,
    benchmark: d.benchmark || 70,
    target: Math.min(100, (d.benchmark || 70) + 15),
  }));

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-indigo-400" />
          <h3 className="text-white font-semibold text-sm">Executive Competency Radar</h3>
        </div>
        <div className="flex gap-1">
          {COMPARE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setCompare(opt.id)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                compare === opt.id ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "bg-white/5 text-white/40 border border-transparent"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
          <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 8 }} axisLine={false} />
          <Radar name="Current" dataKey="current" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} />
          {compare === "benchmark" && (
            <Radar name="Industry Avg" dataKey="benchmark" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 4" />
          )}
          {compare === "target" && (
            <Radar name="Target Role" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 4" />
          )}
          <Legend wrapperStyle={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}