import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getCourse, findLesson, getAdjacentLessons } from "@/lib/courseCatalog";
import { generateLessonContent } from "@/lib/academyAi";
import { useAcademy } from "@/hooks/useAcademy";
import { useSubscription } from "@/lib/SubscriptionContext";
import { ArrowLeft, Bookmark, BookmarkCheck, NotebookPen, Check, ChevronLeft, ChevronRight, Loader2, Menu } from "lucide-react";
import CourseSidebar from "@/components/academy/CourseSidebar";
import LessonView from "@/components/academy/LessonView";
import Quiz from "@/components/academy/Quiz";
import AICoach from "@/components/academy/AICoach";
import { motion } from "framer-motion";

export default function Lesson() {
  const { courseSlug, lessonId } = useParams();
  const navigate = useNavigate();
  const { profile } = useSubscription();
  const { isCompleted, isBookmarked, toggleBookmark, markComplete, saveNotes, saveQuizScore, getProgress } = useAcademy();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const course = getCourse(courseSlug);
  const found = findLesson(courseSlug, lessonId);
  const adjacent = getAdjacentLessons(course, lessonId);

  useEffect(() => {
    if (!found) return;
    setLoading(true);
    setContent(null);
    generateLessonContent(course, found.module, found.lesson, profile)
      .then(c => { setContent(c); setLoading(false); })
      .catch(() => setLoading(false));
  }, [courseSlug, lessonId]);

  if (!course || !found) return <div className="text-center text-white/40 py-20">Lesson not found. <Link to="/academy" className="text-indigo-400">Browse courses</Link></div>;

  const { lesson, module } = found;
  const { prev, next } = adjacent;
  const done = isCompleted(courseSlug, module.id, lesson.id);
  const bookmarked = isBookmarked(courseSlug, module.id, lesson.id);
  const existingNotes = getProgress(courseSlug, module.id, lesson.id)?.notes || "";

  const handleComplete = () => {
    markComplete(courseSlug, module.id, lesson.id, lesson.title);
    if (next) navigate(`/academy/${courseSlug}/${next.param}`);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex gap-6">
        <div className={`${sidebarOpen ? "block" : "hidden"} lg:block fixed lg:sticky inset-0 lg:inset-auto top-0 z-50 lg:z-auto w-80 lg:w-64 h-full lg:h-auto lg:self-start overflow-y-auto`}>
          <CourseSidebar course={course} currentLessonId={lessonId} onClose={() => setSidebarOpen(false)} notes={existingNotes} onSaveNotes={(notes) => saveNotes(courseSlug, module.id, lesson.id, lesson.title, notes)} />
        </div>

        <div className="flex-1 min-w-0 space-y-6">
          <div className="flex items-center justify-between">
            <Link to={`/academy/${courseSlug}`} className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/70 transition-colors"><ArrowLeft size={14} /> {course.title}</Link>
            <div className="flex items-center gap-2">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-white/40 hover:text-white/70"><Menu size={16} /></button>
              <button onClick={() => toggleBookmark(courseSlug, module.id, lesson.id, lesson.title)} className={`p-2 rounded-lg transition-colors ${bookmarked ? "text-amber-400" : "text-white/30 hover:text-white/60"}`}>{bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}</button>
              <button onClick={() => setShowNotes(!showNotes)} className={`p-2 rounded-lg transition-colors ${showNotes ? "text-indigo-400" : "text-white/30 hover:text-white/60"}`}><NotebookPen size={16} /></button>
            </div>
          </div>

          <div className="text-xs text-white/30 flex items-center gap-1">{module.title} <ChevronRight size={10} /> {lesson.title}</div>
          <h1 className="text-2xl font-bold text-white">{lesson.title}</h1>

          {showNotes && <NotesPanel notes={existingNotes} onSave={(notes) => saveNotes(courseSlug, module.id, lesson.id, lesson.title, notes)} />}

          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-white/40"><Loader2 size={20} className="animate-spin" /> Generating lesson content...</div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <LessonView lesson={{ ...lesson, courseTitle: course.title, moduleTitle: module.title }} content={content} />
              {content?.knowledgeCheck && <Quiz knowledgeCheck={content.knowledgeCheck} onComplete={(score) => saveQuizScore(courseSlug, module.id, lesson.id, lesson.title, score)} />}
              {content?.reflection && <ReflectionSection questions={content.reflection} />}
              <AICoach lesson={{ ...lesson, courseTitle: course.title, moduleTitle: module.title }} />
            </motion.div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-white/5">
            {prev ? <Link to={`/academy/${courseSlug}/${prev.param}`} className="flex items-center gap-1 text-sm text-white/40 hover:text-white/70 transition-colors"><ChevronLeft size={14} /> <span className="line-clamp-1 max-w-[150px]">{prev.lesson.title}</span></Link> : <div />}
            <button onClick={handleComplete} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
              {done && !next ? <Check size={16} /> : null}{next ? "Complete & Next" : "Complete Lesson"}{next && <ChevronRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotesPanel({ notes, onSave }) {
  const [val, setVal] = useState(notes);
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <h3 className="text-sm font-medium text-white/70 mb-2">My Notes</h3>
      <textarea value={val} onChange={e => setVal(e.target.value)} placeholder="Take notes on this lesson..." rows={4} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-indigo-500/50 resize-none" />
      <button onClick={() => onSave(val)} className="mt-2 text-xs text-indigo-400 hover:text-indigo-300">Save Notes</button>
    </div>
  );
}

function ReflectionSection({ questions }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <h3 className="text-white font-semibold text-sm mb-3">Reflection Questions</h3>
      <ul className="space-y-2">{questions.map((q, i) => <li key={i} className="text-white/50 text-sm flex items-start gap-2"><span className="text-indigo-400 mt-1">•</span> {q}</li>)}</ul>
    </div>
  );
}