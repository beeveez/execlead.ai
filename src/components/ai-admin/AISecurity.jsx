import React from "react";
import { ShieldCheck, FileText } from "lucide-react";

const FEATURES = [
  { name: 'Prompt Injection Detection', desc: 'Monitors inputs for injection attempts' },
  { name: 'Content Moderation', desc: 'Filters harmful or inappropriate content' },
  { name: 'PII Protection', desc: 'Redacts personally identifiable information' },
  { name: 'Audit Logs', desc: 'Records all AI requests and responses' },
];

export default function AISecurity() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white">AI Security</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FEATURES.map(f => (
          <div key={f.name} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span className="text-white font-medium text-sm">{f.name}</span>
              </div>
              <span className="text-xs text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">Active</span>
            </div>
            <p className="text-white/40 text-xs">{f.desc}</p>
          </div>
        ))}
      </div>
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={14} className="text-white/40" />
          <h3 className="text-white/60 text-sm font-medium">Recent Security Events</h3>
        </div>
        <p className="text-white/20 text-xs text-center py-4">No security events in the last 30 days</p>
      </div>
    </div>
  );
}