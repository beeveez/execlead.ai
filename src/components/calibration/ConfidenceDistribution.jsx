import React from 'react';

const styles = { High: 'bg-emerald-500', Moderate: 'bg-amber-500', Emerging: 'bg-indigo-500' };
export default function ConfidenceDistribution({ distribution }) {
  const total = Object.values(distribution).reduce((sum, value) => sum + value, 0);
  return <section className="rounded-2xl border border-white/8 bg-white/[0.02] p-5"><h2 className="text-sm font-semibold text-white mb-4">Confidence-Level Distribution</h2><div className="space-y-4">{Object.entries(distribution).map(([level, count]) => { const percent = total ? Math.round(count / total * 100) : 0; return <div key={level}><div className="flex justify-between text-xs"><span className="text-white/60">{level}</span><span className="text-white">{count} · {percent}%</span></div><div className="h-1.5 bg-white/5 rounded-full mt-2 overflow-hidden"><div className={`h-full ${styles[level]}`} style={{ width: `${percent}%` }} /></div></div>; })}</div></section>;
}