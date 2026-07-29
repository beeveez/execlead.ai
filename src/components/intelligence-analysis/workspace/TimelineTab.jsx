import React, { useState } from "react";
import { History, MessageSquare, Trash2, Send, Activity, Clock, CheckCircle2, Wrench, BarChart2 } from "lucide-react";
import { addComment, deleteComment } from "@/lib/intelligenceInvestigationEngine";

const TYPE_ICON = { detected: Clock, updated: Activity, resolved: CheckCircle2, fix: Wrench, recalc: BarChart2 };

export default function TimelineTab({ bundle, onCommentsChanged }) {
  const [text, setText] = useState("");
  const [comments, setComments] = useState(bundle.comments);

  const submit = () => {
    if (!text.trim()) return;
    const updated = addComment(bundle.metricId, { text: text.trim() });
    setComments(updated);
    setText("");
    onCommentsChanged?.();
  };

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div>
        <div className="flex items-center gap-2 mb-3"><History size={14} className="text-amber-400" /><h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Issue Timeline</h3></div>
        <div className="relative pl-5">
          <div className="absolute left-1.5 top-0 bottom-0 w-px bg-white/10" />
          <div className="space-y-3">
            {bundle.timeline.map((ev, i) => {
              const Icon = TYPE_ICON[ev.type] || Clock;
              return (
                <div key={i} className="relative">
                  <span className="absolute -left-[18px] top-0.5 w-3 h-3 rounded-full bg-[#0d0d14] border border-amber-500/40 flex items-center justify-center">
                    <Icon size={7} className="text-amber-400" />
                  </span>
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-white/80 text-xs font-medium">{ev.event}</span>
                    <span className="text-white/30 text-[10px]">{ev.timestamp}</span>
                  </div>
                  <p className="text-white/50 text-xs mt-0.5">{ev.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div>
        <div className="flex items-center gap-2 mb-3"><Activity size={14} className="text-indigo-400" /><h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Activity Log</h3></div>
        <div className="overflow-x-auto bg-white/[0.02] border border-white/5 rounded-lg">
          <table className="w-full text-xs">
            <thead className="text-white/30 uppercase tracking-wider text-[10px] border-b border-white/5">
              <tr><th className="text-left px-3 py-2">Actor</th><th className="text-left px-3 py-2">Action</th><th className="text-left px-3 py-2">When</th><th className="text-left px-3 py-2">Before</th><th className="text-left px-3 py-2">After</th></tr>
            </thead>
            <tbody>
              {bundle.activityLog.map((a, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03]">
                  <td className="px-3 py-2 text-indigo-300">{a.actor}</td>
                  <td className="px-3 py-2 text-white/70">{a.action}</td>
                  <td className="px-3 py-2 text-white/50">{a.timestamp}</td>
                  <td className="px-3 py-2 text-white/50">{a.before}</td>
                  <td className="px-3 py-2 text-white/70">{a.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comments */}
      <div>
        <div className="flex items-center gap-2 mb-3"><MessageSquare size={14} className="text-amber-400" /><h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Notes & Comments</h3></div>
        <div className="flex gap-2 mb-3">
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Add a note or discussion point…" className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/40" />
          <button onClick={submit} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg text-amber-400 text-xs font-medium transition-colors"><Send size={11} /> Add</button>
        </div>
        <div className="space-y-2">
          {comments.length === 0 && <p className="text-white/30 text-xs text-center py-3">No notes yet — start a discussion.</p>}
          {comments.map((c) => (
            <div key={c.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex items-start justify-between gap-2 group">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white/70 text-xs font-medium">{c.author}</span>
                  <span className="text-white/30 text-[10px]">{new Date(c.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-white/60 text-xs">{c.text}</p>
              </div>
              <button onClick={() => { setComments(deleteComment(bundle.metricId, c.id)); onCommentsChanged?.(); }} className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-colors shrink-0"><Trash2 size={12} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}