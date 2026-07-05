import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useSubscription } from "@/lib/SubscriptionContext";
import { defaultResumeContent } from "@/lib/careerStudio";
import { Briefcase, FileText, Mail, Linkedin, User, FolderKanban, Clock, Trophy, FolderOpen, Download, Sparkles } from "lucide-react";
import ResumeBuilder from "@/components/career-studio/ResumeBuilder";
import CoverLetters from "@/components/career-studio/CoverLetters";
import LinkedInOptimizer from "@/components/career-studio/LinkedInOptimizer";
import ExecutiveBio from "@/components/career-studio/ExecutiveBio";
import JobMatch from "@/components/career-studio/JobMatch";
import Portfolio from "@/components/career-studio/Portfolio";
import CareerTimeline from "@/components/career-studio/CareerTimeline";
import Achievements from "@/components/career-studio/Achievements";
import Documents from "@/components/career-studio/Documents";
import ExportCenter from "@/components/career-studio/ExportCenter";

const TABS = [
  { id: "builder", label: "Resume Builder", icon: FileText },
  { id: "cover", label: "Cover Letters", icon: Mail },
  { id: "linkedin", label: "LinkedIn Optimizer", icon: Linkedin },
  { id: "bio", label: "Executive Bio", icon: User },
  { id: "jobmatch", label: "Job Match", icon: Sparkles },
  { id: "portfolio", label: "Portfolio", icon: FolderKanban },
  { id: "timeline", label: "Career Timeline", icon: Clock },
  { id: "achievements", label: "Achievements", icon: Trophy },
  { id: "documents", label: "Documents", icon: FolderOpen },
  { id: "export", label: "Export Center", icon: Download },
];

export default function CareerStudio() {
  const { profile } = useSubscription();
  const [activeTab, setActiveTab] = useState("builder");
  const [activeResume, setActiveResume] = useState(null);
  const [resumeContent, setResumeContent] = useState(defaultResumeContent());

  const handleResumeChange = (resume) => {
    setActiveResume(resume);
    try {
      setResumeContent(resume?.content ? JSON.parse(resume.content) : defaultResumeContent());
    } catch { setResumeContent(defaultResumeContent()); }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <Briefcase size={12} className="text-indigo-400" /> Career Studio
        </div>
        <h1 className="text-2xl font-bold text-white">AI Executive Career Studio</h1>
        <p className="text-white/40 text-sm mt-1">Manage your entire executive career from one place — resumes, cover letters, LinkedIn, bios, portfolio, and more</p>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-6 border-b border-white/5">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 px-3 py-2.5 rounded-t-lg text-xs font-medium whitespace-nowrap transition-all ${activeTab === tab.id ? "text-indigo-400 border-b-2 border-indigo-400" : "text-white/40 hover:text-white/70"}`}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "builder" && <ResumeBuilder activeResume={activeResume} onResumeChange={handleResumeChange} />}
      {activeTab === "cover" && <CoverLetters profile={profile} resumeContent={resumeContent} />}
      {activeTab === "linkedin" && <LinkedInOptimizer profile={profile} resumeContent={resumeContent} />}
      {activeTab === "bio" && <ExecutiveBio profile={profile} resumeContent={resumeContent} />}
      {activeTab === "jobmatch" && <JobMatch profile={profile} resumeContent={resumeContent} />}
      {activeTab === "portfolio" && <Portfolio />}
      {activeTab === "timeline" && <CareerTimeline resumeContent={resumeContent} />}
      {activeTab === "achievements" && <Achievements />}
      {activeTab === "documents" && <Documents />}
      {activeTab === "export" && <ExportCenter activeResume={activeResume} resumeContent={resumeContent} />}
    </div>
  );
}