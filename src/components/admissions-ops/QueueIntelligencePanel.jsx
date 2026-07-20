import React, { useState } from "react";
import { AlertTriangle, Clock, Flame, Calendar, UserCheck, UserX, Ban, ArrowUpDown } from "lucide-react";

const CATEGORIES = [
  { key: "overdue", label: "Overdue", icon: AlertTriangle, color: "red" },
  { key: "due_today", label: "Due Today", icon: Calendar, color: "amber" },
  { key: "highest_priority", label: "Highest Priority", icon: Flame, color: "orange" },
  { key: "oldest_pending", label: "Oldest Pending", icon: Clock, color: "slate" },
  { key: "waiting_on_applicant", label: "Waiting on Applicant", icon: UserCheck, color: "cyan" },
  { key: "waiting_on_reviewer", label: "Waiting on Reviewer", icon: UserX, color: "indigo" },
  { key: "blocked", label: "Blocked", icon: Ban, color: "red" },
];

const COLOR_MAP = {
  red: "text-red-400 bg-red-500/10 border-red-500/15",
  amber: "text-amber-400 bg-amber-500/10 border-amber-500/15",
  orange: "text-orange-400 bg-orange-500/10 border-orange-500/15",
  slate: "text-slate-400 bg-slate-500/10 border-slate-500/15",
  cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/15",
  indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/15",
};

const SORT_OPTIONS = [
  { value: "priority", label: "Priority" },
  { value: "oldest", label: "Oldest First" },
  { value: "newest", label: "Newest First" },
  { value: "name", label: "Name A-Z" },
];

export default function QueueIntelligencePanel({ queue }) {
  const [activeCategory, setActiveCategory] = useState("overdue");
  const [sortBy, setSortBy] = useState("priority");

  const category = CATEGORIES.find((c) => c.key === activeCategory);
  let items = queue[activeCategory] || [];

  items = [...items].sort((a, b) => {
    if (sortBy === "priority") return (b.application_score || 0) - (a.application_score || 0);
    if (sortBy === "oldest") return new Date(a.created_date) - new Date(b.created_date);
    if (sortBy === "newest") return new Date(b.created_date) - new Date(a.created_date);
    if (sortBy === "name") return (a.full_name || "").localeCompare(b.full_name || "");
    return 0;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Flame size={14} className="text-orange-400" />
        <h3 className="text-sm font-semibold text-white/70">Queue Intelligence™</h3>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {CATEGORIES.map((cat) => {
          const count = queue[cat.key]?.length || 0;
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`p-3 rounded-xl border text-left transition-colors ${isActive ? COLOR_MAP[cat.color] : "bg-white/[0.02] border-white/5 hover:bg-white/5"}`}
            >
              <cat.icon size={14} className={isActive ? "" : "text-white/30"} />
              <div className={`text-lg font-bold mt-1 ${isActive ? "" : "text-white/60"}`}>{count}</div>
              <div className={`text-[9px] ${isActive ? "" : "text-white/30"}`}>{cat.label}</div>
            </button>
          );
        })}
      </div>

      {/* Sort Bar */}
      <div className="flex items-center gap-2">
        <ArrowUpDown size={12} className="text-white/30" />
        <span className="text-[10px] text-white/30">Sort:</span>
        {SORT_OPTIONS.map((opt) => (
          <button key={opt.value} onClick={() => setSortBy(opt.value)} className={`px-2 py-1 rounded-md text-[10px] font-medium ${sortBy === opt.value ? "bg-amber-500/15 text-amber-400" : "text-white/30 hover:text-white/60"}`}>{opt.label}</button>
        ))}
      </div>

      {/* Queue Items */}
      <div className="space-y-1.5 max-h-96 overflow-y-auto">
        {items.length === 0 ? (
          <div className="text-center py-8"><category.icon size={24} className="text-white/20 mx-auto mb-2" /><p className="text-xs text-white/30">No applications in this category</p></div>
        ) : (
          items.map((app) => (
            <div key={app.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/70 font-medium truncate">{app.full_name}</span>
                  <span className="text-[9px] text-amber-400 font-mono">{app.application_id}</span>
                </div>
                <div className="text-[10px] text-white/30">{app.queue_reason} · {new Date(app.created_date).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-2">
                {app.application_score > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">{app.application_score}</span>}
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 capitalize">{app.status?.replace(/_/g, " ")}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}