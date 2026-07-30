import React, { useState } from "react";
import { Cpu, RotateCcw, Plus } from "lucide-react";

/**
 * ModelRegistryPanel — Model Registry™: deployed AI model versions with
 * version, type, deployment date, performance, and rollback.
 */
export default function ModelRegistryPanel({ models, onAdd, onRollback }) {
  const [version, setVersion] = useState("");
  const [type, setType] = useState("recommendation");

  const submit = () => {
    if (!version.trim()) return;
    onAdd({ version: version.trim(), type });
    setVersion("");
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Cpu size={16} className="text-violet-400" />
        <h3 className="text-white font-semibold text-sm">Model Registry™</h3>
      </div>

      <div className="flex gap-2 mb-3">
        <input
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          placeholder="v2"
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/40"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
        >
          <option value="recommendation">recommendation</option>
          <option value="coaching">coaching</option>
          <option value="prediction">prediction</option>
        </select>
        <button onClick={submit} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 text-xs transition-colors">
          <Plus size={12} /> Deploy
        </button>
      </div>

      <div className="space-y-2">
        {models.map((m) => (
          <div key={m.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">{m.version}</span>
                <span className="text-[10px] text-white/40">{m.type}</span>
                {m.active && <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">active</span>}
              </div>
              <div className="text-[11px] text-white/40 mt-0.5">
                Deployed {new Date(m.deployedAt).toLocaleDateString()} · perf {m.performance}%
              </div>
            </div>
            {!m.active && (
              <button onClick={() => onRollback(m.id)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-white/60 text-[11px] transition-colors">
                <RotateCcw size={11} /> Rollback
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}