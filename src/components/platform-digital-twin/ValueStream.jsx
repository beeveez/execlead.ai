import React, { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { SectionShell, Badge, StatCard } from './Shared';
import { computeTwinSnapshot } from '@/lib/platformDigitalTwin';

export default function ValueStream() {
  const twin = useMemo(() => computeTwinSnapshot(), []);
  const stages = twin.valueStream;
  return (
    <SectionShell title="Value Stream™" subtitle="How customer value flows from visitor to retention" icon={TrendingUp}>
      <div className="space-y-2">
        {stages.map((s, i) => (
          <div key={s.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-500/15 text-indigo-300 text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                <span className="text-sm font-semibold text-white">{s.name}</span>
                <Badge color="slate">{s.module}</Badge>
              </div>
              <span className="text-[10px] text-white/40">{s.retained.toLocaleString()} users · {s.time}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-2">
              <MiniStat label="Drop-off" value={`${s.dropOff}%`} color="#f43f5e" />
              <MiniStat label="AI Influence" value={s.aiInfluence} color="#ec4899" />
              <MiniStat label="Exec Value" value={s.executiveValue} color="#8b5cf6" />
              <MiniStat label="Revenue" value={`$${s.revenue}`} color="#f59e0b" />
              <MiniStat label="Time" value={s.time} color="#06b6d4" />
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-2"><div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full" style={{ width: `${(s.retained / 1000) * 100}%` }} /></div>
            <p className="text-[11px] text-white/40">💡 {s.recommendations}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}
function MiniStat({ label, value, color }) {
  return <div className="bg-white/[0.02] rounded-lg px-2 py-1"><div className="text-[9px] text-white/40 uppercase">{label}</div><div className="text-xs font-bold" style={{ color }}>{value}</div></div>;
}