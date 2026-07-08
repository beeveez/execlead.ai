import React from "react";

const MODELS = [
  { id: 'gpt_5_mini', provider: 'OpenAI', version: '5.1', isDefault: true, routing: 'Fast tasks, agent execution' },
  { id: 'gpt_5_4', provider: 'OpenAI', version: '5.4', isDefault: false, routing: 'Complex reasoning' },
  { id: 'gemini_3_flash', provider: 'Google', version: '3.0', isDefault: false, routing: 'Web search + vision' },
  { id: 'claude_sonnet_4_6', provider: 'Anthropic', version: '4.6', isDefault: false, routing: 'Long-context analysis' },
  { id: 'automatic', provider: 'Platform', version: '—', isDefault: false, routing: 'Auto-selects optimal model' },
];

export default function ModelManagement() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white">Model Management</h2>
      <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="text-white/30 text-xs uppercase tracking-wider border-b border-white/5">
              <th className="text-left p-3 font-medium">Model</th>
              <th className="text-left p-3 font-medium">Provider</th>
              <th className="text-left p-3 font-medium">Version</th>
              <th className="text-left p-3 font-medium">Default</th>
              <th className="text-left p-3 font-medium">Routing Rule</th>
            </tr>
          </thead>
          <tbody>
            {MODELS.map(m => (
              <tr key={m.id} className="border-b border-white/5 last:border-0">
                <td className="p-3 text-white font-medium font-mono text-xs">{m.id}</td>
                <td className="p-3 text-white/60">{m.provider}</td>
                <td className="p-3 text-white/60">{m.version}</td>
                <td className="p-3">{m.isDefault ? <span className="text-emerald-400 text-xs">✓ Default</span> : <span className="text-white/20 text-xs">—</span>}</td>
                <td className="p-3 text-white/40 text-xs">{m.routing}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}