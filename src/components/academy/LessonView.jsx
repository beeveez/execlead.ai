import React from "react";
import ReactMarkdown from "react-markdown";
import { Download, Clock, Target, Lightbulb, BookOpen, Check, Loader2 } from "lucide-react";

function Section({ icon: Icon, title, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2"><Icon size={14} className="text-indigo-400" /><h3 className="text-white/70 font-semibold text-sm">{title}</h3></div>
      {children}
    </div>
  );
}

export default function LessonView({ lesson, content }) {
  if (!content) return <div className="flex items-center justify-center py-20 gap-3 text-white/40"><Loader2 size={20} className="animate-spin" /> Generating lesson...</div>;

  const downloadNotes = () => {
    const text = `EXECLEAD.AI — Lesson Notes\n\nCourse: ${lesson.courseTitle}\nModule: ${lesson.moduleTitle}\nLesson: ${lesson.title}\nDate: ${new Date().toLocaleDateString()}\n\n=== LEARNING OBJECTIVES ===\n${content.objectives?.map((o, i) => `${i + 1}. ${o}`).join("\n") || ""}\n\n=== READING MATERIAL ===\n${content.reading || ""}\n\n=== KEY TAKEAWAYS ===\n${content.keyTakeaways?.map((t, i) => `${i + 1}. ${t}`).join("\n") || ""}\n\n=== CASE STUDY ===\n${content.caseStudy || ""}\n\n=== INTERACTIVE EXAMPLE ===\n${content.interactiveExample || ""}\n\n=== REFLECTION QUESTIONS ===\n${content.reflection?.map((r, i) => `${i + 1}. ${r}`).join("\n") || ""}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${lesson.courseTitle}_${lesson.title}_Notes.txt`.replace(/\s+/g, "_");
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/40 text-xs"><Clock size={14} /> {lesson.duration} min</div>
        <button onClick={downloadNotes} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-indigo-400 transition-colors"><Download size={14} /> Download Notes</button>
      </div>

      {content.objectives && (
        <Section icon={Target} title="Learning Objectives">
          <ul className="space-y-1.5">{content.objectives.map((o, i) => <li key={i} className="text-white/60 text-sm flex items-start gap-2"><span className="text-indigo-400 mt-1">•</span> {o}</li>)}</ul>
        </Section>
      )}

      <Section icon={BookOpen} title="Reading Material">
        <div className="text-white/60 text-sm leading-relaxed prose prose-invert prose-sm max-w-none"><ReactMarkdown>{content.reading}</ReactMarkdown></div>
      </Section>

      {content.keyTakeaways && (
        <Section icon={Lightbulb} title="Key Takeaways">
          <ul className="space-y-1.5">{content.keyTakeaways.map((t, i) => <li key={i} className="text-white/60 text-sm flex items-start gap-2"><Check size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" /> {t}</li>)}</ul>
        </Section>
      )}

      {content.interactiveExample && (
        <Section icon={Lightbulb} title="Interactive Example">
          <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-lg p-4 text-white/60 text-sm leading-relaxed"><ReactMarkdown>{content.interactiveExample}</ReactMarkdown></div>
        </Section>
      )}

      {content.caseStudy && (
        <Section icon={BookOpen} title="Case Study">
          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4 text-white/60 text-sm leading-relaxed"><ReactMarkdown>{content.caseStudy}</ReactMarkdown></div>
        </Section>
      )}
    </div>
  );
}