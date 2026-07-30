import React, { useMemo } from "react";
import { ShieldCheck, Award, Clock } from "lucide-react";
import { getEvidenceLedger } from "@/lib/readinessEvidenceEngine";
import { getCompetencyReliability } from "@/lib/evidenceReliabilityEngine";
import { gradeReliability } from "@/lib/evidenceReliabilityRegistry";

/**
 * CompetencyReliabilityPanel — every competency displays its
 * Score, Evidence Count, Average Reliability, Confidence, and
 * Last Updated — the trust dimension of Executive Readiness.
 */
export default function CompetencyReliabilityPanel({ competencies = [], limit = 6 }) {
  const records = useMemo(() => getEvidenceLedger(), []);
  const compReliabilities = useMemo(
    () => competencies.map((c) => getCompetencyReliability(records, c)).filter(Boolean).sort((a, b) => b.averageReliability - a.averageReliability),
    [records, competencies]
  );

  if (!compReliabilities.length) {
    return (
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={16} className="text-amber-400" />
          <h3 className="text-white font-semibold text-sm">Competency Reliability™</h3>
        </div>
        <p className="text-white/40 text-[11px] mt-2">Demonstrate competencies through simulations, challenges, and assessments to build reliability-backed scores.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck size={16} className="text-amber-400" />
        <h3 className="text-white font-semibold text-sm">Competency Reliability™</h3>
        <span className="text-[10px] text-white/30 ml-auto">Score × Evidence × Reliability</span>
      </div>

      <div className="space-y-2.5">
        {compReliabilities.slice(0, limit).map((c) => {
          const grade = gradeReliability(c.averageReliability);
          return (
            <div key={c.competency} className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Award size={13} className="text-indigo-400 flex-shrink-0" />
                  <span className="text-[12px] text-white/80 font-medium truncate">{c.competency}</span>
                </div>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ color: grade.color, background: `${grade.color}15` }}>{c.averageReliability} · {grade.label}</span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <div className="text-base font-bold text-white">{c.score}</div>
                  <div className="text-[9px] text-white/30 uppercase tracking-wider">Score</div>
                </div>
                <div>
                  <div className="text-base font-bold text-white/70">{c.evidenceCount}</div>
                  <div className="text-[9px] text-white/30 uppercase tracking-wider">Evidence</div>
                </div>
                <div>
                  <div className="text-base font-bold" style={{ color: grade.color }}>{c.averageReliability}</div>
                  <div className="text-[9px] text-white/30 uppercase tracking-wider">Reliability</div>
                </div>
                <div>
                  <div className="text-base font-bold text-emerald-400">{c.confidence}%</div>
                  <div className="text-[9px] text-white/30 uppercase tracking-wider">Confidence</div>
                </div>
              </div>

              {/* Reliability bar */}
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${c.averageReliability}%`, backgroundColor: grade.color }} />
              </div>

              {/* Last updated */}
              <div className="flex items-center gap-1 mt-2">
                <Clock size={10} className="text-white/30" />
                <span className="text-[9px] text-white/30">Last evidence: {c.lastUpdated ? new Date(c.lastUpdated).toLocaleDateString() : "—"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}