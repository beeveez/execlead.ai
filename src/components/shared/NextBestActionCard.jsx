import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { orchestrateJourney } from "@/lib/journeyOrchestratorEngine";
import { Zap, ArrowRight, Clock } from "lucide-react";

const PRIORITY_STYLES = {
  critical: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  high: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  medium: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  low: "bg-white/5 text-white/40 border-white/10",
};

export default function NextBestActionCard() {
  const { user } = useAuth();
  const [nba, setNba] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    orchestrateJourney(user)
      .then((result) => { if (!cancelled) setNba(result.nextBestAction); })
      .catch(() => { if (!cancelled) setNba(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id]);

  if (loading) {
    return <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 animate-pulse h-24" />;
  }
  if (!nba) return null;

  const priorityStyle = PRIORITY_STYLES[nba.priority] || PRIORITY_STYLES.medium;

  return (
    <Link
      to={nba.path || "/journey-orchestrator"}
      className="block group bg-gradient-to-br from-indigo-500/[0.06] to-violet-500/[0.04] border border-indigo-500/15 hover:border-indigo-500/25 rounded-xl p-5 transition-all duration-300"
    >
      <div className="flex items-center gap-2 mb-2">
        <Zap size={14} className="text-indigo-400" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">Next Best Action™</span>
        <span className={`text-[9px] font-medium uppercase px-1.5 py-0.5 rounded border ${priorityStyle}`}>{nba.priority}</span>
      </div>
      <h3 className="text-base font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">{nba.title}</h3>
      <p className="text-sm text-white/50 leading-relaxed mb-3">{nba.description}</p>
      <div className="flex items-center gap-4 text-[11px] text-white/40">
        {nba.estimatedMinutes && (
          <span className="flex items-center gap-1"><Clock size={10} /> {nba.estimatedMinutes} min</span>
        )}
        {nba.readinessImpact && (
          <span className="text-emerald-400/60">+{nba.readinessImpact}% readiness</span>
        )}
        <span className="flex items-center gap-1 ml-auto text-indigo-400 group-hover:translate-x-0.5 transition-transform">
          Start <ArrowRight size={10} />
        </span>
      </div>
    </Link>
  );
}