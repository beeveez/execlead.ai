import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Award, BookOpen, ArrowRight } from "lucide-react";
import { useAcademy } from "@/hooks/useAcademy";
import { COURSES } from "@/lib/courseCatalog";

export default function LearningProgress() {
  const { getCompletedCount, certificates, getCourseProgress, loading } = useAcademy();

  const inProgress = COURSES
    .map(c => ({ course: c, progress: getCourseProgress(c) }))
    .filter(p => p.progress.completed > 0 && p.progress.percent < 100)
    .slice(0, 3);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Learning Progress</h2>
        <Link to="/academy" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
          View Academy <ArrowRight size={10} />
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Stat icon={BookOpen} value={loading ? "—" : String(getCompletedCount())} label="Lessons" color="text-indigo-400" />
        <Stat icon={Award} value={loading ? "—" : String(certificates.length)} label="Certificates" color="text-emerald-400" />
        <Stat icon={GraduationCap} value={String(COURSES.length)} label="Courses" color="text-amber-400" />
      </div>
      {inProgress.length > 0 && (
        <div className="space-y-2">
          {inProgress.map(({ course, progress }) => (
            <Link key={course.slug} to={`/academy/${course.slug}`} className="flex items-center gap-3 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-lg px-4 py-3 transition-colors">
              <span className="text-lg">{course.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white/80 text-sm font-medium truncate">{course.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden max-w-[120px]">
                    <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${progress.percent}%` }} />
                  </div>
                  <span className="text-xs text-white/30">{progress.percent}%</span>
                </div>
              </div>
              <ArrowRight size={14} className="text-white/20" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, value, label, color }) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 text-center">
      <Icon size={16} className={`mx-auto mb-2 ${color}`} />
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-white/30 text-xs">{label}</div>
    </div>
  );
}