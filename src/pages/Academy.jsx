import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { LESSON_CATEGORIES } from "@/lib/constants";
import { GraduationCap, Loader2, ChevronRight, BookOpen, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

export default function Academy() {
  const [profile, setProfile] = useState(null);
  const [category, setCategory] = useState("");
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [completedLessons, setCompletedLessons] = useState([]);

  useEffect(() => {
    const load = async () => {
      const profiles = await base44.entities.UserProfile.list();
      if (profiles.length > 0) setProfile(profiles[0]);
      const progress = await base44.entities.LessonProgress.filter({ completed: true });
      setCompletedLessons(progress.map(l => l.lesson_id));
    };
    load();
  }, []);

  const generateLesson = async (cat) => {
    setCategory(cat);
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a concise executive leadership lesson on "${cat}" for someone targeting "${profile?.target_role || 'Senior Manager'}" at "${profile?.target_company || 'a major IT services company'}".

Structure:
1. **Lesson Title** - Give it a compelling name
2. **Executive Insight** - One powerful insight (2-3 sentences)
3. **Key Concepts** - 3-4 key concepts with brief explanations
4. **Real-World Application** - A practical scenario
5. **Executive Exercise** - One actionable exercise they can do today
6. **Pro Tip** - One insider tip from the executive world

Keep it focused, practical, and executive-level. No fluff. Under 500 words total.`,
      });

      const lessonId = `${cat}_${Date.now()}`;
      setLesson({ id: lessonId, content: res, category: cat });

      await base44.entities.LessonProgress.create({
        lesson_id: lessonId,
        lesson_title: cat + " - Daily Lesson",
        category: cat,
        completed: true,
      });
      setCompletedLessons(prev => [...prev, lessonId]);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <GraduationCap size={12} className="text-amber-400" />
          Leadership Academy
        </div>
        <h1 className="text-2xl font-bold text-white">Daily Executive Lessons</h1>
        <p className="text-white/40 text-sm mt-1">
          {completedLessons.length} lessons completed
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!lesson ? (
          <motion.div key="categories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {LESSON_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => generateLesson(cat)}
                  disabled={loading}
                  className="group flex items-center justify-between px-4 py-4 bg-white/[0.03] hover:bg-amber-500/5 border border-white/5 hover:border-amber-500/15 rounded-xl text-left transition-all"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen size={18} className="text-white/20 group-hover:text-amber-400 transition-colors" />
                    <span className="text-sm text-white/50 group-hover:text-white/80 font-medium transition-colors">{cat}</span>
                  </div>
                  <ChevronRight size={14} className="text-white/10 group-hover:text-amber-400/50 transition-colors" />
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="lesson" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {loading ? (
              <div className="flex items-center justify-center py-20 gap-3 text-white/40">
                <Loader2 size={20} className="animate-spin" />
                Generating your lesson...
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
                  <div className="text-xs text-amber-400 font-medium uppercase tracking-wider mb-4">{category}</div>
                  <div className="text-white/80 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>{lesson.content}</ReactMarkdown>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 text-sm">
                    <Check size={16} />
                    Lesson completed
                  </div>
                  <button
                    onClick={() => setLesson(null)}
                    className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-sm font-medium transition-colors"
                  >
                    Choose Another Topic
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}