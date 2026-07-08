import React from "react";
import { Cloud, CheckCircle2, Circle } from "lucide-react";

const PROVIDERS = [
  { name: 'OpenAI', models: 'GPT-5, GPT-5 Mini, GPT-4.1, o3', status: 'connected' },
  { name: 'Anthropic', models: 'Claude Sonnet 4.6, Opus 4.8', status: 'connected' },
  { name: 'Google', models: 'Gemini 3 Flash, Gemini 3.1 Pro', status: 'connected' },
  { name: 'Azure', models: 'GPT-5 (Azure deployment)', status: 'available' },
];

export default function AIProviders() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white">AI Providers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PROVIDERS.map(p => (
          <div key={p.name} className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Cloud size={18} className="text-white/40" />
                <span className="text-white font-medium">{p.name}</span>
              </div>
              {p.status === 'connected'
                ? <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle2 size={12} /> Connected</span>
                : <span className="flex items-center gap-1 text-xs text-white/30"><Circle size={12} /> Available</span>}
            </div>
            <p className="text-white/40 text-sm">{p.models}</p>
          </div>
        ))}
      </div>
    </div>
  );
}