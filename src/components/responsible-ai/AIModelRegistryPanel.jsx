import React from 'react';
import { Cpu, CheckCircle2, Clock, Building2 } from 'lucide-react';

export default function AIModelRegistryPanel({ modelRegistry }) {
  const { models, totalModels, providers, tiers } = modelRegistry;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Cpu size={16} className="text-cyan-400" />
        <h3 className="text-sm font-semibold text-white">AI Model Registry™</h3>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <MetricCard label="Models" value={totalModels} color="#06b6d4" />
        <MetricCard label="Providers" value={providers.length} color="#6366f1" />
        <MetricCard label="Tiers" value={tiers.length} color="#a855f7" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-white/40 border-b border-white/5">
              <th className="text-left py-2 px-2 font-medium">Model</th>
              <th className="text-left py-2 px-2 font-medium">Provider</th>
              <th className="text-left py-2 px-2 font-medium">Tier</th>
              <th className="text-left py-2 px-2 font-medium">Risk</th>
              <th className="text-left py-2 px-2 font-medium">Status</th>
              <th className="text-left py-2 px-2 font-medium">Validated</th>
            </tr>
          </thead>
          <tbody>
            {models.map((model) => {
              const riskColor = model.riskLevel === 'high' ? '#f97316' : model.riskLevel === 'moderate' ? '#f59e0b' : '#10b981';
              return (
                <tr key={model.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="py-2.5 px-2">
                    <div className="text-white font-medium">{model.label}</div>
                    <div className="text-[10px] text-white/30">Max context: {model.maxContext.toLocaleString()}</div>
                  </td>
                  <td className="py-2.5 px-2 text-white/60 capitalize">{model.provider}</td>
                  <td className="py-2.5 px-2">
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/5 text-white/60">{model.tierLabel}</span>
                  </td>
                  <td className="py-2.5 px-2">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ background: `${riskColor}20`, color: riskColor }}>{model.riskLevel}</span>
                  </td>
                  <td className="py-2.5 px-2">
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                      <CheckCircle2 size={10} /> {model.retirementStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-white/40">{model.lastValidation}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricCard({ label, value, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
      <div className="text-lg font-bold" style={{ color }}>{value}</div>
      <div className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}