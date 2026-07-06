import React from "react";
import { GitBranch, CheckCircle2, Clock } from "lucide-react";

const MIGRATIONS = [
  { id: "001", name: "initial_schema", status: "applied", date: "2025-11-01" },
  { id: "002", name: "add_cpq_entities", status: "applied", date: "2025-12-15" },
  { id: "003", name: "add_social_sharing", status: "applied", date: "2026-06-20" },
  { id: "004", name: "add_role_based_nav", status: "applied", date: "2026-07-06" },
  { id: "005", name: "add_developer_workspace", status: "pending", date: "—" },
];

export default function MigrationHistory() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <GitBranch size={12} className="text-indigo-400" /> System
        </div>
        <h1 className="text-2xl font-bold text-white">Migration History</h1>
      </div>
      <div className="space-y-2">
        {MIGRATIONS.map(m => (
          <div key={m.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-white/30 text-xs font-mono">#{m.id}</span>
              <span className="text-white/80 text-sm font-medium font-mono">{m.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/30 text-xs">{m.date}</span>
              {m.status === "applied" ? (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-medium"><CheckCircle2 size={12} /> Applied</span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-xs font-medium"><Clock size={12} /> Pending</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}