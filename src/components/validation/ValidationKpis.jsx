import React from 'react';

export default function ValidationKpis({ summary }) {
  const items = [['Validation confidence', `${summary.validationConfidenceScore}%`], ['External outcomes', summary.externalOutcomeCount], ['Verified outcomes', summary.verifiedOutcomeCount], ['Members with outcomes', summary.membersWithOutcomes]];
  return <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">{items.map(([label, value]) => <div key={label} className="rounded-xl border border-white/8 bg-white/[0.02] p-4"><div className="text-2xl font-bold text-white">{value}</div><div className="text-[10px] text-white/40 mt-1">{label}</div></div>)}</div>;
}