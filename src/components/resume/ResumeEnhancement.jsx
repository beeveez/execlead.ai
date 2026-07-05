import React from "react";
import ReactMarkdown from "react-markdown";
import { ShieldAlert, Sparkles } from "lucide-react";

export default function ResumeEnhancement({ report }) {
  if (!report) return null;
  return (
    <div className="space-y-4">
      <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert size={16} className="text-red-400" />
          <h3 className="text-sm font-medium text-red-400 uppercase tracking-wider">Truth Engine & Enhancement Report</h3>
        </div>
        <div className="text-white/70 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{report}</ReactMarkdown>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-white/30 px-2">
        <Sparkles size={12} className="text-emerald-400" />
        Rewrites are suggestions — verify all metrics and claims before using.
      </div>
    </div>
  );
}