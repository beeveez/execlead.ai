import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  SCORE_DIMENSIONS,
  RECOMMENDATION_META,
  evaluateProposal,
} from "@/lib/architectureGovernanceEngine";
import { Check, AlertTriangle, RotateCcw, X } from "lucide-react";

const RECOMMENDATION_OPTIONS = [
  { key: "approve",                  label: "Approve",                  icon: Check },
  { key: "approve_with_conditions",  label: "Approve w/ Conditions",   icon: Check },
  { key: "needs_revision",           label: "Needs Revision",           icon: RotateCcw },
  { key: "reject",                   label: "Reject",                   icon: X },
];

/**
 * Review Panel — allows board members to score each dimension,
 * see the live Architecture Impact Score™, and submit a recommendation.
 */
export default function ReviewPanel({ proposal, onReview, onCancel }) {
  const [scores, setScores] = useState(
    SCORE_DIMENSIONS.reduce((acc, dim) => {
      acc[dim.key] = proposal[dim.key] ?? 50;
      return acc;
    }, {})
  );
  const [recommendation, setRecommendation] = useState(proposal.recommendation || "pending");
  const [notes, setNotes] = useState(proposal.recommendation_notes || "");
  const [conditions, setConditions] = useState(proposal.conditions || "");
  const [submitting, setSubmitting] = useState(false);

  const { overallScore, recommendation: autoRec, rationale } = evaluateProposal(scores);
  const recMeta = RECOMMENDATION_META[recommendation] || RECOMMENDATION_META.pending;

  const updateScore = (key, value) => {
    setScores((p) => ({ ...p, [key]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onReview({
        ...scores,
        overall_score: overallScore,
        recommendation,
        recommendation_notes: notes,
        conditions,
        status: recommendation === "approve" ? "approved"
          : recommendation === "approve_with_conditions" ? "approved_with_conditions"
          : recommendation === "needs_revision" ? "needs_revision"
          : recommendation === "reject" ? "rejected"
          : "under_review",
        reviewed_at: new Date().toISOString(),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onCancel}>
      <div
        className="bg-[#0d0d14] border border-white/10 rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#0d0d14] border-b border-white/5 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-semibold text-white">Architecture Review</h2>
            <p className="text-xs text-white/30 mt-0.5">{proposal.title}</p>
          </div>
          <button onClick={onCancel} className="text-white/30 hover:text-white/60"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Auto recommendation hint */}
          <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3 flex items-center gap-3">
            <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
            <div className="text-xs text-white/50">
              <span className="text-white/70">Engine suggestion:</span>{" "}
              <span className={`font-medium ${RECOMMENDATION_META[autoRec]?.text || "text-white/50"}`}>
                {RECOMMENDATION_META[autoRec]?.label || "Pending"}
              </span>
              <span className="block mt-0.5 text-white/30">{rationale}</span>
            </div>
          </div>

          {/* Score sliders */}
          <div>
            <Label className="text-xs text-white/40 mb-3 block">Architecture Impact Score™ — Dimension Scoring</Label>
            <div className="space-y-3">
              {SCORE_DIMENSIONS.map((dim) => (
                <div key={dim.key}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div>
                      <span className="text-white/60">{dim.label}</span>
                      {dim.invert && <span className="text-white/20 ml-1.5 text-[10px]">(lower = better)</span>}
                    </div>
                    <span className="text-white/70 font-mono w-8 text-right">{scores[dim.key]}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={scores[dim.key]}
                    onChange={(e) => updateScore(dim.key, parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Overall score */}
          <div className="bg-white/[0.02] border border-white/10 rounded-lg p-4 flex items-center justify-between">
            <span className="text-xs text-white/40 uppercase tracking-wider">Overall Score</span>
            <span className="text-2xl font-bold" style={{ color: overallScore >= 75 ? "#10b981" : overallScore >= 50 ? "#f59e0b" : "#ef4444" }}>
              {overallScore}
            </span>
          </div>

          {/* Recommendation */}
          <div>
            <Label className="text-xs text-white/40 mb-2 block">Board Recommendation</Label>
            <div className="grid grid-cols-2 gap-2">
              {RECOMMENDATION_OPTIONS.map((opt) => {
                const meta = RECOMMENDATION_META[opt.key];
                const selected = recommendation === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setRecommendation(opt.key)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs transition-colors ${
                      selected ? `${meta.border} ${meta.bg} ${meta.text}` : "border-white/5 bg-white/[0.02] text-white/40 hover:text-white/60"
                    }`}
                  >
                    <opt.icon size={14} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditions */}
          {recommendation === "approve_with_conditions" && (
            <div>
              <Label className="text-xs text-white/40">Conditions</Label>
              <Textarea
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                placeholder="Conditions that must be met before implementation..."
                className="bg-white/5 border-white/10 text-white mt-1 min-h-[60px] text-sm"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <Label className="text-xs text-white/40">Recommendation Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Explain the board's reasoning..."
              className="bg-white/5 border-white/10 text-white mt-1 min-h-[80px] text-sm"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-[#0d0d14] border-t border-white/5 px-6 py-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} className="text-white/40 hover:text-white/60">Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className={`text-white ${recMeta.color !== "#6b7280" ? "" : "bg-indigo-600 hover:bg-indigo-500"}`}
            style={recMeta.color !== "#6b7280" ? { backgroundColor: recMeta.color } : {}}
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      </div>
    </div>
  );
}