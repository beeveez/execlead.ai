import React from 'react';
import useOperationalExcellence from '@/hooks/useOperationalExcellence';
import ValueStreamTable from '@/components/operational-excellence/ValueStreamTable';
export default function ValueStreams() {
  const { data, loading, error } = useOperationalExcellence();
  if (loading && !data) return <div className="p-8 text-sm text-white/40">Building the leadership value stream…</div>;
  if (error && !data) return <div className="p-8 text-sm text-rose-400">{error}</div>;
  return <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6"><div><div className="text-[10px] uppercase tracking-widest text-white/30">Operational Excellence™ · Value Stream Intelligence</div><h1 className="mt-1 text-2xl font-bold text-white">Executive Leadership Journey™ Value Stream</h1><p className="mt-1 max-w-3xl text-sm text-white/40">Live completion, friction, time, satisfaction, and readiness-evidence signals derived from existing platform telemetry and product intelligence.</p></div><ValueStreamTable steps={data.valueStream} /></div>;
}