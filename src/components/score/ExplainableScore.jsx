import React, { useMemo, useState } from "react";
import { computeScoreExplanation } from "@/lib/scoreExplainableEngine";
import ScoreExplainableDrawer from "./ScoreExplainableDrawer";

/**
 * Universal Explainable Score™ component.
 * Wraps any score display to make it clickable and explainable.
 * Pass children to wrap a custom display, or omit for a default badge.
 */
export default function ExplainableScore({ scoreId, snapshot, user, children, className = "" }) {
  const [open, setOpen] = useState(false);
  const explanation = useMemo(() => computeScoreExplanation(scoreId, snapshot), [scoreId, snapshot]);

  if (!explanation) return children || null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group inline-flex items-center gap-1 cursor-pointer ${className}`}
        title={`Click to explain ${explanation.label}: ${explanation.currentScore}% → ${explanation.contributions.length} contributions`}
      >
        {children || (
          <span className="group-hover:text-indigo-300 transition-colors">
            {explanation.currentScore}%
          </span>
        )}
      </button>
      {open && (
        <ScoreExplainableDrawer scoreId={scoreId} snapshot={snapshot} user={user} onClose={() => setOpen(false)} />
      )}
    </>
  );
}