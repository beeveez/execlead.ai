import { base44 } from "@/api/base44Client";
import { getCachedCompanyContext } from "@/lib/companyContext";

const withCompany = (p) => {
  const c = getCachedCompanyContext();
  return c ? c + "\n\n" + p : p;
};

const LESSON_SCHEMA = {
  type: "object",
  properties: {
    objectives: { type: "array", items: { type: "string" } },
    reading: { type: "string" },
    keyTakeaways: { type: "array", items: { type: "string" } },
    caseStudy: { type: "string" },
    interactiveExample: { type: "string" },
    knowledgeCheck: {
      type: "object",
      properties: {
        question: { type: "string" },
        options: { type: "array", items: { type: "string" } },
        answerIndex: { type: "number" },
        explanation: { type: "string" },
        guidance: { type: "string" }
      }
    },
    reflection: { type: "array", items: { type: "string" } }
  }
};

export async function generateLessonContent(course, module, lesson, profile) {
  const isEssay = lesson.quizType === "essay" || lesson.quizType === "reflection";
  const prompt = `You are an executive leadership educator creating content for the EXECLEAD.AI platform.

Course: ${course.title}
Module: ${module.title}
Lesson: ${lesson.title}
Quiz Type: ${lesson.quizType}
Target Role: ${profile?.target_role || "Senior Manager"}
Target Company: ${profile?.target_company || "a major IT company"}

Create comprehensive lesson content:
1. 3-4 learning objectives (actionable, specific)
2. Reading material (300-400 words, executive-level, practical, with real-world examples relevant to the target role)
3. 3-4 key takeaways
4. A real-world case study (2-3 paragraphs, specific and practical)
5. An interactive example or exercise
6. A knowledge check question
7. 2-3 reflection questions for self-assessment

${isEssay
    ? "For the knowledge check, do NOT include options or answerIndex. Include a 'guidance' field describing what a strong answer covers."
    : "For the knowledge check, include 'options' (exactly 4 options), 'answerIndex' (0-3), and 'explanation'."}

Return as structured JSON.`;

  return await base44.integrations.Core.InvokeLLM({
    prompt: withCompany(prompt),
    response_json_schema: LESSON_SCHEMA
  });
}

export async function askCoach(lesson, question, profile) {
  const prompt = `You are an Executive Coach on the EXECLEAD.AI platform, mentoring a professional targeting "${profile?.target_role || "Senior Manager"}" at "${profile?.target_company || "a major IT company"}".

Lesson context:
- Course: ${lesson.courseTitle}
- Module: ${lesson.moduleTitle}
- Lesson: ${lesson.title}

The user asks: "${question}"

Respond as an executive coach — insightful, practical, with real-world examples. Keep your response under 200 words. Use markdown for formatting.`;

  return await base44.integrations.Core.InvokeLLM({ prompt: withCompany(prompt) });
}

export async function evaluateEssay(question, response, guidance, profile) {
  const prompt = `You are an Executive Coach evaluating a learner's response.

Question: ${question}
Expected guidance: ${guidance || "A thoughtful, executive-level response with practical examples."}
Target role context: ${profile?.target_role || "Senior Manager"}

Learner's response:
"${response}"

Provide constructive feedback:
- What they did well
- What could be improved
- A suggested rewrite or key points to add

Keep under 200 words. Use markdown.`;

  return await base44.integrations.Core.InvokeLLM({ prompt: withCompany(prompt) });
}

export async function evaluateChallenge(challenge, response, profile) {
  const prompt = `You are an Executive Coach evaluating a learner's response to an executive challenge.

Challenge: ${challenge.title}
Scenario: ${challenge.description}
Target role: ${profile?.target_role || "Senior Manager"} at ${profile?.target_company || "a major IT company"}

Learner's response:
"${response}"

Evaluate the response as an executive would:
- Strengths (what they handled well)
- Areas for improvement
- How an experienced executive would approach this

Keep under 250 words. Use markdown.`;

  return await base44.integrations.Core.InvokeLLM({ prompt: withCompany(prompt) });
}