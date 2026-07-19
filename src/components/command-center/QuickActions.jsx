import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bug, Map, Rocket, FileText, BarChart3, Users, ShieldCheck, BrainCircuit,
} from 'lucide-react';

const ICON_MAP = { Bug, Map, Rocket, FileText, BarChart3, Users, ShieldCheck, BrainCircuit };

export default function QuickActions({ actions }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {actions.map((a) => {
        const Icon = ICON_MAP[a.icon] || FileText;
        return (
          <Link
            key={a.id}
            to={a.to}
            className="flex items-center gap-2 px-3 py-2.5 bg-white/[0.02] border border-white/5 rounded-lg hover:bg-white/[0.06] hover:border-white/10 transition-colors group"
          >
            <Icon size={14} className="text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
            <span className="text-white/70 text-xs font-medium">{a.label}</span>
          </Link>
        );
      })}
    </div>
  );
}