import React, { useMemo, useState } from "react";
import { Activity, ChevronRight } from "lucide-react";
import SectionCard from "@/components/founder-mc/SectionCard";
import { computeScoreExplanation, SCORE_IDS } from "@/lib/scoreExplainableEngine";
import ScoreExplainableDrawer from "./ScoreExplainableDrawer";

const STATUS_COLOR = (score) => (score >= 90 ? "#10b981" : score >= 70 ? "#f59e0b" : "#ef4444");

function ScoreCard({ scoreId, snapshot, onClick }) {
  const exp = useMemo(() => computeScoreExplanation(scoreId, snapshot), [scoreId, snapshot]);
  if (!exp) return null;
  const color = STATUS_COLOR(exp.currentScore);

  return (
    <button
      onClick={onClick}
      className="text-left bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:bg-white/[0.04] transition-colors group"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/60 font-medium truncate group-hover:text-indigo-300 transition-colors">{exp.label}</span>
        <ChevronRight size={12} className="text-white/20 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-foreground">{exp.currentScore}</span>
        <span className="text-xs text-muted-foreground">/{exp.target}</span>
      </div>
      <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${exp.currentScore}%`, backgroundColor: color }} />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[9px] text-muted-foreground">{exp.contributions.length} contributions</span>
        <span className="text-[9px] font-semibold" style={{ color }}>{exp.remaining > 0 ? `${exp.remaining} pts remaining` : "At target"}</span>
      </div>
    </button>
  );
}

export default function ExplainableScoresSection({ snapshot, user }) {
  const [activeScore, setActiveScore] = useState(null);

  return (
    <>
      <SectionCard
        title="Explainable Platform Scores™"
        subtitle="Every score explains itself — click any score for its formula, contribution breakdown, and path to 100%"
        icon={Activity}
        accent="indigo"
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {SCORE_IDS.map((id) => (
            <ScoreCard key={id} scoreId={id} snapshot={snapshot} onClick={() => setActiveScore(id)} />
          ))}
        </div>
      </SectionCard>

      {activeScore && (
        <ScoreExplainableDrawer
          scoreId={activeScore}
          snapshot={snapshot}
          user={user}
          onClose={() => setActiveScore(null)}
        />
      )}
    </>
  );
}