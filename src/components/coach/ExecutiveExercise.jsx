import React, { useState, useEffect } from "react";
import { Dumbbell, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function ExecutiveExercise({ coachingFocus }) {
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const topic = coachingFocus?.title || "executive leadership";
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate ONE personalized executive coaching exercise for the topic "${topic}". Format as: Title, Description (2-3 sentences), Steps (3-4 bullet points). Keep it practical and actionable. Do not include any preamble.`,
      });
      setExercise(res);
    } catch {
      setExercise("Unable to generate exercise. Please try again.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (coachingFocus) generate();
  }, [coachingFocus?.title]);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Dumbbell size={14} className="text-emerald-400" />
          <h3 className="text-sm font-semibold text-white/80">Executive Exercise</h3>
        </div>
        <button onClick={generate} disabled={loading} className="p-1.5 rounded-lg text-white/30 hover:text-white/60 bg-white/[0.03] disabled:opacity-50">
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
      {loading ? (
        <div className="text-xs text-white/30 py-3">Generating exercise...</div>
      ) : exercise ? (
        <div className="text-xs text-white/60 leading-relaxed whitespace-pre-wrap">{exercise}</div>
      ) : (
        <div className="text-xs text-white/30 py-3">Click generate for a personalized exercise.</div>
      )}
    </div>
  );
}