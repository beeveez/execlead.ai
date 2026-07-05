import React from "react";
import { Link } from "react-router-dom";
import { Clock, BarChart3, ChevronRight } from "lucide-react";

export default function CourseCard({ course, progress }) {
  const percent = progress?.percent || 0;
  const completed = progress?.completed || 0;
  const total = progress?.total || 0;

  return (
    <Link to={`/academy/${course.slug}`} className="group block bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 rounded-xl p-5 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl">{course.icon}</div>
        {percent === 100 && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">COMPLETED</span>}
        {percent > 0 && percent < 100 && <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">{percent}%</span>}
      </div>
      <h3 className="text-white font-semibold mb-1 group-hover:text-indigo-400 transition-colors">{course.title}</h3>
      <p className="text-white/40 text-xs mb-4 line-clamp-2">{course.description}</p>
      <div className="flex items-center gap-3 text-xs text-white/30 mb-3">
        <span className="flex items-center gap-1"><Clock size={12} /> {course.duration}</span>
        <span className="flex items-center gap-1"><BarChart3 size={12} /> {course.difficulty}</span>
        <span>{total} lessons</span>
      </div>
      {percent > 0 && (
        <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-2">
          <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, background: course.color }} />
        </div>
      )}
      <div className="flex items-center justify-between text-xs">
        <span className="text-white/30">{completed}/{total} completed</span>
        <span className="text-indigo-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {percent > 0 ? "Continue" : "Start"} <ChevronRight size={12} />
        </span>
      </div>
    </Link>
  );
}