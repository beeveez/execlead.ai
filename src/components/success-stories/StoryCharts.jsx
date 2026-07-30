import React from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area, BarChart, Bar,
} from 'recharts';

const TOOLTIP = {
  contentStyle: { background: 'rgba(13,13,20,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11, color: '#fff' },
  labelStyle: { color: 'rgba(255,255,255,0.6)' },
};

function Card({ title, children }) {
  return (
    <div className="bg-white/[0.02] border border-white/8 rounded-xl p-4">
      <div className="text-[11px] uppercase tracking-wider text-white/40 mb-3">{title}</div>
      {children}
    </div>
  );
}

export default function StoryCharts({ charts }) {
  if (!charts) return null;
  const { readinessTrend = [], competencyRadar = [], evidenceGrowth = [], outcomeAttribution = [] } = charts;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card title="Executive Readiness™ Trend">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={readinessTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" fontSize={11} />
            <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.4)" fontSize={11} />
            <Tooltip {...TOOLTIP} />
            <Line type="monotone" dataKey="readiness" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Competency Growth Radar">
        {competencyRadar.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={competencyRadar}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.45)" fontSize={9} />
              <PolarRadiusAxis domain={[0, 100]} stroke="rgba(255,255,255,0.15)" fontSize={9} />
              <Radar dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.35} />
              <Tooltip {...TOOLTIP} />
            </RadarChart>
          </ResponsiveContainer>
        ) : <div className="text-xs text-white/30 py-16 text-center">No competency data yet</div>}
      </Card>

      <Card title="Evidence Growth">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={evidenceGrowth}>
            <defs>
              <linearGradient id="evGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} allowDecimals={false} />
            <Tooltip {...TOOLTIP} />
            <Area type="monotone" dataKey="evidence" stroke="#10b981" strokeWidth={2} fill="url(#evGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Outcome Attribution">
        {outcomeAttribution.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={outcomeAttribution} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={11} allowDecimals={false} />
              <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} width={80} />
              <Tooltip {...TOOLTIP} />
              <Bar dataKey="value" fill="#ec4899" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <div className="text-xs text-white/30 py-16 text-center">No outcome data yet</div>}
      </Card>
    </div>
  );
}