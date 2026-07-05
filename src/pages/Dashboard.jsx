import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import ScoreCard from "@/components/dashboard/ScoreCard";
import { DAILY_CHALLENGES } from "@/lib/constants";
import {
  Swords, Brain, MessageSquare, GraduationCap, BarChart3, Building2,
  BookOpen, TrendingUp, Flame, Target, Crown, Zap, ArrowRight, Calendar,
  Scale, PenLine, FileText
} from "lucide-react";
import { motion } from "framer-motion";
import { getLevel, checkAchievements, ACHIEVEMENTS } from "@/lib/gamification";

const QUICK_ACTIONS = [
  { path: "/challenge", label: "Challenge", desc: "Test your readiness", icon: Swords, color: "from-indigo-600 to-violet-600" },
  { path: "/simulator", label: "Simulator", desc: "Run a scenario", icon: Brain, color: "from-cyan-600 to-blue-600" },
  { path: "/debate", label: "Debate", desc: "Defend your position", icon: Scale, color: "from-red-600 to-orange-600" },
  { path: "/coach", label: "AI Coach", desc: "Get coached 24/7", icon: MessageSquare, color: "from-emerald-600 to-teal-600" },
  { path: "/academy", label: "Academy", desc: "Daily lessons", icon: GraduationCap, color: "from-amber-600 to-orange-600" },
  { path: "/journal", label: "Journal", desc: "Reflect & track", icon: PenLine, color: "from-pink-600 to-rose-600" },
];

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentResults, setRecentResults] = useState([]);
  const [resumeData, setResumeData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const profiles = await base44.entities.UserProfile.list();
        if (profiles.length > 0) setProfile(profiles[0]);
        const results = await base44.entities.ChallengeResult.list("-created_date", 5);
        setRecentResults(results);
        const resumes = await base44.entities.ResumeVersion.list("-created_date", 1);
        if (resumes.length > 0) {
          try { setResumeData(JSON.parse(resumes[0].extracted_data)); } catch (e) {}
        }
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    window.location.href = "/onboarding";
    return null;
  }

  // Daily challenge based on day of year
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const todaysChallenge = DAILY_CHALLENGES[dayOfYear % DAILY_CHALLENGES.length];

  // Gamification
  const levelInfo = getLevel(profile.xp_points || 0);
  const unlockedAchievements = checkAchievements(profile);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Crown size={12} className="text-indigo-400" />
          Executive Dashboard
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
          {profile.full_name ? `Welcome back, ${profile.full_name.split(" ")[0]}` : "Welcome back"}
        </h1>
        <p className="text-white/40 text-sm">
          Targeting <span className="text-indigo-400 font-medium">{profile.target_role}</span> at{" "}
          <span className="text-white/70 font-medium">{profile.target_company}</span>
        </p>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <Flame size={18} className="text-orange-400" />
          <span className="text-white font-bold">{profile.streak_days || 0}</span>
          <span className="text-white/30 text-sm">day streak</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-yellow-400" />
          <span className="text-white font-bold">{profile.challenges_completed || 0}</span>
          <span className="text-white/30 text-sm">challenges</span>
        </div>
        <div className="flex items-center gap-2">
          <Target size={18} className="text-emerald-400" />
          <span className="text-white font-bold">{profile.sessions_completed || 0}</span>
          <span className="text-white/30 text-sm">sessions</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-cyan-400" />
          <span className="text-white font-bold">{profile.promotion_readiness || 0}%</span>
          <span className="text-white/30 text-sm">promotion ready</span>
        </div>
      </div>

      {/* XP & Level Progress */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-violet-500/5 border border-indigo-500/10 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{levelInfo.current.icon}</span>
            <div>
              <div className="text-white font-semibold text-sm">Level {levelInfo.current.level} · {levelInfo.current.title}</div>
              <div className="text-white/40 text-xs">{profile.xp_points || 0} XP{unlockedAchievements.length > 0 && ` · ${unlockedAchievements.length} achievements`}</div>
            </div>
          </div>
          {levelInfo.next && (
            <div className="text-right">
              <div className="text-white/40 text-xs">{levelInfo.next.title}</div>
              <div className="text-white/30 text-xs">{levelInfo.next.xp - (profile.xp_points || 0)} XP to go</div>
            </div>
          )}
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700" style={{ width: `${levelInfo.progress}%` }} />
        </div>
      </div>

      {/* Resume Intelligence */}
      {resumeData && (
        <Link to="/resume" className="group block bg-gradient-to-br from-violet-500/10 to-indigo-500/5 border border-violet-500/10 rounded-xl p-5 hover:border-violet-500/20 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-violet-400 text-xs font-medium uppercase tracking-wider">
              <FileText size={14} /> Resume Intelligence
            </div>
            <span className="text-2xl font-bold text-white">{resumeData.resume_health_score || Math.round(((resumeData.executive_readiness_score || 0) + (resumeData.leadership_maturity || 0) + (resumeData.commercial_maturity || 0)) / 3)}<span className="text-sm text-white/30">/100</span></span>
          </div>
          <p className="text-white/60 text-sm">Resume Health Score</p>
          {resumeData.skill_gaps?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {resumeData.skill_gaps.slice(0, 3).map((g, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-red-500/10 text-red-400">{typeof g === "string" ? g : g.gap}</span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-1 text-violet-400 text-xs mt-3 group-hover:gap-2 transition-all">
            View Full Analysis <ArrowRight size={12} />
          </div>
        </Link>
      )}

      {/* Today's Challenge + Daily Lesson */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/challenge" className="group bg-gradient-to-br from-indigo-500/10 to-violet-500/5 border border-indigo-500/10 rounded-xl p-5 hover:border-indigo-500/20 transition-all">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-medium uppercase tracking-wider mb-3">
            <Calendar size={14} /> Today's Challenge
          </div>
          <p className="text-white font-medium text-sm leading-relaxed mb-3">{todaysChallenge}</p>
          <div className="flex items-center gap-1 text-indigo-400 text-xs group-hover:gap-2 transition-all">
            Take Challenge <ArrowRight size={12} />
          </div>
        </Link>
        <Link to="/academy" className="group bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/10 rounded-xl p-5 hover:border-amber-500/20 transition-all">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-medium uppercase tracking-wider mb-3">
            <GraduationCap size={14} /> Daily Leadership Lesson
          </div>
          <p className="text-white font-medium text-sm leading-relaxed mb-3">Continue your executive learning journey with today's lesson.</p>
          <div className="flex items-center gap-1 text-amber-400 text-xs group-hover:gap-2 transition-all">
            Start Learning <ArrowRight size={12} />
          </div>
        </Link>
      </div>

      {/* Score Cards */}
      <div>
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Executive Scores</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <ScoreCard label="Interview" value={profile.interview_readiness || 0} icon={Target} color="indigo" />
          <ScoreCard label="Leadership" value={profile.leadership_maturity || 0} icon={Crown} color="purple" />
          <ScoreCard label="Commercial" value={profile.commercial_maturity || 0} icon={TrendingUp} color="cyan" />
          <ScoreCard label="Communication" value={profile.communication_growth || 0} icon={MessageSquare} color="amber" />
          <ScoreCard label="Presence" value={profile.executive_presence || 0} icon={Zap} color="emerald" />
          <ScoreCard label="Confidence" value={profile.confidence || 0} icon={Flame} color="pink" />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_ACTIONS.map((action, i) => (
            <motion.div key={action.path} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={action.path} className="block group bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all duration-300">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3`}>
                  <action.icon size={16} className="text-white" />
                </div>
                <h3 className="text-white font-semibold text-sm mb-0.5 group-hover:text-indigo-400 transition-colors">{action.label}</h3>
                <p className="text-white/30 text-xs">{action.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent + Analytics Link */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Recent Challenges</h2>
            <Link to="/analytics" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View Analytics <ArrowRight size={10} />
            </Link>
          </div>
          <div className="space-y-2">
            {recentResults.length === 0 ? (
              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-6 text-center">
                <p className="text-white/30 text-sm">No challenges yet. Take your first challenge!</p>
              </div>
            ) : (
              recentResults.map((r) => {
                const avg = Math.round(((r.executive_score || 0) + (r.leadership_score || 0) + (r.commercial_score || 0) + (r.communication_score || 0)) / 4);
                return (
                  <div key={r.id} className="flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-lg px-4 py-3">
                    <div className={`text-xs font-bold w-10 h-10 rounded-lg flex items-center justify-center ${avg >= 70 ? "bg-emerald-500/10 text-emerald-400" : avg >= 40 ? "bg-amber-500/10 text-amber-400" : "bg-red-500/10 text-red-400"}`}>{avg}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 text-sm truncate">{r.question}</p>
                      <p className="text-white/30 text-xs">{r.category}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Continue Learning</h2>
          <div className="space-y-2">
            <Link to="/career" className="flex items-center gap-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-lg px-4 py-3 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center"><BookOpen size={16} className="text-blue-400" /></div>
              <div className="flex-1"><p className="text-white/80 text-sm font-medium">Career Advisor</p><p className="text-white/30 text-xs">Review your promotion roadmap</p></div>
              <ArrowRight size={14} className="text-white/20" />
            </Link>
            <Link to="/companies" className="flex items-center gap-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-lg px-4 py-3 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center"><Building2 size={16} className="text-violet-400" /></div>
              <div className="flex-1"><p className="text-white/80 text-sm font-medium">Company Intelligence</p><p className="text-white/30 text-xs">Research {profile.target_company}</p></div>
              <ArrowRight size={14} className="text-white/20" />
            </Link>
            <Link to="/analytics" className="flex items-center gap-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-lg px-4 py-3 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><BarChart3 size={16} className="text-emerald-400" /></div>
              <div className="flex-1"><p className="text-white/80 text-sm font-medium">Leadership Analytics</p><p className="text-white/30 text-xs">Track your executive growth</p></div>
              <ArrowRight size={14} className="text-white/20" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}