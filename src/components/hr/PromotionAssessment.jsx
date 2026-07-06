import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, TrendingUp, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function PromotionAssessment({ assessment }) {
  const readiness = assessment.readiness_score || 0;
  const color = readiness >= 70 ? "text-emerald-400" : readiness >= 50 ? "text-amber-400" : "text-red-400";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-white/30 uppercase tracking-wider">Promotion Readiness</div>
            <div className={`text-4xl font-bold ${color}`}>{readiness}<span className="text-lg text-white/30">/100</span></div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/30 uppercase tracking-wider">Recommendation</div>
            <div className="text-sm font-medium text-white">{assessment.recommendation || "—"}</div>
          </div>
        </div>
        {assessment.timeline && (
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Clock size={12} /> Estimated timeline: <span className="text-white/70">{assessment.timeline}</span>
          </div>
        )}
      </div>

      {assessment.strengths && (
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <h3 className="text-emerald-400 font-semibold text-xs uppercase tracking-wider">Strengths</h3>
          </div>
          <div className="text-white/70 text-sm prose prose-invert prose-sm max-w-none"><ReactMarkdown>{assessment.strengths}</ReactMarkdown></div>
        </div>
      )}

      {assessment.development_areas && (
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-amber-400" />
            <h3 className="text-amber-400 font-semibold text-xs uppercase tracking-wider">Development Areas</h3>
          </div>
          <div className="text-white/70 text-sm prose prose-invert prose-sm max-w-none"><ReactMarkdown>{assessment.development_areas}</ReactMarkdown></div>
        </div>
      )}

      {assessment.development_plan && (
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-indigo-400" />
            <h3 className="text-indigo-400 font-semibold text-xs uppercase tracking-wider">Development Plan</h3>
          </div>
          <div className="text-white/70 text-sm prose prose-invert prose-sm max-w-none"><ReactMarkdown>{assessment.development_plan}</ReactMarkdown></div>
        </div>
      )}
    </motion.div>
  );
}