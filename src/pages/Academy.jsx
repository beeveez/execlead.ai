import React, { useMemo, useState } from "react";
import { COURSES, searchAcademy, getRecommendedCourses } from "@/lib/courseCatalog";
import { useAcademy } from "@/hooks/useAcademy";
import { useSubscription } from "@/lib/SubscriptionContext";
import { GraduationCap, Search, Award, BookOpen, Sparkles } from "lucide-react";
import CourseCard from "@/components/academy/CourseCard";

export default function Academy() {
  const { profile } = useSubscription();
  const { getCourseProgress, certificates, getCompletedCount, loading } = useAcademy();
  const [query, setQuery] = useState("");

  const recommended = useMemo(() => getRecommendedCourses(profile?.target_role), [profile?.target_role]);
  const filtered = useMemo(() => query ? searchAcademy(query) : COURSES, [query]);
  const isSearching = query.length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <GraduationCap size={12} className="text-amber-400" /> Executive Academy
        </div>
        <h1 className="text-2xl font-bold text-white">Learning Paths</h1>
        <p className="text-white/40 text-sm mt-1">{COURSES.length} courses · Interactive lessons with AI coaching</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={BookOpen} label="Lessons Completed" value={loading ? "—" : String(getCompletedCount())} color="#6366f1" />
        <StatCard icon={Award} label="Certificates" value={loading ? "—" : String(certificates.length)} color="#10b981" />
        <StatCard icon={GraduationCap} label="Courses" value={String(COURSES.length)} color="#f59e0b" />
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search courses, modules, lessons..." className="w-full bg-white/[0.03] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white/80 focus:outline-none focus:border-amber-500/30 transition-colors" />
      </div>

      {!isSearching && recommended.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3"><Sparkles size={14} className="text-amber-400" /><h2 className="text-sm font-semibold text-white/70">Recommended for {profile?.target_role || "You"}</h2></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommended.slice(0, 3).map(course => <CourseCard key={course.slug} course={course} progress={getCourseProgress(course)} />)}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-white/70 mb-3">{isSearching ? "Search Results" : "All Learning Paths"}</h2>
        {filtered.length === 0 ? (
          <div className="text-center text-white/30 py-12">No courses found for "{query}"</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(course => <CourseCard key={course.slug} course={course} progress={getCourseProgress(course)} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
      <Icon size={16} style={{ color }} className="mb-2" />
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-white/30 text-xs">{label}</div>
    </div>
  );
}