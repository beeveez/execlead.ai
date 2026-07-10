import React from "react";
import { Link } from "react-router-dom";
import { Briefcase, Clock, GraduationCap, CheckCircle2, AlertCircle } from "lucide-react";

/**
 * CareerReadiness — target role readiness with missing competencies,
 * estimated time, recommended learning, and probability of success.
 */
export default function CareerReadiness({ readiness, profile }) {
  if (!readiness) return null;

  const targetRole = profile?.target_role || "your target role";
  const score = readiness.overallScore || 0;
  const months = readiness.estimatedMonths || 0;
  const missing = (readiness.dimensions || []).filter((d) => d.gap > 0);
  const probability = Math.min(95, Math.max(20, score + (months === 0 ? 10 : -5)));

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Briefcase size={16} className="text-cyan-400" />
          <h3 className="text-white font-semibold text-sm">Career Readiness</h3>
        </div>
        <Link to="/career-studio" className="text-xs text-cyan-400 hover:text-cyan-300">Career Studio →</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/15 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-cyan-400">{score}%</div>
          <div className="text-white/30 text-[10px] uppercase tracking-wider">Current Readiness</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
          <Clock size={16} className="text-amber-400 mx-auto mb-1" />
          <div className="text-white font-bold text-sm">{months > 0 ? `${months} months` : "Ready now"}</div>
          <div className="text-white/30 text-[10px]">Estimated Time</div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">{probability}%</div>
          <div className="text-white/30 text-[10px] uppercase tracking-wider">Success Probability</div>
        </div>
      </div>

      <div className="text-xs text-white/50 mb-2">
        <span className="text-white/70 font-medium">{targetRole}</span> — {missing.length} competencies to develop
      </div>

      {missing.length > 0 && (
        <div className="space-y-1.5">
          {missing.slice(0, 5).map((d) => (
            <div key={d.id} className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2">
              <AlertCircle size={12} className="text-amber-400 flex-shrink-0" />
              <span className="text-white/60 text-xs flex-1">{d.label}</span>
              <span className="text-white/30 text-[10px]">{d.current}/{d.benchmark}</span>
              <Link to="/academy" className="text-indigo-400 hover:text-indigo-300 text-[10px] flex items-center gap-0.5">
                <GraduationCap size={10} /> Learn
              </Link>
            </div>
          ))}
        </div>
      )}

      {missing.length === 0 && (
        <div className="flex items-center gap-2 text-emerald-400 text-xs py-2">
          <CheckCircle2 size={14} /> All competencies meet or exceed benchmarks for this role.
        </div>
      )}
    </div>
  );
}