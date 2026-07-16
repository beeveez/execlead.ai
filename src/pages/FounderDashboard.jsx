import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSubscription } from "@/lib/SubscriptionContext";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import {
  TrendingUp, Target, Zap, Brain, MessageSquare, FileText,
  Lock, Rocket, ChevronRight, Award, Gift, Users, Sparkles, ArrowRight, Loader2, CheckCircle2
} from "lucide-react";

// Progressive module unlocking — weeks since profile creation
const MODULE_SCHEDULE = [
  { week: 1, label: "Week 1", modules: [
    { path: "/resume", label: "Resume AI", desc: "AI-powered resume analysis", icon: FileText },
    { path: "/career", label: "Career Intelligence™", desc: "Target role & company insights", icon: Target },
    { path: "/coach", label: "Executive Coach™", desc: "24/7 AI coaching", icon: MessageSquare },
  ]},
  { week: 2, label: "Week 2", modules: [
    { path: "/leadership-dna", label: "Leadership DNA™", desc: "Your leadership archetype", icon: Brain },
    { path: "/simulator", label: "Executive Simulator™", desc: "Run real scenarios", icon: Zap },
    { path: "/debate", label: "Executive Debate™", desc: "Defend your positions", icon: TrendingUp },
  ]},
  { week: 3, label: "Week 3", modules: [
    { path: "/decision-intelligence", label: "Decision Intelligence™", desc: "AI-powered decisions", icon: Brain },
    { path: "/council", label: "Executive Council™", desc: "Multi-persona debate", icon: Users },
    { path: "/executive-briefing", label: "Executive Briefing™", desc: "Weekly executive summary", icon: FileText },
  ]},
];

function getWeeksSince(createdDate) {
  if (!createdDate) return 1;
  const diff = Date.now() - new Date(createdDate).getTime();
  return Math.max(1, Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1);
}

export default function FounderDashboard() {
  const { profile, loading } = useSubscription();
  const { user } = useAuth();
  const [foundingMember, setFoundingMember] = useState(null);
  const [referralUrl, setReferralUrl] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (user?.id) {
      base44.entities.FoundingMember.filter({ user_id: user.id })
        .then(fm => { if (fm[0]) setFoundingMember(fm[0]); })
        .catch(() => {});
      setReferralUrl(`${window.location.origin}/?ref=${user.id}`);
    }
  }, [user?.id]);

  useEffect(() => {
    // Show feedback modal after first session (if not already submitted)
    if (profile?.id && !sessionStorage.getItem("beta_feedback_shown")) {
      const timer = setTimeout(() => {
        setShowFeedback(true);
        sessionStorage.setItem("beta_feedback_shown", "1");
      }, 30000); // 30 seconds
      return () => clearTimeout(timer);
    }
  }, [profile?.id]);

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
      </div>
    );
  }

  const weeksSince = getWeeksSince(profile.created_date);
  const unlockedWeeks = MODULE_SCHEDULE.filter(s => s.week <= weeksSince);
  const lockedWeeks = MODULE_SCHEDULE.filter(s => s.week > weeksSince);

  const scores = [
    { label: "Executive Readiness", value: profile.interview_readiness || 0, color: "#6366f1", icon: Brain },
    { label: "Promotion Readiness", value: profile.promotion_readiness || 0, color: "#10b981", icon: TrendingUp },
    { label: "Leadership DNA", value: profile.leadership_maturity || 0, color: "#a855f7", icon: Target },
    { label: "Executive Presence", value: profile.executive_presence || 0, color: "#f59e0b", icon: Zap },
    { label: "Communication", value: profile.communication_growth || 0, color: "#ec4899", icon: MessageSquare },
    { label: "Commercial Thinking", value: profile.commercial_maturity || 0, color: "#06b6d4", icon: TrendingUp },
  ];

  const topStrengths = (profile.strong_areas || []).slice(0, 5);
  const topGaps = (profile.weak_areas || []).slice(0, 5);

  const nextActions = [
    { label: "Top Certifications", desc: "Industry-relevant credentials", path: "/academy", icon: Award, available: weeksSince >= 1 },
    { label: "Learning Roadmap", desc: "Personalized growth path", path: "/resume", icon: FileText, available: weeksSince >= 1 },
    { label: "Executive Coach Session", desc: "1:1 AI coaching", path: "/coach", icon: MessageSquare, available: weeksSince >= 1 },
    { label: "Leadership Simulation", desc: "Practice real scenarios", path: "/simulator", icon: Brain, available: weeksSince >= 2 },
    { label: "Resume Improvements", desc: "AI-powered suggestions", path: "/resume", icon: FileText, available: weeksSince >= 1 },
    { label: "Promotion Forecast", desc: "Your promotion timeline", path: "/promotion-forecast", icon: TrendingUp, available: weeksSince >= 3 },
  ];

  return (
    <div className="space-y-6">
      {/* Founding Member Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Award size={24} className="text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white">Founder Dashboard</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/15 text-amber-400 font-medium uppercase tracking-wide">Founding Member</span>
              </div>
              <p className="text-white/40 text-sm">One Leadership Journey. One AI Platform.</p>
            </div>
          </div>
          {foundingMember && (
            <div className="flex items-center gap-4 text-xs text-white/40">
              <div>Member #<span className="text-amber-400 font-medium">{foundingMember.founder_number || "—"}</span></div>
              <div>Joined <span className="text-white/60">{new Date(foundingMember.joined_date || profile.created_date).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</span></div>
            </div>
          )}
        </div>
      </div>

      {/* The "Wow" Question: "Am I ready to become an executive?" */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {scores.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center"
          >
            <s.icon size={16} className="mx-auto mb-2" style={{ color: s.color }} />
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-white/30 text-[10px] mt-1 leading-tight">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Today's Mission + Next Best Action */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-indigo-500/10 to-white/[0.02] border border-indigo-500/10 rounded-xl p-5">
          <div className="flex items-center gap-2 text-indigo-400 text-xs uppercase tracking-wider mb-3">
            <Zap size={14} /> Today's Executive Mission
          </div>
          <h3 className="text-white font-medium text-sm mb-2">
            {profile.target_role ? `Prepare for your next ${profile.target_role} role` : "Build your Executive Identity"}
          </h3>
          <p className="text-white/40 text-xs mb-4">
            {topGaps.length > 0
              ? `Focus on closing your top gap: ${topGaps[0]}`
              : "Upload your resume to unlock personalized missions"}
          </p>
          <Link to="/coach" className="inline-flex items-center gap-1.5 text-indigo-400 text-xs font-medium hover:text-indigo-300 transition-colors">
            Start Session <ArrowRight size={12} />
          </Link>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-wider mb-3">
            <Target size={14} /> Next Best Action™
          </div>
          <h3 className="text-white font-medium text-sm mb-2">
            {topStrengths.length > 0 ? `Leverage your strength: ${topStrengths[0]}` : "Complete your profile"}
          </h3>
          <p className="text-white/40 text-xs mb-4">
            {profile.target_company
              ? `Targeting ${profile.target_role || "executive role"} at ${profile.target_company}`
              : "Set your target company and role in Career Intelligence™"}
          </p>
          <Link to="/career" className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-medium hover:text-amber-300 transition-colors">
            View Career Intelligence™ <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Strengths & Gaps */}
      {(topStrengths.length > 0 || topGaps.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topStrengths.length > 0 && (
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-5">
              <h3 className="text-emerald-400 text-xs font-medium uppercase tracking-wider mb-3">Top 5 Strengths</h3>
              <div className="space-y-2">
                {topStrengths.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-white/70">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-[10px] text-emerald-400">{i + 1}</span>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          )}
          {topGaps.length > 0 && (
            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-5">
              <h3 className="text-red-400 text-xs font-medium uppercase tracking-wider mb-3">Top 5 Gaps</h3>
              <div className="space-y-2">
                {topGaps.map((g, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-white/70">
                    <span className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center text-[10px] text-red-400">{i + 1}</span>
                    {g}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Next Best Actions */}
      <div>
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Next Best Actions™</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {nextActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                {action.available ? (
                  <Link to={action.path} className="block group bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-amber-500/20 rounded-xl p-4 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                        <Icon size={14} className="text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-sm group-hover:text-amber-400 transition-colors">{action.label}</h3>
                        <p className="text-white/30 text-xs mt-0.5">{action.desc}</p>
                      </div>
                      <ChevronRight size={14} className="text-white/20 group-hover:text-amber-400 transition-colors flex-shrink-0 mt-1" />
                    </div>
                  </Link>
                ) : (
                  <div className="block bg-white/[0.01] border border-white/5 rounded-xl p-4 opacity-50">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                        <Lock size={14} className="text-white/30" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white/50 font-medium text-sm">{action.label}</h3>
                        <p className="text-white/20 text-xs mt-0.5">Unlocks in Week {action.available === false ? Math.ceil((i + 1) / 2) : 1}</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Progressive Module Unlocking */}
      <div>
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider mb-4">Your EXEC™ Modules</h2>
        <div className="space-y-6">
          {unlockedWeeks.map(schedule => (
            <div key={schedule.week}>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 text-emerald-400 font-medium uppercase tracking-wide">Unlocked</span>
                <span className="text-white/40 text-xs">{schedule.label}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {schedule.modules.map(mod => (
                  <Link key={mod.path} to={mod.path} className="block group bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-indigo-500/20 rounded-xl p-4 transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                        <mod.icon size={14} className="text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-sm group-hover:text-indigo-400 transition-colors">{mod.label}</h3>
                        <p className="text-white/30 text-xs mt-0.5">{mod.desc}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {lockedWeeks.map(schedule => (
            <div key={schedule.week}>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 text-white/30 font-medium uppercase tracking-wide flex items-center gap-1">
                  <Lock size={8} /> Locked
                </span>
                <span className="text-white/30 text-xs">{schedule.label}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {schedule.modules.map(mod => (
                  <div key={mod.path} className="block bg-white/[0.01] border border-white/5 rounded-xl p-4 opacity-40">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                        <Lock size={14} className="text-white/30" />
                      </div>
                      <div>
                        <h3 className="text-white/50 font-medium text-sm">{mod.label}</h3>
                        <p className="text-white/20 text-xs mt-0.5">{mod.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Founding Member Experience: Referral */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-transparent border border-indigo-500/10 rounded-xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Gift size={18} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="text-white font-medium text-sm">Invite another executive</h3>
              <p className="text-white/40 text-xs">Share your referral link and earn rewards</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input readOnly value={referralUrl} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/60 w-64" onClick={e => e.target.select()} />
            <button
              onClick={() => { navigator.clipboard?.writeText(referralUrl); }}
              className="px-3 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Trigger */}
      <div className="text-center py-4">
        <button onClick={() => setShowFeedback(true)} className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 text-xs transition-colors">
          <Sparkles size={12} /> Share your beta feedback
        </button>
      </div>

      {showFeedback && <BetaFeedbackModal onClose={() => setShowFeedback(false)} />}
    </div>
  );
}

// Inline feedback modal (kept in same file to avoid extra component)
function BetaFeedbackModal({ onClose }) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    assessment_value_rating: 0,
    what_surprised_you: "",
    what_confused_you: "",
    would_recommend: "",
    what_should_improve: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await base44.entities.BetaFeedback.create({
        user_id: user?.id,
        user_name: user?.full_name,
        user_email: user?.email,
        assessment_value_rating: Number(form.assessment_value_rating) || 0,
        what_surprised_you: form.what_surprised_you,
        what_confused_you: form.what_confused_you,
        would_recommend: form.would_recommend ? Number(form.would_recommend) : null,
        what_should_improve: form.what_should_improve,
        submitted_at: new Date().toISOString(),
        session_context: "founder_dashboard",
      });
      setSubmitted(true);
    } catch {}
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
        <div className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-md w-full p-8 text-center" onClick={e => e.stopPropagation()}>
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={24} className="text-emerald-400" />
          </div>
          <h3 className="text-white font-medium text-sm mb-2">Thank you!</h3>
          <p className="text-white/40 text-xs mb-4">Your feedback helps shape the future of EXECLEAD.AI.</p>
          <button onClick={onClose} className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-sm transition-colors">Close</button>
        </div>
      </div>
    );
  }

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-amber-500/30";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-white font-medium text-sm">Beta Feedback</h2>
          <p className="text-white/40 text-xs mt-0.5">Help us improve EXECLEAD.AI</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-white/60 text-xs font-medium block mb-2">How valuable was your assessment? (1-5)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setForm(f => ({ ...f, assessment_value_rating: n }))}
                  className={`w-10 h-10 rounded-lg border text-sm font-medium transition-colors ${form.assessment_value_rating === n ? "bg-amber-500/20 border-amber-500/40 text-amber-400" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-white/60 text-xs font-medium block mb-1.5">What surprised you?</label>
            <textarea value={form.what_surprised_you} onChange={e => setForm(f => ({ ...f, what_surprised_you: e.target.value }))} rows={2} className={inputClass} placeholder="..." />
          </div>
          <div>
            <label className="text-white/60 text-xs font-medium block mb-1.5">What confused you?</label>
            <textarea value={form.what_confused_you} onChange={e => setForm(f => ({ ...f, what_confused_you: e.target.value }))} rows={2} className={inputClass} placeholder="..." />
          </div>
          <div>
            <label className="text-white/60 text-xs font-medium block mb-1.5">Would you recommend EXECLEAD.AI? (0-10)</label>
            <input type="number" min="0" max="10" value={form.would_recommend} onChange={e => setForm(f => ({ ...f, would_recommend: e.target.value }))} className={inputClass} placeholder="10" />
          </div>
          <div>
            <label className="text-white/60 text-xs font-medium block mb-1.5">What should EXEC™ improve?</label>
            <textarea value={form.what_should_improve} onChange={e => setForm(f => ({ ...f, what_should_improve: e.target.value }))} rows={2} className={inputClass} placeholder="..." />
          </div>
          <button type="submit" disabled={submitting} className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
            {submitting && <Loader2 size={14} className="animate-spin" />} Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
}