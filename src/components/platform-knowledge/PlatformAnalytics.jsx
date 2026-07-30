import React from 'react';
import { SectionShell, StatCard, Badge } from './PKShared';
import { getDashboardStats, MODULES, AI_ENGINES, ENGINEERING_PHASES } from '@/lib/platformKnowledgeCenter';
import { BarChart3, TrendingUp, Cpu, Boxes } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function PlatformAnalytics() {
  const s = getDashboardStats();
  const phaseData = ENGINEERING_PHASES.map((p) => ({ phase: p.id.replace('e', 'E'), modules: MODULES.filter((m) => m.engineeringPhase === p.id).length }));
  const categoryData = Object.entries(
    MODULES.reduce((acc, m) => { acc[m.category] = (acc[m.category] || 0) + 1; return acc; }, {})
  ).map(([category, count]) => ({ category, count }));

  const radarData = ['Trust', 'Maturity', 'Complexity'].map((metric) => ({
    metric,
    value: Math.round(MODULES.reduce((a, m) => a + (m[metric === 'Trust' ? 'trustScore' : metric === 'Maturity' ? 'maturity' : 'complexity'] || 0), 0) / MODULES.length),
  }));

  return (
    <SectionShell title="Platform Analytics™" subtitle="Quantitative view of platform health and composition" icon={BarChart3}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Avg Trust Score" value={s.avgTrust} icon={TrendingUp} color="#10b981" />
        <StatCard label="Avg Maturity" value={`${s.avgMaturity}/100`} icon={Boxes} color="#6366f1" />
        <StatCard label="Avg Complexity" value={`${s.avgComplexity}/10`} icon={BarChart3} color="#f59e0b" />
        <StatCard label="AI Engines" value={s.aiEngines} icon={Cpu} color="#8b5cf6" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Modules by Engineering Phase</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={phaseData}>
              <XAxis dataKey="phase" stroke="#64748b" fontSize={10} />
              <YAxis stroke="#64748b" fontSize={10} />
              <Tooltip cursor={{ fill: 'rgba(99,102,241,0.1)' }} contentStyle={{ background: '#0a0a0f', border: '1px solid #ffffff20', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="modules" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Platform Health Radar</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#ffffff10" />
              <PolarAngleAxis dataKey="metric" stroke="#64748b" fontSize={10} />
              <PolarRadiusAxis stroke="#ffffff10" fontSize={9} />
              <Radar dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Modules by Category</h3>
        <div className="flex flex-wrap gap-2">
          {categoryData.map((c) => (
            <div key={c.category} className="flex items-center gap-1.5 bg-white/[0.02] border border-white/5 rounded-lg px-2.5 py-1.5">
              <Badge color="#6366f1">{c.category}</Badge>
              <span className="text-xs text-white font-semibold">{c.count}</span>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}