import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function TodaysPriorities({ profile }) {
  const priorities = useMemo(() => {
    if (!profile) return [];
    const items = [];

    if (!profile.identity_verified) {
      items.push({ priority: "High", label: "Verify your identity", why: "Unlocks trust features and platform capabilities", path: "/identity-verification", color: "text-amber-400" });
    }
    if ((profile.interview_readiness || 0) < 50) {
      items.push({ priority: "High", label: "Improve interview readiness", why: "Critical for landing your target role", path: "/challenge", color: "text-indigo-400" });
    }
    if ((profile.leadership_maturity || 0) < 50) {
      items.push({ priority: "Medium", label: "Complete Leadership DNA™", why: "Reveals your leadership strengths and gaps", path: "/leadership-dna", color: "text-violet-400" });
    }
    if ((profile.executive_presence || 0) < 50) {
      items.push({ priority: "Medium", label: "Run an executive simulation", why: "Builds executive presence under pressure", path: "/simulator", color: "text-cyan-400" });
    }
    if ((profile.promotion_readiness || 0) < 50) {
      items.push({ priority: "Medium", label: "Boost promotion readiness", why: "Accelerates your path to the next level", path: "/career-studio", color: "text-emerald-400" });
    }
    if (!profile.resume_url) {
      items.push({ priority: "Low", label: "Upload your resume", why: "Enables AI-powered career intelligence", path: "/resume", color: "text-pink-400" });
    }

    if (items.length === 0) {
      items.push({ priority: "Done", label: "Continue your leadership journey", why: "You're on track — keep building momentum", path: "/journey", color: "text-emerald-400" });
    }
    return items.slice(0, 4);
  }, [profile]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 size={14} className="text-indigo-400" />
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Today's Priorities</h2>
      </div>
      <div className="space-y-2">
        {priorities.map((p, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={p.path} className="flex items-center gap-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-lg px-4 py-3 transition-all group">
              <div className={`text-[10px] font-bold uppercase tracking-wider ${p.color} w-12 flex-shrink-0`}>{p.priority}</div>
              <div className="flex-1 min-w-0">
                <p className="text-white/80 text-sm font-medium truncate">{p.label}</p>
                <p className="text-white/30 text-xs truncate">{p.why}</p>
              </div>
              <ArrowRight size={14} className="text-white/20 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}