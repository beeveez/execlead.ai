import React, { useState } from "react";
import { ShieldCheck, LayoutDashboard, BookOpen, Mic, FolderOpen, Library, User, Database, History, BarChart3, Trophy, Settings } from "lucide-react";
import { useLaunchDefense } from "@/hooks/useLaunchDefense";
import LaunchDefenseDashboard from "@/components/launch-defense/LaunchDefenseDashboard";
import QuestionBank from "@/components/launch-defense/QuestionBank";
import InterviewSimulator from "@/components/launch-defense/InterviewSimulator";
import ScenarioLibrary from "@/components/launch-defense/ScenarioLibrary";
import AnswerLibrary from "@/components/launch-defense/AnswerLibrary";
import FounderStory from "@/components/launch-defense/FounderStory";
import EvidenceLibrary from "@/components/launch-defense/EvidenceLibrary";
import PracticeHistory from "@/components/launch-defense/PracticeHistory";
import PerformanceAnalytics from "@/components/launch-defense/PerformanceAnalytics";
import Achievements from "@/components/launch-defense/Achievements";
import LaunchDefenseSettings from "@/components/launch-defense/LaunchDefenseSettings";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "questions", label: "Question Bank™", icon: BookOpen },
  { id: "simulator", label: "Interview Simulator™", icon: Mic },
  { id: "scenarios", label: "Scenario Library™", icon: FolderOpen },
  { id: "answers", label: "Answer Library™", icon: Library },
  { id: "founder", label: "Founder Story™", icon: User },
  { id: "evidence", label: "Evidence Library™", icon: Database },
  { id: "history", label: "Practice History™", icon: History },
  { id: "analytics", label: "Performance Analytics™", icon: BarChart3 },
  { id: "achievements", label: "Achievements™", icon: Trophy },
  { id: "settings", label: "Settings", icon: Settings },
];

/**
 * LaunchDefenseCenter — flagship module: AI-powered interview, investor,
 * media, conference, enterprise, and executive communication preparation.
 * Internal tab navigation across the full question bank, simulator, scenarios,
 * answer library, founder story, evidence, history, analytics, and achievements.
 */
export default function LaunchDefenseCenter() {
  const ld = useLaunchDefense();
  const [tab, setTab] = useState("dashboard");
  const [simContext, setSimContext] = useState(null);

  if (ld.loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-indigo-900 border-t-indigo-400 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Module header */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
          <ShieldCheck size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Launch Defense Center™</h1>
          <p className="text-[11px] text-white/40">AI Founder & Executive Interview Intelligence</p>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                active ? "bg-indigo-500 text-white" : "bg-white/[0.02] border border-white/5 text-white/60 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <t.icon size={13} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Active section */}
      {tab === "dashboard" && <LaunchDefenseDashboard ld={ld} onTab={setTab} />}
      {tab === "questions" && <QuestionBank ld={ld} />}
      {tab === "simulator" && <InterviewSimulator ld={ld} initialContext={simContext} />}
      {tab === "scenarios" && <ScenarioLibrary ld={ld} onTab={setTab} setSimContext={setSimContext} />}
      {tab === "answers" && <AnswerLibrary ld={ld} />}
      {tab === "founder" && <FounderStory ld={ld} />}
      {tab === "evidence" && <EvidenceLibrary />}
      {tab === "history" && <PracticeHistory ld={ld} />}
      {tab === "analytics" && <PerformanceAnalytics ld={ld} />}
      {tab === "achievements" && <Achievements ld={ld} />}
      {tab === "settings" && <LaunchDefenseSettings />}
    </div>
  );
}