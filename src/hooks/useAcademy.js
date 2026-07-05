import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useSubscription } from "@/lib/SubscriptionContext";
import { flattenLessons } from "@/lib/courseCatalog";

export function useAcademy() {
  const { profile } = useSubscription();
  const [progress, setProgress] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    try {
      const [prog, certs] = await Promise.all([
        base44.entities.LessonProgress.list(),
        base44.entities.Certificate.list()
      ]);
      setProgress(prog);
      setCertificates(certs);
    } catch (e) {}
    setLoading(false);
  }, []);

  useEffect(() => {
    if (profile) loadAll();
    else setLoading(false);
  }, [profile, loadAll]);

  const fullId = (courseSlug, moduleId, lessonId) => `${courseSlug}_${moduleId}_${lessonId}`;

  const getProgress = (courseSlug, moduleId, lessonId) =>
    progress.find(p => p.lesson_id === fullId(courseSlug, moduleId, lessonId));

  const isCompleted = (courseSlug, moduleId, lessonId) =>
    progress.some(p => p.lesson_id === fullId(courseSlug, moduleId, lessonId) && p.completed);

  const isBookmarked = (courseSlug, moduleId, lessonId) =>
    progress.some(p => p.lesson_id === fullId(courseSlug, moduleId, lessonId) && p.bookmarked);

  const ensureProgress = async (courseSlug, moduleId, lessonId, lessonTitle, updates) => {
    const id = fullId(courseSlug, moduleId, lessonId);
    const existing = progress.find(p => p.lesson_id === id);
    if (existing) {
      await base44.entities.LessonProgress.update(existing.id, updates);
    } else {
      await base44.entities.LessonProgress.create({
        lesson_id: id, lesson_title: lessonTitle, category: courseSlug,
        course_id: courseSlug, module_id: moduleId, ...updates
      });
    }
    await loadAll();
  };

  const markComplete = (courseSlug, moduleId, lessonId, lessonTitle) =>
    ensureProgress(courseSlug, moduleId, lessonId, lessonTitle, { completed: true });

  const toggleBookmark = async (courseSlug, moduleId, lessonId, lessonTitle) => {
    const current = isBookmarked(courseSlug, moduleId, lessonId);
    await ensureProgress(courseSlug, moduleId, lessonId, lessonTitle, { bookmarked: !current });
  };

  const saveNotes = (courseSlug, moduleId, lessonId, lessonTitle, notes) =>
    ensureProgress(courseSlug, moduleId, lessonId, lessonTitle, { notes });

  const saveQuizScore = (courseSlug, moduleId, lessonId, lessonTitle, score) =>
    ensureProgress(courseSlug, moduleId, lessonId, lessonTitle, { quiz_score: score });

  const issueCertificate = async (course, userName) => {
    const existing = certificates.find(c => c.course_id === course.slug);
    if (existing) return existing;
    const certId = `EXEC-${course.slug.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    const cert = await base44.entities.Certificate.create({
      certificate_id: certId, course_id: course.slug, course_name: course.title,
      user_name: userName, completion_date: new Date().toISOString().split("T")[0],
      verification_url: `https://execlead.ai/verify/${certId}`
    });
    await loadAll();
    return cert;
  };

  const getCertificate = (courseSlug) => certificates.find(c => c.course_id === courseSlug);

  const getCourseProgress = (course) => {
    const flat = flattenLessons(course);
    const completed = flat.filter(f => isCompleted(course.slug, f.module.id, f.lesson.id)).length;
    return { completed, total: flat.length, percent: flat.length ? Math.round((completed / flat.length) * 100) : 0 };
  };

  const getBookmarkedLessons = () => progress.filter(p => p.bookmarked);

  const getCompletedCount = () => progress.filter(p => p.completed).length;

  return {
    loading, progress, certificates,
    getProgress, isCompleted, isBookmarked,
    markComplete, toggleBookmark, saveNotes, saveQuizScore,
    issueCertificate, getCertificate, getCourseProgress,
    getBookmarkedLessons, getCompletedCount, reload: loadAll
  };
}