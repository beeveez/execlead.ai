import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Gauge, ArrowRight, Award, Sparkles } from 'lucide-react';

export default function ReadinessAssessmentCTA() {
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await base44.entities.ReadinessAssessment.list('-completed_at', 1);
        setLatest(list && list[0]);
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  if (loading) return null;

  if (!latest) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-accent-orange/12 to-transparent border border-accent-orange/25 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-accent-orange/15 flex items-center justify-center shrink-0"><Gauge size={22} className="text-accent-orange" /></div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-white">Take the Executive Readiness Assessment™</div>
          <div className="text-xs text-white/50 mt-0.5">10 minutes · discover your score, leadership gaps, and promotion forecast.</div>
        </div>
        <Link to="/assessment" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent-orange hover:bg-accent-orange/90 text-white text-xs font-semibold transition-colors shrink-0">
          Start <ArrowRight size={14} />
        </Link>
      </motion.div>
    );
  }

  return (
    <Link to="/assessment" className="block">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-accent-orange/10 to-transparent border border-accent-orange/20 rounded-2xl p-5 hover:border-accent-orange/40 transition-colors">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 shrink-0">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
              <circle cx="28" cy="28" r="24" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(latest.overall_score / 100) * 150.8} 150.8`} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-accent-orange">{latest.overall_score}</div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2"><span className="text-sm font-semibold text-white">Your Executive Readiness</span><span className="px-2 py-0.5 rounded-full bg-accent-orange/15 border border-accent-orange/25 text-[10px] font-medium text-accent-orange">{latest.classification_label}</span></div>
            <div className="text-xs text-white/50 mt-0.5 flex items-center gap-1.5"><Sparkles size={11} className="text-indigo-400" /> +{latest.xp_awarded} XP earned · <Award size={11} className="text-amber-400" /> {latest.classification_label} badge</div>
          </div>
          <span className="text-xs text-accent-orange font-medium shrink-0 hidden sm:flex items-center gap-1">Retake <ArrowRight size={13} /></span>
        </div>
      </motion.div>
    </Link>
  );
}