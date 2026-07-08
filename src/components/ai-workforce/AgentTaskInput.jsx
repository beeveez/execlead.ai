import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Loader2, X, Sparkles } from "lucide-react";
import { getAgent, getAgentColor, QUICK_TASKS } from "@/lib/aiAgents";

export default function AgentTaskInput({ selectedAgent, onExecute, executing, lastResult }) {
  const [input, setInput] = useState("");
  const colors = selectedAgent ? getAgentColor(selectedAgent.color) : null;
  const Icon = selectedAgent?.icon;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedAgent) return;
    onExecute(selectedAgent.id, input.trim());
  };

  const quickTasks = selectedAgent
    ? QUICK_TASKS.filter(q => q.agent === selectedAgent.id)
    : QUICK_TASKS.slice(0, 4);

  return (
    <div className="space-y-4">
      {selectedAgent && (
        <div className={`flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r ${colors.gradient} border border-white/5`}>
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
            <Icon size={16} className={colors.icon} />
          </div>
          <div>
            <div className="text-white text-sm font-medium">{selectedAgent.name}</div>
            <div className="text-white/40 text-xs">{selectedAgent.role}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={selectedAgent ? `Ask ${selectedAgent.short} to...` : "Select an agent first"}
          disabled={!selectedAgent || executing}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || !selectedAgent || executing}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          {executing ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        </button>
      </form>

      {/* Quick tasks */}
      {!executing && quickTasks.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {quickTasks.map((qt, i) => (
            <button
              key={i}
              onClick={() => setInput(qt.label)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/60 transition-colors"
            >
              <Sparkles size={9} className="text-indigo-400/50" /> {qt.label}
            </button>
          ))}
        </div>
      )}

      {/* Result */}
      {executing && (
        <div className="flex flex-col items-center justify-center py-8 bg-white/[0.02] rounded-lg border border-white/5">
          <Loader2 size={24} className="animate-spin text-indigo-400 mb-3" />
          <p className="text-white/40 text-sm">{selectedAgent?.name} is working on your request...</p>
          <p className="text-white/20 text-xs mt-1">Analyzing your executive context and generating a response.</p>
        </div>
      )}

      {!executing && lastResult && (
        <div className="bg-white/[0.02] border border-white/5 rounded-lg p-4 max-h-[500px] overflow-y-auto">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
            <span className="text-xs text-white/40 font-medium">Agent Response</span>
            <span className="text-[10px] text-white/20">{selectedAgent?.short}</span>
          </div>
          <div className="prose prose-invert prose-sm max-w-none text-white/70">
            <ReactMarkdown>{lastResult}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}