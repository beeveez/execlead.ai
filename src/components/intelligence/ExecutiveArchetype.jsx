import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Fingerprint } from "lucide-react";

const DEFAULT_ARCHETYPE = {
  name: "Emerging Strategist",
  overview: "You demonstrate strong analytical thinking and are developing your executive presence. Your approach balances data-driven decision making with growing people leadership capabilities.",
  strengths: ["Systems Thinking", "Analytical Rigor", "Adaptive Learning"],
  blind_spots: ["Executive Presence", "Stakeholder Influence", "Public Speaking"],
  leadership_style: "Analytical & Collaborative",
  communication_style: "Direct & Data-Driven",
  decision_style: "Consensus-Seeking with Evidence",
  recommended_roles: ["Senior Manager", "Director of Strategy", "Head of Operations"],
};

/**
 * ExecutiveArchetype — displays the user's executive archetype with
 * overview, strengths, blind spots, styles, and recommended roles.
 * Falls back to a default archetype if Leadership DNA is not yet completed.
 */
export default function ExecutiveArchetype({ dna }) {
  const arch = extractArchetype(dna);

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/15 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Fingerprint size={16} className="text-purple-400" />
          <h3 className="text-white font-semibold text-sm">Executive Archetype</h3>
        </div>
        <Link to="/leadership-dna" className="text-xs text-purple-400 hover:text-purple-300">
          {dna ? "View DNA →" : "Complete DNA →"}
        </Link>
      </div>

      <div className="text-center mb-4">
        <Sparkles size={20} className="text-purple-400 mx-auto mb-1" />
        <h4 className="text-lg font-bold text-white">{arch.name}</h4>
      </div>

      <p className="text-white/50 text-xs leading-relaxed mb-4">{arch.overview}</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-emerald-400 text-[10px] font-semibold uppercase tracking-wider mb-2">Strengths</p>
          <div className="space-y-1">
            {arch.strengths.map((s) => (
              <span key={s} className="block text-xs text-white/60">• {s}</span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-amber-400 text-[10px] font-semibold uppercase tracking-wider mb-2">Blind Spots</p>
          <div className="space-y-1">
            {arch.blind_spots.map((s) => (
              <span key={s} className="block text-xs text-white/60">• {s}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-1.5 mb-4">
        <StyleRow label="Leadership Style" value={arch.leadership_style} />
        <StyleRow label="Communication Style" value={arch.communication_style} />
        <StyleRow label="Decision Style" value={arch.decision_style} />
      </div>

      <div>
        <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider mb-2">Recommended Executive Roles</p>
        <div className="flex flex-wrap gap-1.5">
          {arch.recommended_roles.map((r) => (
            <span key={r} className="px-2.5 py-1 rounded-full text-xs bg-purple-500/10 text-purple-300 border border-purple-500/15">{r}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function StyleRow({ label, value }) {
  return (
    <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg px-3 py-1.5">
      <span className="text-white/30 text-[10px]">{label}</span>
      <span className="text-white/60 text-xs font-medium">{value}</span>
    </div>
  );
}

function extractArchetype(dna) {
  if (!dna) return DEFAULT_ARCHETYPE;
  try {
    const parsed = typeof dna === "string" ? JSON.parse(dna) : dna;
    return {
      name: parsed.archetype || parsed.name || DEFAULT_ARCHETYPE.name,
      overview: parsed.overview || parsed.summary || DEFAULT_ARCHETYPE.overview,
      strengths: parsed.strengths || parsed.top_strengths || DEFAULT_ARCHETYPE.strengths,
      blind_spots: parsed.blind_spots || parsed.growth_areas || DEFAULT_ARCHETYPE.blind_spots,
      leadership_style: parsed.leadership_style || DEFAULT_ARCHETYPE.leadership_style,
      communication_style: parsed.communication_style || DEFAULT_ARCHETYPE.communication_style,
      decision_style: parsed.decision_style || DEFAULT_ARCHETYPE.decision_style,
      recommended_roles: parsed.recommended_roles || DEFAULT_ARCHETYPE.recommended_roles,
    };
  } catch {
    return DEFAULT_ARCHETYPE;
  }
}