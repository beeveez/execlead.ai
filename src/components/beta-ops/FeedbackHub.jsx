import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Lightbulb, Bug, ThumbsUp, HelpCircle, Plus, Star } from "lucide-react";
import { Panel, StatCard, Empty, PriorityBadge } from "./Shared";

const FEEDBACK_TYPES = {
  idea: { icon: Lightbulb, label: "Idea", color: "#3b82f6" },
  bug: { icon: Bug, label: "Bug", color: "#ef4444" },
  praise: { icon: ThumbsUp, label: "Praise", color: "#10b981" },
  confusion: { icon: HelpCircle, label: "Confusion", color: "#f59e0b" },
  missing_feature: { icon: Plus, label: "Missing Feature", color: "#a855f7" },
};

const SEVERITIES = ["low", "medium", "high", "critical"];

export default function FeedbackHub({ productInsights, feedback, onAction, user }) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "idea", title: "", description: "", severity: "medium" });

  const allFeedback = [
    ...(productInsights || []).map((p) => ({ id: p.id, type: p.insight_type === "bug_report" ? "bug" : p.insight_type === "feature_request" ? "missing_feature" : "idea", title: p.feedback_text || p.most_valuable_feature || "Feedback", description: p.feedback_text || "", severity: "medium", created_date: p.created_date, created_by_id: p.created_by_id })),
    ...(feedback || []).map((f) => ({ id: f.id, type: f.feedback_type || "idea", title: f.subject || f.title || "Feedback", description: f.message || f.description || "", severity: f.severity || "medium", created_date: f.created_date })),
  ];

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const insightType = form.type === "bug" ? "bug_report" : form.type === "missing_feature" ? "feature_request" : "general";
      await base44.entities.ProductInsight.create({
        insight_type: insightType,
        feedback_text: `${form.title}\n\n${form.description}`,
        submitted_at: new Date().toISOString(),
      });
      toast({ title: "Submitted", description: "Your feedback has been recorded." });
      setForm({ type: "idea", title: "", description: "", severity: "medium" });
      setShowForm(false);
      onAction?.();
    } catch {
      toast({ title: "Error", description: "Failed to submit feedback.", variant: "destructive" });
    }
  };

  const counts = Object.keys(FEEDBACK_TYPES).map((k) => ({ key: k, count: allFeedback.filter((f) => f.type === k).length }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {counts.map((c) => {
          const cfg = FEEDBACK_TYPES[c.key];
          return <StatCard key={c.key} icon={cfg.icon} label={cfg.label} value={c.count} color={c.key === "bug" ? "red" : c.key === "praise" ? "emerald" : c.key === "confusion" ? "amber" : "indigo"} />;
        })}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Feedback Items</h3>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 transition-colors">
          <Plus size={12} /> Submit Feedback
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
          <div className="flex gap-2 flex-wrap">
            {Object.entries(FEEDBACK_TYPES).map(([k, cfg]) => (
              <button key={k} type="button" onClick={() => setForm({ ...form, type: k })} className={`flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg border transition-colors ${form.type === k ? "bg-white/10 text-white border-white/20" : "bg-white/5 text-white/40 border-white/5"}`}>
                <cfg.icon size={11} /> {cfg.label}
              </button>
            ))}
          </div>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" />
          <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/40">
            {SEVERITIES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">Submit</button>
        </form>
      )}

      {allFeedback.length === 0 ? (
        <Empty text="No feedback yet." />
      ) : (
        <div className="space-y-2">
          {allFeedback.slice(0, 50).map((f) => {
            const cfg = FEEDBACK_TYPES[f.type] || FEEDBACK_TYPES.idea;
            return (
              <div key={f.id} className="flex items-start gap-3 bg-white/[0.02] border border-white/5 rounded-lg p-3">
                <cfg.icon size={14} style={{ color: cfg.color }} className="mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/80 font-medium">{f.title}</div>
                  {f.description && <div className="text-[10px] text-white/40 mt-0.5 line-clamp-2">{f.description}</div>}
                </div>
                {f.severity && <PriorityBadge priority={f.severity === "critical" ? "P0" : f.severity === "high" ? "P1" : "P2"} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}