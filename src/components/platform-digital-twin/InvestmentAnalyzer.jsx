import React, { useMemo, useState } from 'react';
import { Wallet, ArrowUpDown } from 'lucide-react';
import { SectionShell, Badge } from './Shared';
import { computeTwinSnapshot } from '@/lib/platformDigitalTwin';

const SORTS = [
  { id: 'roi-desc', label: 'Highest ROI', fn: (a, b) => b.roiScore - a.roiScore },
  { id: 'roi-asc', label: 'Lowest ROI', fn: (a, b) => a.roiScore - b.roiScore },
  { id: 'cost-desc', label: 'Highest Cost', fn: (a, b) => b.engineeringCost - a.engineeringCost },
  { id: 'value-desc', label: 'Most Valuable', fn: (a, b) => b.businessValue - a.businessValue },
  { id: 'investment', label: 'Needs Investment', fn: (a, b) => (a.businessValue - a.roiScore) - (b.businessValue - b.roiScore) },
  { id: 'retire', label: 'Should Retire', fn: (a, b) => (b.techDebt ? 0 : 0) || (a.roiScore - b.roiScore) },
];

export default function InvestmentAnalyzer() {
  const twin = useMemo(() => computeTwinSnapshot(), []);
  const [sort, setSort] = useState('roi-desc');
  const sorted = [...twin.investments].sort(SORTS.find((s) => s.id === sort).fn);
  return (
    <SectionShell title="Platform Investment Analyzer™" subtitle="Every module scored by ROI, value, cost, and strategic importance" icon={Wallet}
      actions={<div className="flex items-center gap-1"><ArrowUpDown size={12} className="text-white/40" /><select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white">{SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>}>
      <div className="overflow-x-auto bg-white/[0.02] border border-white/5 rounded-xl">
        <table className="w-full text-xs">
          <thead><tr className="text-white/40 border-b border-white/5 text-[10px] uppercase">
            <th className="text-left p-2">Module</th><th className="p-2">Dev</th><th className="p-2">Maint</th><th className="p-2">Value</th><th className="p-2">Revenue</th><th className="p-2">Exec</th><th className="p-2">Cost</th><th className="p-2">ROI</th>
          </tr></thead>
          <tbody>
            {sorted.map((m) => (
              <tr key={m.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="p-2"><div className="text-white/80 font-medium">{m.name}</div><div className="text-[9px] text-white/30">{m.workspace}</div></td>
                <td className="p-2 text-center text-white/60">{m.devHours}h</td>
                <td className="p-2 text-center text-white/60">{m.maintenanceHours}h</td>
                <td className="p-2 text-center"><span className={m.businessValue >= 85 ? 'text-emerald-400' : 'text-white/60'}>{m.businessValue}</span></td>
                <td className="p-2 text-center text-amber-400">{m.revenuePotential}</td>
                <td className="p-2 text-center text-violet-400">{m.executiveValue}</td>
                <td className="p-2 text-center text-white/60">{m.engineeringCost}h</td>
                <td className="p-2 text-center"><Badge color={m.roiScore >= 70 ? 'emerald' : m.roiScore >= 50 ? 'amber' : 'rose'}>{m.roiScore}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionShell>
  );
}