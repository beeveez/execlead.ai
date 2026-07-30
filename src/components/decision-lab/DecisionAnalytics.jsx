import React, { useMemo } from "react";
import { BarChart3, TrendingUp, Layers } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { SCORING_DIMENSIONS } from "@/lib/decisionLabEngine";

/**
 * DecisionAnalytics — decision quality trend, category breakdown, dimension
 * radar, reflection rate, confidence, and decision diversity.
 */
export default function DecisionAnalytics({ ld }) {
  const { analytics } = ld;
  const radarData = useMemo(() => SCORING_DIMENSIONS.map((d) => ({ dimension: d.label, value: analytics?.dimensionAverages?.[d.key] || 0 })), [analytics]);
  const categoryData = useMemo(() => Object.entries(analytics?.categoryBreakdown || {}).map(([k, v]) => ({ category: k, score: v })), [analytics]);
  if (!analytics || !analytics.total) return <div className="text-center py-12 text-xs text-white/40">No analytics yet. Complete scenarios to see your trends.</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-1"><BarChart3 size={16} className="text-cyan-400" /><h3 className="text-white font-semibold text-sm">Decision Analytics™</h3></div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Scenarios" value={analytics.total} color="#0ea5e9" />
        <Stat label="Avg Quality" value={`${analytics.avgQuality}`} color="#6366f1" />
        <Stat label="Reflection Rate" value={`${analytics.reflectionRate}%`} color="#10b981" />
        <Stat label="Confidence" value={`${analytics.confidence}`} color="#f59e0b" />
      </div>

      {/* Trend */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3"><TrendingUp size={14} className="text-emerald-400" /><span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Decision Quality Trend</span></div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={analytics.trend}>
            <XAxis dataKey="index" stroke="#64748b" fontSize={10} />
            <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} />
            <Tooltip contentStyle={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.1)", fontSize: 12 }} />
            <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Dimension radar */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3"><Layers size={14} className="text-indigo-400" /><span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Decision Dimensions</span></div>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="dimension" tick={{ fill: "#94a3b8", fontSize: 9 }} />
              <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
              <Tooltip contentStyle={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.1)", fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Category breakdown */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <div className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">Category Performance</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={categoryData} layout="vertical">
              <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={10} />
              <YAxis type="category" dataKey="category" stroke="#94a3b8" fontSize={9} width={120} />
              <Tooltip contentStyle={{ background: "#0d0d14", border: "1px solid rgba(255,255,255,0.1)", fontSize: 12 }} />
              <Bar dataKey="score" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3"><div className="text-[10px] uppercase tracking-wider text-white/40">{label}</div><div className="text-lg font-bold" style={{ color }}>{value}</div></div>;
}