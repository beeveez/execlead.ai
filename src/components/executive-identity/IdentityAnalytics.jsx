import React from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, Activity, Award, Layers } from 'lucide-react';
import { computeIdentityAnalytics, computeBrandConsistency } from '@/lib/identityIntelligenceEngine';

function ChartCard({ title, icon: Icon, data, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/8 rounded-xl p-4">
      <div className="flex items-center gap-1.5 mb-3"><Icon size={13} className="text-accent-orange" /><span className="text-[11px] uppercase tracking-wider text-white/50">{title}</span></div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data} margin={{ top: 2, right: 4, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} width={28} />
          <Tooltip contentStyle={{ background: '#0d0d14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }} labelStyle={{ color: 'rgba(255,255,255,0.6)' }} />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 2, fill: color }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function IdentityAnalytics({ identity, versions }) {
  const analytics = computeIdentityAnalytics(versions);
  const brand = computeBrandConsistency(identity);
  if (!analytics) return null;
  return (
    <div className="space-y-4">
      <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4"><Activity size={16} className="text-accent-orange" /><h2 className="text-sm font-semibold text-white">Identity Analytics™</h2></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          <Stat label="Versions" value={analytics.versions} />
          <Stat label="Differentiator Stability" value={`${analytics.differentiatorStability}%`} />
          <Stat label="Positioning Score" value={`${analytics.positioningScore}/100`} />
          <Stat label="Brand Consistency" value={`${brand.score}%`} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ChartCard title="Identity Health Trend" icon={TrendingUp} data={analytics.healthTrend} color="#6366f1" />
          <ChartCard title="Story Confidence Trend" icon={Award} data={analytics.storyConfidenceTrend} color="#f59e0b" />
          <ChartCard title="Evidence Growth" icon={Layers} data={analytics.evidenceGrowth} color="#10b981" />
          <ChartCard title="Executive Readiness Trend" icon={TrendingUp} data={analytics.readinessTrend} color="#ec4899" />
        </div>
      </div>

      {/* Brand Consistency */}
      <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><Award size={16} className="text-accent-orange" /><h2 className="text-sm font-semibold text-white">Executive Brand Consistency™</h2></div>
          <span className="text-lg font-bold text-emerald-400">{brand.score}%</span>
        </div>
        <div className="space-y-1.5">
          {brand.outputs.map((o) => (
            <div key={o.name} className="flex items-center justify-between bg-white/[0.02] border border-white/8 rounded-lg px-3 py-2">
              <span className="text-xs text-white/70">{o.name}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${o.consistent ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-white/40'}`}>{o.consistent ? 'Consistent' : 'Missing'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white/[0.02] border border-white/8 rounded-xl p-3">
      <div className="text-[9px] uppercase tracking-wider text-white/40 mb-1">{label}</div>
      <div className="text-base font-bold text-white">{value}</div>
    </div>
  );
}