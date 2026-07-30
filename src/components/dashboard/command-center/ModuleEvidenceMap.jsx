import React from "react";
import { Link } from "react-router-dom";
import { Network, ArrowRight } from "lucide-react";

const ICONS = {
  MessageSquare: "💬", Brain: "🧠", GraduationCap: "🎓", PenLine: "✏️",
  Scale: "⚖️", Briefcase: "💼", Building2: "🏢", Swords: "⚔️",
  Mic: "🎙️", Users: "👥",
};

/**
 * ModuleEvidenceMap — the backbone of "one operating system, many capabilities."
 *
 * Shows how every platform module contributes evidence to the Executive
 * Readiness dimensions. Modules are never isolated — they all feed the
 * same measurable objective.
 */
export default function ModuleEvidenceMap({ evidenceMap }) {
  if (!evidenceMap || evidenceMap.length === 0) return null;

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Network size={16} className="text-emerald-400" />
        <h3 className="text-white font-semibold text-sm">How Every Module Builds Readiness</h3>
        <span className="text-[10px] text-white/30">Evidence contributions</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {evidenceMap.map((m) => (
          <Link key={m.id} to={m.path} className="group bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-xl p-3 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">{ICONS[m.icon] || "🎯"}</span>
              <span className="text-white/70 text-xs font-medium truncate group-hover:text-white transition-colors">{m.name}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {m.contributes.slice(0, 3).map((c) => (
                <span key={c} className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${m.color}15`, color: m.color }}>{c}</span>
              ))}
            </div>
            <div className="flex items-center gap-1 mt-2 text-[9px] text-white/20 group-hover:text-white/50 transition-colors">
              Contributes <ArrowRight size={9} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}