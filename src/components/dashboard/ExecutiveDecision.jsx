import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, ArrowRight } from "lucide-react";

export default function ExecutiveDecision({ decision }) {
  if (!decision) return null;
  const impacts = [
    { label: "Business", value: decision.businessImpact, color: "text-cyan-400" },
    { label: "Career", value: decision.careerImpact, color: "text-indigo-400" },
    { label: "Journey", value: decision.journeyImpact, color: "text-violet-400" },
    { label: "Readiness", value: decision.readinessImpact, color: "text-emerald-400" },
  ].filter((i) => i.value);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Link to={decision.path || "/dashboard"} className="block group">
        <div className="bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/15 rounded-2xl p-5 hover:border-indigo-500/25 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-indigo-400 text-xs uppercase tracking-widest">
              <Target size={12} /> Today's Executive Decision™
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/40">{decision.estimatedTime}</span>
              <span className="text-white/40">Confidence: <span className="text-white font-bold">{decision.confidence || 0}%</span></span>
            </div>
          </div>
          <h3 className="text-white font-bold text-base mb-1">{decision.title}</h3>
          <p className="text-white/50 text-sm mb-3">{decision.reason}</p>
          {impacts.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
              {impacts.map((imp) => (
                <div key={imp.label} className="bg-white/5 border border-white/5 rounded-lg px-3 py-2">
                  <div className="text-white/30 text-[10px] uppercase tracking-wider">{imp.label} Impact</div>
                  <div className={`${imp.color} text-xs font-medium mt-0.5`}>{imp.value}</div>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between">
            <p className="text-white/40 text-xs">Expected: {decision.expectedOutcome}</p>
            <span className="flex items-center gap-1 text-indigo-400 text-xs group-hover:gap-2 transition-all">
              Execute <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}