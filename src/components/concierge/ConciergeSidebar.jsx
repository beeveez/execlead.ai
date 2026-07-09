import React from "react";
import { Plus, MessageSquare, Sparkles } from "lucide-react";

export default function ConciergeSidebar({ conversations, activeId, onSelect, onNew, loading }) {
  return (
    <div className="w-full md:w-72 border-r border-white/5 flex flex-col bg-[#0d0d14]/50">
      <div className="p-3 border-b border-white/5">
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
        >
          <Plus size={16} /> New Conversation
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading ? (
          <div className="px-3 py-4 text-center text-white/30 text-sm">Loading…</div>
        ) : conversations.length === 0 ? (
          <div className="px-3 py-4 text-center text-white/30 text-sm">No conversations yet</div>
        ) : (
          conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`w-full flex items-start gap-2 px-3 py-2.5 rounded-lg text-left transition-colors ${
                activeId === c.id ? "bg-indigo-500/10 text-white" : "text-white/50 hover:bg-white/5 hover:text-white/80"
              }`}
            >
              {activeId === c.id ? <Sparkles size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" /> : <MessageSquare size={14} className="text-white/30 mt-0.5 flex-shrink-0" />}
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{c.metadata?.name || "New Conversation"}</div>
                {c.metadata?.description && <div className="text-xs text-white/30 truncate">{c.metadata.description}</div>}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}