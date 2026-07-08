import React from "react";
import { User, Monitor, Building2 } from "lucide-react";

const STORES = [
  { name: 'User Memory', scope: 'Per-executive', icon: User, desc: 'Personal profile, goals, preferences, achievements', entity: 'ExecutiveMemory' },
  { name: 'Session Memory', scope: 'Per-session', icon: Monitor, desc: 'Active conversation context and task state', entity: 'AITask' },
  { name: 'Organization Memory', scope: 'Per-org', icon: Building2, desc: 'Shared company knowledge and team context', entity: 'Organization' },
];

export default function MemoryStores() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white">Memory Stores</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STORES.map(s => (
          <div key={s.name} className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
            <s.icon size={18} className="text-indigo-400 mb-3" />
            <h3 className="text-white font-medium text-sm mb-1">{s.name}</h3>
            <p className="text-white/30 text-xs mb-3">{s.desc}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/40">{s.scope}</span>
              <span className="text-white/30 font-mono">{s.entity}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}