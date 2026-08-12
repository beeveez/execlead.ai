import React from 'react';
import { Gauge, Waves, MousePointerClick, Database } from 'lucide-react';

const items = [
  ['calibrationIndex', 'Calibration Index', Gauge, '%'],
  ['stabilityScore', 'Correlation Stability', Waves, '%'],
  ['usefulnessScore', 'Post-Recommendation Engagement', MousePointerClick, '%'],
  ['evidenceGrowth', 'New Evidence · 30 Days', Database, ''],
];
export default function CalibrationKpis({ summary }) {
  return <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">{items.map(([key, label, Icon, suffix]) => <div key={key} className="rounded-xl border border-white/8 bg-white/[0.02] p-4"><Icon size={15} className="text-indigo-400" /><div className="text-2xl font-bold text-white mt-3">{summary[key]}{suffix}</div><div className="text-[10px] text-white/40 mt-1">{label}</div></div>)}</div>;
}