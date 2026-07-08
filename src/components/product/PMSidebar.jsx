import React from "react";
import {
  LayoutDashboard, Inbox, Bug, Lightbulb, Trello, Rocket,
  Sparkles, Users, BarChart3,
} from "lucide-react";
import { PM_SECTIONS } from "@/lib/productManagement";

const ICONS = {
  LayoutDashboard, Inbox, Bug, Lightbulb, Trello, Rocket,
  Sparkles, Users, BarChart3,
};

export default function PMSidebar({ active, onSelect, kpis }) {
  const badgeFor = (id) => {
    if (!kpis) return null;
    if (id === "inbox") return kpis.newFeedback || null;
    if (id === "bugs") return kpis.openBugs || null;
    if (id === "features") return kpis.featureRequests || null;
    return null;
  };

  return (
    <>
      {/* Desktop vertical sidebar */}
      <nav className="hidden lg:flex flex-col gap-0.5 w-56 shrink-0">
        {PM_SECTIONS.map(s => {
          const Icon = ICONS[s.icon] || LayoutDashboard;
          const badge = badgeFor(s.id);
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left ${
                active === s.id
                  ? "bg-indigo-500/15 text-indigo-400"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              <Icon size={15} />
              <span className="flex-1">{s.label}</span>
              {badge ? (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-white/10 text-white/60">{badge}</span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Mobile horizontal tabs */}
      <nav className="lg:hidden flex items-center gap-1 overflow-x-auto pb-2 -mx-1 px-1">
        {PM_SECTIONS.map(s => {
          const Icon = ICONS[s.icon] || LayoutDashboard;
          const badge = badgeFor(s.id);
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                active === s.id ? "bg-indigo-500/15 text-indigo-400" : "text-white/50 hover:text-white/80"
              }`}
            >
              <Icon size={13} /> {s.label}
              {badge ? <span className="px-1 rounded-full text-[9px] font-bold bg-white/10">{badge}</span> : null}
            </button>
          );
        })}
      </nav>
    </>
  );
}