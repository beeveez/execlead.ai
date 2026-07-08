import React, { useState } from "react";
import { FileText, Sparkles, Loader2, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { base44 } from "@/api/base44Client";

const TOOLS = [
  { action: "cover_letter", label: "AI Cover Letter", icon: FileText, color: "#6366f1" },
  { action: "resume_optimization", label: "Resume Optimization", icon: Sparkles, color: "#8b5cf6" },
  { action: "interview_prep", label: "Interview Preparation", icon: MessageSquare, color: "#f59e0b" },
];

export default function AIApplicationTools({ jobId, existingContent, onApplicationUpdate }) {
  const [activeTool, setActiveTool] = useState(null);
  const [loading, setLoading] = useState(null);
  const [content, setContent] = useState(existingContent || {});
  const [error, setError] = useState(null);

  const generate = async (action) => {
    setLoading(action);
    setError(null);
    setActiveTool(action);
    try {
      const response = await base44.functions.invoke("jobApplicationTools", { jobId, action });
      const data = response.data || response;
      if (data.success) {
        setContent((prev) => ({ ...prev, [action]: data.content }));
        onApplicationUpdate?.(data.applicationId, action, data.content);
      } else {
        setError(data.error || "Failed to generate");
      }
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || "Failed to generate");
    }
    setLoading(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const hasContent = content[tool.action];
          const isLoading = loading === tool.action;
          const isActive = activeTool === tool.action;
          return (
            <button
              key={tool.action}
              onClick={() => (hasContent ? setActiveTool(isActive ? null : tool.action) : generate(tool.action))}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: isActive ? `${tool.color}20` : hasContent ? `${tool.color}10` : "rgba(255,255,255,0.05)",
                color: isActive || hasContent ? tool.color : "rgba(255,255,255,0.5)",
                border: `1px solid ${isActive ? tool.color + "40" : "transparent"}`,
              }}
            >
              {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Icon size={12} />}
              {tool.label}
              {hasContent && !isLoading && <span className="ml-0.5 text-[8px]">✓</span>}
            </button>
          );
        })}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {activeTool && content[activeTool] && (
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 max-h-[400px] overflow-y-auto">
          <ReactMarkdown className="text-xs text-white/70 prose prose-sm prose-invert max-w-none [&_h2]:text-white [&_h2]:font-semibold [&_h2]:text-sm [&_h2]:mt-3 [&_h2]:mb-1.5 [&_li]:text-white/60 [&_strong]:text-white/80">
            {typeof content[activeTool] === "string" ? content[activeTool] : JSON.stringify(content[activeTool])}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}