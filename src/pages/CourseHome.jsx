import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCourse, flattenLessons } from "@/lib/courseCatalog";
import { useAcademy } from "@/hooks/useAcademy";
import { useSubscription } from "@/lib/SubscriptionContext";
import { ArrowLeft, Clock, BarChart3, Play, Award, Check, ChevronRight, Target } from "lucide-react";
import Certificate from "@/components/academy/Certificate";
import ExecutiveChallenge from "@/components/academy/ExecutiveChallenge";

export default function CourseHome() {
  const { courseSlug } = useParams();
  const course = getCourse(courseSlug);
  const { profile } = useSubscription();
  const { getCourseProgress, isCompleted, issueCertificate, getCertificate } = useAcademy();
  const [showChallenge, setShowChallenge] = useState(null);

  if (!course) return <div className="text-center text-white/40 py-20">Course not found. <Link to="/academy" className="text-indigo-400">Browse courses</Link></div>;

  const progress = getCourseProgress(course);
  const flat = flattenLessons(course);
  const cert = getCertificate(course.slug);
  const nextIncomplete = flat.find(f => !isCompleted(course.slug, f.module.id, f.lesson.id));
  const continueLesson = nextIncomplete || flat[0];

  const handleClaimCert = async () => {
    await issueCertificate(course, profile?.full_name || profile?.target_role || "Executive Learner");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link to="/academy" className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/70 transition-colors"><ArrowLeft size={14} /> All Courses</Link>

      <div className="relative overflow-hidden rounded-2xl border border-white/10 p-8" style={{ background: `linear-gradient(135deg, ${course.color}15, transparent)` }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: course.color }} />
        <div className="relative flex items-start gap-4">
          <div className="text-5xl">{course.icon}</div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-2">{course.title}</h1>
            <p className="text-white/50 text-sm mb-4 max-w-2xl">{course.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-white/40"><Clock size={14} /> {course.duration}</span>
              <span className="flex items-center gap-1 text-white/40"><BarChart3 size={14} /> {course.difficulty}</span>
              <span className="flex items-center gap-1 text-white/40"><span className="text-base">{course.instructorIcon}</span> {course.instructor}</span>
              <span className="text-white/40">{flat.length} lessons</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div><h3 className="text-white font-semibold text-sm">Your Progress</h3><p className="text-white/40 text-xs">{progress.completed} of {progress.total} lessons completed</p></div>
          <span className="text-2xl font-bold" style={{ color: course.color }}>{progress.percent}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-4"><div className="h-full rounded-full transition-all" style={{ width: `${progress.percent}%`, background: course.color }} /></div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/30">Certificate progress: {progress.percent}%</span>
          {progress.percent === 100 && !cert && <button onClick={handleClaimCert} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"><Award size={14} /> Claim Certificate</button>}
        </div>
      </div>

      {cert && <Certificate certificate={cert} course={course} />}

      <Link to={`/academy/${course.slug}/${continueLesson.module.id}_${continueLesson.lesson.id}`} className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 rounded-xl transition-colors">
        <Play size={16} /> {progress.completed > 0 ? "Continue Learning" : "Start Learning"}
      </Link>

      <div className="space-y-4">
        {course.modules.map((module, mi) => {
          const moduleLessons = flat.filter(f => f.module.id === module.id);
          const moduleCompleted = moduleLessons.filter(f => isCompleted(course.slug, f.module.id, f.lesson.id)).length;
          return (
            <div key={module.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"><span className="text-xs font-mono text-white/30 bg-white/5 px-2 py-0.5 rounded">M{mi + 1}</span><h3 className="text-white font-semibold text-sm">{module.title}</h3></div>
                <span className="text-xs text-white/30">{moduleCompleted}/{moduleLessons.length}</span>
              </div>
              <div className="space-y-1">
                {module.lessons.map(lesson => {
                  const done = isCompleted(course.slug, module.id, lesson.id);
                  return (
                    <Link key={lesson.id} to={`/academy/${course.slug}/${module.id}_${lesson.id}`} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${done ? "bg-emerald-500/20" : "bg-white/5"}`}>{done ? <Check size={12} className="text-emerald-400" /> : <span className="text-[10px] text-white/30">{lesson.duration}m</span>}</div>
                        <span className={`text-sm ${done ? "text-white/40" : "text-white/70 group-hover:text-white"}`}>{lesson.title}</span>
                      </div>
                      <ChevronRight size={14} className="text-white/10 group-hover:text-indigo-400 transition-colors" />
                    </Link>
                  );
                })}
              </div>
              <button onClick={() => setShowChallenge(module.challenge)} className="mt-3 w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 transition-colors text-left">
                <Target size={16} className="text-amber-400" />
                <div className="flex-1"><p className="text-sm text-amber-400/80 font-medium">Executive Challenge</p><p className="text-xs text-white/30">{module.challenge.title}</p></div>
                <ChevronRight size={14} className="text-amber-400/30" />
              </button>
            </div>
          );
        })}
      </div>

      {showChallenge && <ExecutiveChallenge challenge={showChallenge} course={course} onClose={() => setShowChallenge(null)} />}
    </div>
  );
}