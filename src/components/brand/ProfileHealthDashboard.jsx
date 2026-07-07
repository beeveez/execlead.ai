import React from "react";
import { calculateProfileHealth } from "@/lib/executiveReputation";
import {
  Heart, UserCircle, Briefcase, Brain, Crown, Globe, FileText, Zap, Building2, Target, Eye, Circle,
} from "lucide-react";

const ICON_MAP = { UserCircle, Briefcase, Brain, Crown, Globe, FileText, Zap, Building2, Target, Eye };

const STATUS_CONFIG = {
  Excellent: { color: "#10b981", bg: "bg-emerald-500/5", text: "text-emerald-400", dot: "bg-emerald-400" },
  Good: { color: "#f59e0b", bg: "bg-amber-500/5", text: "text-amber-400", dot: "bg-amber-400" },
  "Needs Attention": { color: "#ef4444", bg: "bg-red-500/5", text: "text-red-400", dot: "bg-red-400" },
};

export default function ProfileHealthDashboard({ profile }) {
  const { dimensions, overall, status } = calculateProfileHealth(profile);
  const statusCfg = STATUS_CONFIG[status];

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Heart size={14} className="text-rose-400" />
          <h3 className="text-sm font-semibold text-white">Profile Health Dashboard</h3>
        </div>
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.bg} ${statusCfg.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} /> {status}
        </span>
      </div>

      <div className="px-5 py-4 border-b border-white/5">
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xs text-white/40 uppercase tracking-wider">Overall Health</span>
          <span className="text-2xl font-bold" style={{ color: statusCfg.color }}>{overall}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${overall}%`, background: statusCfg.color }} />
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {dimensions.map((d) => {
          const Icon = ICON_MAP[d.icon] || Circle;
          const cfg = STATUS_CONFIG[d.status];
          return (
            <div key={d.key} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <Icon size={15} className="text-white/40" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-white/70 truncate">{d.label}</span>
                  <span className={`text-[10px] font-medium ${cfg.text}`}>{d.status}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${d.score}%`, background: cfg.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}