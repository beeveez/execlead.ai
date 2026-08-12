import React from 'react';
import { BadgeCheck } from 'lucide-react';

export default function ValidationHeader({ data }) {
  return <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6"><div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-emerald-400"><BadgeCheck size={13} /> External outcome validation</div><h1 className="text-2xl font-bold text-white mt-2">Intelligence Validation Program™</h1><p className="text-sm text-white/45 mt-2 max-w-3xl">Validate whether high-impact behavioral insights correspond to meaningful leadership advancement beyond the platform.</p><div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">{data.answer}</div></div>;
}