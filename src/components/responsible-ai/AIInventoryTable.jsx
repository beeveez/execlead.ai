import React, { useState, useMemo } from 'react';
import { Search, Filter, ShieldCheck } from 'lucide-react';
import { RISK_LEVELS } from '@/lib/responsibleAIEngine';

export default function AIInventoryTable({ inventory, inventoryStats }) {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');

  const filtered = useMemo(() => {
    return inventory.filter((c) => {
      const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.purpose.toLowerCase().includes(search.toLowerCase());
      const matchesRisk = riskFilter === 'all' || c.riskLevel === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [inventory, search, riskFilter]);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck size={16} className="text-indigo-400" />
        <h3 className="text-sm font-semibold text-white">AI Inventory™ ({inventoryStats.total} capabilities)</h3>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search AI capabilities..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" />
        </div>
        <div className="flex items-center gap-1">
          <Filter size={14} className="text-white/30 ml-1" />
          {['all', 'low', 'moderate', 'high', 'critical'].map((r) => (
            <button key={r} onClick={() => setRiskFilter(r)}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${riskFilter === r ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}>
              {r === 'all' ? 'All' : r}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-white/40 border-b border-white/5">
              <th className="text-left py-2 px-2 font-medium">Capability</th>
              <th className="text-left py-2 px-2 font-medium">Workspace</th>
              <th className="text-left py-2 px-2 font-medium">Model</th>
              <th className="text-left py-2 px-2 font-medium">Risk</th>
              <th className="text-left py-2 px-2 font-medium">Cert</th>
              <th className="text-left py-2 px-2 font-medium">Guardian™</th>
              <th className="text-left py-2 px-2 font-medium">Ver</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((cap) => {
              const risk = RISK_LEVELS[cap.riskLevel] || RISK_LEVELS.low;
              return (
                <tr key={cap.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="py-2.5 px-2">
                    <div className="text-white font-medium">{cap.name}</div>
                    <div className="text-[10px] text-white/30">{cap.purpose}</div>
                  </td>
                  <td className="py-2.5 px-2 text-white/60 capitalize">{cap.workspace}</td>
                  <td className="py-2.5 px-2 text-white/60">{cap.model}</td>
                  <td className="py-2.5 px-2">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: `${risk.color}20`, color: risk.color }}>{risk.label}</span>
                  </td>
                  <td className="py-2.5 px-2">
                    <span className={`text-[10px] font-medium ${cap.certification === 'certified' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {cap.certification === 'certified' ? '✓ Cert' : '⏳ Pending'}
                    </span>
                  </td>
                  <td className="py-2.5 px-2">
                    <span className={`text-[10px] ${cap.guardianStatus === 'passing' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {cap.guardianStatus === 'passing' ? '✓ Pass' : '✗ Fail'}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-white/40">v{cap.version}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}