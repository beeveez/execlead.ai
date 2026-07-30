import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import {
  scoreAnswer as engineScoreAnswer,
  computeLaunchReadiness,
  getAnalytics,
  getAchievements,
  uid,
} from "@/lib/launchDefenseEngine";

/**
 * useLaunchDefense — loads the Question Bank™, Scenario Library™, the user's
 * practice sessions, answer attempts, and Founder Story™. Exposes AI scoring,
 * saving attempts/sessions/story, readiness, analytics, and achievements.
 */
export function useLaunchDefense() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [scenarios, setScenarios] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [story, setStory] = useState(null);

  const load = useCallback(async () => {
    if (!user) return;
    const [q, sc, at, se, st] = await Promise.allSettled([
      base44.entities.LaunchQuestion.list("category", 100),
      base44.entities.InterviewScenario.list("-created_date", 50),
      base44.entities.AnswerAttempt.filter({}, "-created_date", 100),
      base44.entities.PracticeSession.filter({}, "-created_date", 50),
      base44.entities.FounderStory.filter({}, "-created_date", 1),
    ]);
    setQuestions(q.status === "fulfilled" ? q.value : []);
    setScenarios(sc.status === "fulfilled" ? sc.value : []);
    setAttempts(at.status === "fulfilled" ? at.value : []);
    setSessions(se.status === "fulfilled" ? se.value : []);
    setStory(st.status === "fulfilled" && st.value?.[0] ? st.value[0] : null);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const score = useCallback(async (answer, ctx) => {
    setScoring(true);
    try {
      const res = await engineScoreAnswer(answer, ctx);
      return res;
    } finally {
      setScoring(false);
    }
  }, []);

  const saveAttempt = useCallback(async (data) => {
    const record = await base44.entities.AnswerAttempt.create({
      attempt_id: uid("AA"),
      user_id: user.id,
      ...data,
      word_count: (data.answer || "").split(/\s+/).length,
    });
    setAttempts((prev) => [record, ...prev]);
    return record;
  }, [user]);

  const saveSession = useCallback(async (data) => {
    const record = await base44.entities.PracticeSession.create({
      session_id: uid("PS"),
      user_id: user.id,
      completed_at: new Date().toISOString(),
      ...data,
    });
    setSessions((prev) => [record, ...prev]);
    return record;
  }, [user]);

  const saveStory = useCallback(async (data) => {
    let record;
    if (story?.id) {
      record = await base44.entities.FounderStory.update(story.id, data);
    } else {
      record = await base44.entities.FounderStory.create({ story_id: uid("FS"), user_id: user.id, ...data });
    }
    setStory(record);
    return record;
  }, [story, user]);

  const readiness = useMemo(() => computeLaunchReadiness({ attempts, sessions, questionsAnswered: new Set(attempts.map((a) => a.question_id)).size }), [attempts, sessions]);
  const analytics = useMemo(() => getAnalytics(attempts), [attempts]);
  const achievements = useMemo(() => getAchievements({ attempts, sessions, founderStory: story }), [attempts, sessions, story]);

  return {
    loading, scoring,
    questions, scenarios, attempts, sessions, story,
    readiness, analytics, achievements,
    scoreAnswer: score, saveAttempt, saveSession, saveStory, refresh: load,
  };
}