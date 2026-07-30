import React from "react";
import { ShieldCheck, TrendingUp, Target, Award, Sparkles, ChevronRight } from "lucide-react";
import { QUESTION_CATEGORIES } from "@/lib/launchDefenseEngine";

/**
 * LaunchDefenseDashboard — Launch Readiness™ overview: overall readiness,
 * question-bank progress, practice sessions, average score, mastered
 * questions, weak categories, today's challenge, and AI recommendation.
 */
export default function LaunchDefenseDashboard({ ld, onTab }) {
  const { readiness, questions, sessions, attempts, achievements } = ld;
  if (!readiness) return null;

  const earned = achievements.filter((a) => a.earned).length;
  const todaysChallenge = questions[Math.floor(Math.random() * Math.max(questions.length, 1))] || null;
  const aiRec = readiness.weakCategories[0]
    ? `Focus on ${readiness.weakCategories[0].category} — your average there is ${readiness.weakCategories[0].avg}/100. Practice a scenario in that category to lift your Launch Readiness.`
    : "Practice a new scenario today to keep your Launch Readiness climbing.";

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={20} className="text-indigo-400" />
          <h1 className="text-xl font-bold text-white">Launch Defense Center™</h1>
        </div>
        <p className="text-sm text-white/50 max-w-xl">Master every high-stakes conversation. Prepare for investors, enterprise customers, executive interviews, media appearances, board presentations and conference stages using AI-powered simulations.</p>
        <div className="flex gap-3 mt-4">
          <button onClick={() => onTab("simulator")} className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors">Start Practice</button>
          <button onClick={() => onTab("questions")} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm transition-colors">Browse Question Bank</button>
        </div>
      </div>

      {/* Launch Readiness score */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Metric icon={Target} label="Launch Readiness" value={`${readiness.overall}`} suffix="/100" color="#6366f1" />
        <Metric icon={TrendingUp} label="Avg Score" value={`${readiness.avgScore}`} suffix="/100" color="#10b981" />
        <Metric icon={ShieldCheck} label="Mastered" value={`${readiness.mastered}`} color="#f59e0b" />
        <Metric icon={Award} label="Achievements" value={`${earned}`} color="#ec4899" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress + weak categories */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
          <h3 className="text-white font-semibold text-sm mb-3">Progress</h3>
          <Bar label="Question Bank Progress" value={readiness.questionBankProgress} color="#0ea5e9" />
          <Bar label="Questions Answered" value={Math.min(100, readiness.questionsAnswered * 2)} color="#6366f1" />
          <Bar label="Sessions Completed" value={Math.min(100, readiness.sessionsCompleted * 20)} color="#10b981" />
          <div className="mt-4 pt-3 border-t border-white/5">
            <div className="text-[11px] uppercase tracking-wider text-white/40 mb-2">Weak Categories</div>
            {readiness.weakCategories.length ? readiness.weakCategories.slice(0, 4).map((w) => (
              <div key={w.category} className="flex items-center justify-between text-xs py-1">
                <span className="text-white/60">{w.category}</span>
                <span className="text-rose-400">{w.avg}/100</span>
              </div>
            )) : <p className="text-xs text-white/40">No weak categories yet — start practicing.</p>}
          </div>
        </div>

        {/* Today's challenge + AI recommendation */}
        <div className="space-y-4">
          {todaysChallenge && (
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-amber-400" />
                <span className="text-[11px] uppercase tracking-wider text-white/40">Today's Challenge</span>
              </div>
              <p className="text-sm text-white/80 mb-3">{todaysChallenge.question}</p>
              <button onClick={() => onTab("questions")} className="text-xs text-indigo-400 inline-flex items-center gap-1 hover:gap-2 transition-all">
                Practice this <ChevronRight size={12} />
              </button>
            </div>
          )}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Target size={14} className="text-emerald-400" />
              <span className="text-[11px] uppercase tracking-wider text-white/40">AI Recommendation</span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">{aiRec}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, suffix, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-1"><Icon size={12} style={{ color }} /><span className="text-[10px] uppercase tracking-wider text-white/40">{label}</span></div>
      <div className="text-xl font-bold text-white">{value}<span className="text-xs text-white/30 font-normal">{suffix}</span></div>
    </div>
  );
}
function Bar({ label, value, color }) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1"><span className="text-[11px] text-white/50">{label}</span><span className="text-[11px] text-white/40">{value}%</span></div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} /></div>
    </div>
  );
}