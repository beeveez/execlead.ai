import React, { useState } from "react";
import { FileText, Check, RotateCcw, Plus } from "lucide-react";

/**
 * PromptGovernancePanel — Prompt Governance™: prompt versions with author,
 * approval status, deployment, and rollback. Tracks prompt drift across versions.
 */
export default function PromptGovernancePanel({ prompts, onAdd, onApprove, onRollback }) {
  const [key, setKey] = useState("executive_coach");
  const [author, setAuthor] = useState("");

  const submit = () => {
    if (!key.trim()) return;
    onAdd({ key: key.trim(), author: author.trim() || "platform" });
    setAuthor("");
  };

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <FileText size={16} className="text-cyan-400" />
        <h3 className="text-white font-semibold text-sm">Prompt Governance™</h3>
      </div>

      <div className="flex gap-2 mb-3">
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="prompt key"
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/40"
        />
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="author"
          className="w-28 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/40"
        />
        <button onClick={submit} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-xs transition-colors">
          <Plus size={12} /> Version
        </button>
      </div>

      <div className="space-y-2">
        {prompts.map((p) => (
          <div key={p.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">{p.version}</span>
                <span className="text-[10px] text-white/40">{p.key}</span>
                {p.approved ? (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">approved</span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400">pending</span>
                )}
              </div>
              <div className="text-[11px] text-white/40 mt-0.5">
                {p.author} · {new Date(p.deployedAt).toLocaleDateString()} · perf {p.performance}%
              </div>
            </div>
            <div className="flex gap-1">
              {!p.approved && (
                <button onClick={() => onApprove(p.id)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-300 text-[11px]">
                  <Check size={11} /> Approve
                </button>
              )}
              {p.approved && prompts.length > 1 && (
                <button onClick={() => onRollback(p.id)} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-white/60 text-[11px]">
                  <RotateCcw size={11} /> Activate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}