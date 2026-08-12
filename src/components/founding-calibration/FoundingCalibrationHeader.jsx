import React from 'react';
import { Crown, ShieldCheck } from 'lucide-react';

export default function FoundingCalibrationHeader({ data }) {
  return <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-6"><div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-amber-400"><Crown size={13} /> Pre-launch calibration cohort</div><h1 className="text-2xl font-bold text-white mt-2">Founding Cohort Calibration™</h1><p className="text-sm text-white/45 mt-2 max-w-3xl">Baseline calibration across the first 25–50 active Founding Members before broader public access.</p><div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">{data.answer}</div><div className="flex items-center gap-1 mt-3 text-[10px] text-emerald-400"><ShieldCheck size={11} /> Aggregate-only reporting · benchmarks suppressed below 10 members</div></div>;
}