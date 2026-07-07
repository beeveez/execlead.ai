import React from "react";
import {
  ShieldOff, Key, Layers, Lock, Eye, Building2, Activity, ShieldCheck,
  Database, Send, Monitor, Network, Brain, Dna, Search, Users, Cpu, CheckCircle,
  Atom,
} from "lucide-react";

const ICON_MAP = {
  ShieldOff, Key, Layers, Lock, Eye, Building2, Activity, ShieldCheck,
  Database, Send, Monitor, Network, Brain, Dna, Search, Users, Cpu, CheckCircle,
  Atom,
};

export function getIcon(name) {
  return ICON_MAP[name] || ShieldCheck;
}

export function SectionCard({ icon: Icon, title, description, children, className = "" }) {
  return (
    <div className={`bg-white/[0.02] border border-white/5 rounded-xl p-5 ${className}`}>
      <div className="flex items-center gap-2 text-violet-400 text-xs font-medium uppercase tracking-wider mb-1">
        {Icon && <Icon size={14} />} {title}
      </div>
      {description && <p className="text-white/40 text-xs mb-4 leading-relaxed">{description}</p>}
      {children}
    </div>
  );
}

export function IconGrid({ items, columns = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" }) {
  return (
    <div className={`grid ${columns} gap-3`}>
      {items.map((item, i) => {
        const Icon = typeof item.icon === "string" ? getIcon(item.icon) : item.icon;
        return (
          <div key={i} className="flex items-start gap-2.5 bg-white/[0.02] border border-white/5 rounded-lg p-3">
            {Icon && <Icon size={16} className="text-violet-400 mt-0.5 shrink-0" />}
            <div>
              <div className="text-sm text-white/80 font-medium">{item.title || item.name || item}</div>
              {item.desc && <div className="text-xs text-white/40 mt-0.5 leading-relaxed">{item.desc}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ChipList({ items }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span key={i} className="px-2.5 py-1 rounded-full text-xs bg-violet-500/10 text-violet-300 border border-violet-500/20">
          {item}
        </span>
      ))}
    </div>
  );
}

export function StatusBadge({ status }) {
  const config = {
    live: { label: "Live", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    active: { label: "Active", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    planned: { label: "Planned", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    roadmap: { label: "Roadmap", cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    future: { label: "Future", cls: "bg-white/5 text-white/40 border-white/10" },
  };
  const c = config[status] || config.future;
  return <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${c.cls}`}>{c.label}</span>;
}