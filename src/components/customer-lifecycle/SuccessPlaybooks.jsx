import React, { useState } from "react";
import { BookOpen, AlertTriangle, Zap, Brain, TrendingUp, RefreshCw, Award, Gift } from "lucide-react";
import { SectionCard, StatCard, StatusBadge, EmptyState } from "./Shared";

const PLAYBOOK_ICONS = {
  "Inactive User": AlertTriangle,
  "Re-engagement": RefreshCw,
  "Power User": Zap,
  "Executive Coaching": Brain,
  "Enterprise Expansion": TrendingUp,
  "Renewal": AlertTriangle,
  "Graduation": Award,
};

const PRIORITY_COLORS = {
  P0: "rose", P1: "amber", P2: "cyan",
};

export default function SuccessPlaybooks({ data, onSelectCustomer }) {
  const [activePlaybook, setActivePlaybook] = useState(null);
  const { playbooks } = data;

  const playbookTypes = Object.keys(playbooks.byPlaybook);
  const active = activePlaybook ? playbooks.byPlaybook[activePlaybook] || [] : playbooks.all;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Recommendations" value={playbooks.total} icon={BookOpen} accent="indigo" />
        <StatCard label="P0 Critical" value={playbooks.all.filter((p) => p.priority === "P0").length} icon={AlertTriangle} accent="rose" />
        <StatCard label="P1 High" value={playbooks.all.filter((p) => p.priority === "P1").length} icon={AlertTriangle} accent="amber" />
        <StatCard label="Playbook Types" value={playbookTypes.length} icon={BookOpen} accent="cyan" />
      </div>

      <div className="flex gap-1 flex-wrap">
        <button onClick={() => setActivePlaybook(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${!activePlaybook ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "bg-white/5 text-white/40 border border-white/10 hover:text-white/60"}`}>
          All ({playbooks.total})
        </button>
        {playbookTypes.map((pb) => (
          <button key={pb} onClick={() => setActivePlaybook(pb)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activePlaybook === pb ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "bg-white/5 text-white/40 border border-white/10 hover:text-white/60"}`}>
            {pb} ({playbooks.byPlaybook[pb].length})
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {active.slice(0, 30).map((p, i) => {
          const Icon = PLAYBOOK_ICONS[p.playbook] || BookOpen;
          return (
            <div key={i} onClick={() => onSelectCustomer?.(p.customer)}
              className="bg-white/5 border border-white/10 rounded-xl p-4 cursor-pointer hover:bg-white/10 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <Icon size={14} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-medium">{p.playbook}</p>
                    <p className="text-white/30 text-xs">{p.customer.fullName || p.customer.email}</p>
                  </div>
                </div>
                <StatusBadge status={p.priority} color={PRIORITY_COLORS[p.priority]} />
              </div>
              <p className="text-white/50 text-xs">{p.reason}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-indigo-400 text-xs font-medium">{p.action}</span>
              </div>
            </div>
          );
        })}
      </div>

      {active.length === 0 && <EmptyState message="No playbook recommendations" />}
    </div>
  );
}