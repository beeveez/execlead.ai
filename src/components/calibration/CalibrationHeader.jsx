import React from 'react';
import { Activity, ShieldCheck } from 'lucide-react';

export default function CalibrationHeader({ data }) {
  return <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6"><div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-indigo-400"><Activity size={13} /> Continuous calibration layer</div><h1 className="text-2xl font-bold text-white mt-2">Intelligence Calibration Console™</h1><p className="text-sm text-white/45 mt-2 max-w-3xl">Monitor whether Behavioral Readiness Correlation™ and Cohort Leadership Intelligence™ are becoming more accurate, stable, and useful as evidence grows.</p><div className="mt-4 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4 text-sm text-indigo-200">{data.answer}</div><div className="flex items-center gap-1 text-[10px] text-emerald-400 mt-3"><ShieldCheck size={11} /> Aggregate calibration only · privacy threshold {data.minimumCohortSize}</div></div>;
}