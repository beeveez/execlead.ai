import React, { useEffect, useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { ASSESSMENT_CATEGORIES } from '@/lib/readinessAssessmentEngine';

export default function ReadinessRadar({ categoryResults }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 120); return () => clearTimeout(t); }, []);
  const data = ASSESSMENT_CATEGORIES.map((c) => ({ subject: c.label.split(' ')[0], full: c.label, score: animated ? (categoryResults[c.key] || 0) : 0, color: c.color }));
  return (
    <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-white mb-1">Executive Readiness Radar</h3>
      <p className="text-[11px] text-white/40 mb-3">Five competency axes · animated · executive styling.</p>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.55)' }} />
          <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickCount={5} />
          <Radar name="Readiness" dataKey="score" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.25} isAnimationActive />
          <Tooltip contentStyle={{ background: '#0d0d14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} formatter={(v, n, p) => [`${v}/100`, p.payload.full]} />
        </RadarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-5 gap-1 mt-2">
        {data.map((d) => (
          <div key={d.full} className="text-center">
            <div className="text-[9px] text-white/40 truncate">{d.subject}</div>
            <div className="text-sm font-bold" style={{ color: d.color }}>{d.score}</div>
          </div>
        ))}
      </div>
    </div>
  );
}