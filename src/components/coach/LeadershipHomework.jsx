import React, { useState, useEffect } from "react";
import { BookOpen, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function LeadershipHomework({ coachingFocus }) {
  const [homework, setHomework] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const topic = coachingFocus?.title || "executive leadership";
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Assign ONE or TWO coaching homework activities for an executive working on "${topic}". Format as a brief list. Keep each activity practical and observable. Do not include preamble.`,
      });
      setHomework(res);
    } catch {
      setHomework("Unable to generate homework. Please try again.");
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
          <BookOpen size={14} className="text-violet-400" />
          <h3 className="text-sm font-semibold text-white/80">Leadership Homework</h3>
        </div>
        <button onClick={generate} disabled={loading} className="p-1.5 rounded-lg text-white/30 hover:text-white/60 bg-white/[0.03] disabled:opacity-50">
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
        </button>
      </div>
      {loading ? (
        <div className="text-xs text-white/30 py-3">Generating homework...</div>
      ) : homework ? (
        <div className="text-xs text-white/60 leading-relaxed whitespace-pre-wrap">{homework}</div>
      ) : (
        <div className="text-xs text-white/30 py-3">Click generate for coaching homework.</div>
      )}
    </div>
  );
}