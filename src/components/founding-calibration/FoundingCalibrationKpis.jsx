import React from 'react';

export default function FoundingCalibrationKpis({ data }) {
  const items = [['Active founders', `${data.cohort.activeMembers}/25–50`], ['Calibration index', `${data.summary.calibrationIndex}%`], ['False-positive rate', `${data.summary.overallFalsePositiveRate}%`], ['Simulation alignment', `${data.summary.simulationReadinessAlignment}%`], ['Benchmark readiness', `${data.summary.enterpriseBenchmarkReadiness}%`]];
  return <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">{items.map(([label, value]) => <div key={label} className="rounded-xl border border-white/8 bg-white/[0.02] p-4"><div className="text-xl font-bold text-white">{value}</div><div className="text-[10px] text-white/40 mt-1">{label}</div></div>)}</div>;
}