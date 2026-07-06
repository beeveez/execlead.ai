import React, { useState } from "react";
import { KeyRound, Plus, Copy, Check, Trash2 } from "lucide-react";

export default function ApiKeys() {
  const [keys, setKeys] = useState([
    { id: "1", name: "Production API Key", key: "elk_prod_••••••••••••••••••••", created: "2026-01-15" },
    { id: "2", name: "Development API Key", key: "elk_dev_•••••••••••••••••••••", created: "2026-03-20" },
  ]);
  const [copied, setCopied] = useState(null);

  const handleCopy = (id) => {
    try { navigator.clipboard.writeText(keys.find(k => k.id === id)?.key || ""); } catch (e) {}
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <KeyRound size={12} className="text-indigo-400" /> System
          </div>
          <h1 className="text-2xl font-bold text-white">API Keys</h1>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">
          <Plus size={14} /> Generate Key
        </button>
      </div>
      <div className="space-y-2">
        {keys.map(k => (
          <div key={k.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-white/80 text-sm font-medium">{k.name}</div>
              <div className="text-white/30 text-xs font-mono mt-1">{k.key}</div>
              <div className="text-white/20 text-xs mt-1">Created {k.created}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleCopy(k.id)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 transition-colors">
                {copied === k.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
              <button className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}