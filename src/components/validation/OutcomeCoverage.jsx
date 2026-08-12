import React from 'react';

export default function OutcomeCoverage({ outcomes }) {
  return <section className="rounded-2xl border border-white/8 bg-white/[0.02] p-5"><h2 className="text-sm font-semibold text-white mb-4">External Outcome Coverage</h2><div className="grid grid-cols-2 lg:grid-cols-4 gap-2">{outcomes.map((item) => <div key={item.key} className="rounded-lg bg-white/[0.03] p-3"><div className="text-lg font-bold text-white">{item.count}</div><div className="text-[9px] text-white/45 mt-1">{item.label}</div><div className="text-[9px] text-emerald-400 mt-1">{item.verifiedCount} verified</div></div>)}</div></section>;
}