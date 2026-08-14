import React from 'react';
const STAGES = ['Define', 'Measure', 'Analyze', 'Improve', 'Control'];
export default function DmaicPipeline({ projects = [] }) {
  return <section><h2 className="mb-4 text-sm font-semibold text-white">DMAIC Pipeline</h2><div className="grid gap-3 sm:grid-cols-5">{STAGES.map((stage, index) => { const count = projects.filter((item) => item.status === stage).length; return <div key={stage} className="rounded-xl border border-white/5 bg-white/[0.02] p-4"><div className="text-[10px] font-bold text-indigo-400">0{index + 1}</div><div className="mt-2 text-sm font-semibold text-white">{stage}</div><div className="mt-1 text-xs text-white/35">{count} project{count === 1 ? '' : 's'}</div></div>; })}</div></section>;
}