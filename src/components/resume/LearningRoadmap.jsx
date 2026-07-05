import React from "react";
import ReactMarkdown from "react-markdown";
import { Compass } from "lucide-react";

export default function LearningRoadmap({ roadmap }) {
  if (!roadmap) return null;
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Compass size={16} className="text-amber-400" />
        <h3 className="text-sm font-medium text-amber-400 uppercase tracking-wider">Personalized Learning Roadmap</h3>
      </div>
      <div className="text-white/70 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
        <ReactMarkdown>{roadmap}</ReactMarkdown>
      </div>
    </div>
  );
}