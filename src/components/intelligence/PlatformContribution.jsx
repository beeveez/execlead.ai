import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Users, FileText, MessageSquare, Heart, UserPlus, TrendingUp } from "lucide-react";

/**
 * PlatformContribution — two-column card showing Learning Intelligence
 * (completed paths, courses, velocity, certificates) and Leadership Impact
 * (letters, discussions, mentorship, knowledge shared, followers, influence).
 */
export default function PlatformContribution({ learning, impact }) {
  const lessons = learning || [];
  const completed = lessons.filter((l) => l.completed).length;
  const inProgress = lessons.length - completed;
  const certificates = lessons.filter((l) => l.certificate_issued).length;

  const letters = impact?.letters || 0;
  const discussions = impact?.discussions || 0;
  const mentorships = impact?.mentorships || 0;
  const followers = impact?.followers || 0;
  const influence = impact?.influence || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Learning Intelligence */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen size={16} className="text-indigo-400" />
          <h3 className="text-white font-semibold text-sm">Learning Intelligence</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Stat value={completed} label="Completed" icon={BookOpen} color="text-indigo-400" />
          <Stat value={inProgress} label="In Progress" icon={TrendingUp} color="text-cyan-400" />
          <Stat value={certificates} label="Certificates" icon={FileText} color="text-amber-400" />
          <Stat value={Math.round(completed * 1.5)} label="Learning Velocity" icon={TrendingUp} color="text-emerald-400" />
        </div>
        <Link to="/academy" className="block mt-3 text-xs text-indigo-400 hover:text-indigo-300 text-center">View Academy →</Link>
      </div>

      {/* Leadership Impact */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users size={16} className="text-purple-400" />
          <h3 className="text-white font-semibold text-sm">Leadership Impact</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Stat value={letters} label="Letters Published" icon={FileText} color="text-purple-400" />
          <Stat value={discussions} label="Discussions" icon={MessageSquare} color="text-cyan-400" />
          <Stat value={mentorships} label="Mentorship Sessions" icon={Heart} color="text-emerald-400" />
          <Stat value={followers} label="Followers" icon={UserPlus} color="text-amber-400" />
        </div>
        {influence > 0 && (
          <div className="mt-3 bg-purple-500/5 border border-purple-500/10 rounded-lg px-3 py-2 text-center">
            <span className="text-purple-400 font-bold text-sm">{influence}%</span>
            <span className="text-white/30 text-[10px] ml-1">Leadership Influence</span>
          </div>
        )}
        <Link to="/legacy-library" className="block mt-2 text-xs text-purple-400 hover:text-purple-300 text-center">View Legacy →</Link>
      </div>
    </div>
  );
}

function Stat({ value, label, icon: Icon, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center">
      <Icon size={14} className={`mx-auto mb-1 ${color}`} />
      <div className="text-white font-bold text-sm">{value}</div>
      <div className="text-white/30 text-[10px]">{label}</div>
    </div>
  );
}