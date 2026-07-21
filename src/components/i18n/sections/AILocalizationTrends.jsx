import React from 'react';
import { TrendingUp, Activity, Brain, Zap, Award, Package, LineChart as LineChartIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function TrendCard({ icon: Icon, label, data, color }) {
  const latest = data[data.length - 1]?.value || 0;
  const first = data[0]?.value || 0;
  const delta = latest - first;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} style={{ color }} />
        <span className="text-xs text-white/50">{label}</span>
        <span className="text-xs font-bold ml-auto" style={{ color }}>{latest}</span>
        {delta !== 0 && <span className="text-[10px]" style={{ color: delta > 0 ? '#10b981' : '#ef4444' }}>{delta > 0 ? '↑' : '↓'}{Math.abs(delta)}</span>}
      </div>
      <ResponsiveContainer width="100%" height={60}>
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} />
          <Tooltip contentStyle={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '10px' }} />
          <XAxis dataKey="label" hide />
          <YAxis hide domain={['dataMin', 'dataMax']} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function AILocalizationTrends({ trends }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <LineChartIcon size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">AI Localization Trend Analytics™</h3>
        <span className="text-[10px] text-white/30 ml-auto">8 weeks</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <TrendCard icon={Brain} label="AI Localization Score" data={trends.aiScoreTrend} color="#6366f1" />
        <TrendCard icon={Activity} label="AI Confidence" data={trends.confidenceTrend} color="#10b981" />
        <TrendCard icon={TrendingUp} label="Language Adoption" data={trends.adoptionTrend} color="#06b6d4" />
        <TrendCard icon={Zap} label="Translation Velocity" data={trends.velocityTrend} color="#f59e0b" />
        <TrendCard icon={Award} label="Certification Progress" data={trends.certificationTrend} color="#8b5cf6" />
        <TrendCard icon={Package} label="Pack Releases" data={trends.packReleasesTrend} color="#3b82f6" />
      </div>
    </div>
  );
}