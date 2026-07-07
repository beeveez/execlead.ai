import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Loader2, FileText, Brain, HelpCircle, MessageSquare, Mic,
  ClipboardList, StickyNote, Presentation, BookOpen, GraduationCap, Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

const TOOLS = [
  { id: "summarize", label: "Summarize", icon: FileText, prompt: (i) => `Provide a concise executive summary of "${i.title}" — a ${i.type.replace(/_/g, " ")}${i.category ? ` in ${i.category}` : ""}. Description: ${i.description || "N/A"}. Focus on the 3-5 key takeaways an executive needs.` },
  { id: "explain", label: "Explain", icon: Brain, prompt: (i) => `Explain the core concepts of "${i.title}"${i.category ? ` (${i.category})` : ""} in clear, practical terms for an executive audience. Description: ${i.description || "N/A"}.` },
  { id: "quiz", label: "Quiz Me", icon: HelpCircle, prompt: (i) => `Create a 5-question multiple-choice quiz to test understanding of "${i.title}"${i.category ? ` (${i.category})` : ""}. Include the correct answer and a brief explanation after each question. Description: ${i.description || "N/A"}.` },
  { id: "coach", label: "Coach Me", icon: MessageSquare, prompt: (i) => `Act as an elite executive coach. Based on "${i.title}"${i.category ? ` (${i.category})` : ""}, give me actionable coaching guidance, reflection prompts, and a challenge to apply this week. Description: ${i.description || "N/A"}.` },
  { id: "interview", label: "Practice Interview", icon: Mic, prompt: (i) => `Generate 5 executive-level interview questions related to "${i.title}"${i.category ? ` (${i.category})` : ""}. For each, provide a model answer and a tip for delivering it with executive presence. Description: ${i.description || "N/A"}.` },
  { id: "action_plan", label: "Action Plan", icon: ClipboardList, prompt: (i) => `Create a structured 30-60-90 day executive action plan based on "${i.title}"${i.category ? ` (${i.category})` : ""}. Description: ${i.description || "N/A"}.` },
  { id: "notes", label: "Executive Notes", icon: StickyNote, prompt: (i) => `Generate executive briefing notes for "${i.title}"${i.category ? ` (${i.category})` : ""}. Use bullet points covering key insights, risks, and opportunities. Description: ${i.description || "N/A"}.` },
  { id: "presentation", label: "Generate Presentation", icon: Presentation, prompt: (i) => `Create a slide-by-slide outline for a 10-slide executive presentation based on "${i.title}"${i.category ? ` (${i.category})` : ""}. For each slide, give a title and 2-3 bullet points. Description: ${i.description || "N/A"}.` },
];

export default function AIContentTools({ item }) {
  const [activeTool, setActiveTool] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [saveStatus, setSaveStatus] = useState(null);

  const runTool = async (tool) => {
    setActiveTool(tool.id);
    setLoading(true);
    setResult("");
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: tool.prompt(item),
      });
      setResult(typeof res === "string" ? res : JSON.stringify(res));
    } catch (e) {
      setResult("Sorry, the AI tool encountered an error. Please try again.");
    }
    setLoading(false);
  };

  const exportToJournal = async () => {
    setSaveStatus("journal");
    try {
      await base44.entities.JournalEntry.create({
        title: `Marketplace: ${item.title}`,
        content: `${item.description || ""}\n\nCategory: ${item.category || "N/A"}\nType: ${item.type}`,
        entry_type: "learning",
        mood: "inspired",
      });
      setSaveStatus("journal_done");
    } catch (e) {
      setSaveStatus("journal_error");
    }
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const addToLearningPlan = async () => {
    setSaveStatus("plan");
    try {
      await base44.entities.LearningAssignment.create({
        title: item.title,
        learning_path: item.category || "Executive Development",
        due_date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
        status: "assigned",
        progress: 0,
        assigned_by_name: "Marketplace",
        priority: "medium",
      });
      setSaveStatus("plan_done");
    } catch (e) {
      setSaveStatus("plan_error");
    }
    setTimeout(() => setSaveStatus(null), 2500);
  };

  return (
    <div className="border-t border-white/5 pt-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-indigo-400" />
        <h4 className="text-white/40 text-xs uppercase tracking-wider">AI-Powered Learning Tools</h4>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => runTool(tool)}
            disabled={loading && activeTool === tool.id}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
              activeTool === tool.id && result
                ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
                : "bg-white/[0.03] text-white/50 border-white/5 hover:bg-white/[0.06] hover:text-white/70"
            } disabled:opacity-40`}
          >
            {loading && activeTool === tool.id ? <Loader2 size={12} className="animate-spin" /> : <tool.icon size={12} />}
            {tool.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 mb-3">
        <button onClick={exportToJournal} disabled={saveStatus === "journal"}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white/[0.03] text-white/50 border border-white/5 hover:bg-white/[0.06] disabled:opacity-40">
          <BookOpen size={12} />
          {saveStatus === "journal_done" ? "Saved!" : saveStatus === "journal_error" ? "Failed" : "Export to Journal"}
        </button>
        <button onClick={addToLearningPlan} disabled={saveStatus === "plan"}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white/[0.03] text-white/50 border border-white/5 hover:bg-white/[0.06] disabled:opacity-40">
          <GraduationCap size={12} />
          {saveStatus === "plan_done" ? "Added!" : saveStatus === "plan_error" ? "Failed" : "Add to Learning Plan"}
        </button>
      </div>
      {(loading || result) && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 max-h-64 overflow-y-auto">
          {loading ? (
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <Loader2 size={14} className="animate-spin" /> Generating...
            </div>
          ) : (
            <ReactMarkdown className="text-sm prose prose-sm prose-invert max-w-none text-white/70">{result}</ReactMarkdown>
          )}
        </div>
      )}
    </div>
  );
}