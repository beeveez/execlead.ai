import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Play, Check, SkipForward, RefreshCw, Loader2, Zap, Filter } from "lucide-react";

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
const PRIORITY_STYLE = {
  critical: "text-red-400 bg-red-500/10 border-red-500/20",
  high: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  medium: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  low: "text-white/40 bg-white/5 border-white/10",
};
const STATUS_STYLE = {
  pending: "text-white/50 bg-white/5",
  in_progress: "text-blue-400 bg-blue-500/10",
  completed: "text-emerald-400 bg-emerald-500/10",
  skipped: "text-white/30 bg-white/5",
};

export default function TaskQueue() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pending");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await base44.entities.CommercialTask.list("-created_date", 100);
      setTasks(data);
    } catch (e) {
      console.error("Task load error:", e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleEvaluate = async () => {
    setEvaluating(true);
    try {
      const res = await base44.functions.invoke("commercialAutomationEngine", { action: "evaluate_rules" });
      const result = res.data;
      toast({ title: "Rules Evaluated", description: `${result.tasksCreated} task(s) created across ${result.ruleReports.length} rule(s).` });
      await load();
    } catch (e) {
      toast({ title: "Evaluation Failed", description: e.message, variant: "destructive" });
    }
    setEvaluating(false);
  };

  const updateStatus = async (taskId, status) => {
    try {
      const updates = { status };
      if (status === "completed") updates.completed_date = new Date().toISOString();
      await base44.entities.CommercialTask.update(taskId, updates);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)));
    } catch (e) {
      toast({ title: "Update Failed", description: e.message, variant: "destructive" });
    }
  };

  const filtered = tasks
    .filter((t) => statusFilter === "all" || t.status === statusFilter)
    .sort((a, b) => (PRIORITY_ORDER[a.priority] || 3) - (PRIORITY_ORDER[b.priority] || 3));

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Commercial Task Queue™</h2>
          <p className="text-xs text-white/40 mt-0.5">{filtered.length} task(s) • {tasks.filter((t) => t.status === "pending").length} pending</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
            {["pending", "in_progress", "completed", "skipped", "all"].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)} className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${statusFilter === s ? "bg-indigo-500 text-white" : "text-white/50 hover:text-white/80"}`}>
                {s === "all" ? "All" : s.replace("_", " ")}
              </button>
            ))}
          </div>
          <Button size="sm" onClick={handleEvaluate} disabled={evaluating} className="gap-2 bg-indigo-500 hover:bg-indigo-600 text-white">
            {evaluating ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />} Evaluate Rules
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 rounded-xl bg-white/[0.02] border border-white/5">
          <Filter className="w-8 h-8 text-white/20 mx-auto mb-2" />
          <p className="text-sm text-white/40">No tasks in this view. Click "Evaluate Rules" to scan the CRM and generate new tasks.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <div key={task.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${PRIORITY_STYLE[task.priority] || PRIORITY_STYLE.medium}`}>{task.priority}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${STATUS_STYLE[task.status] || STATUS_STYLE.pending}`}>{task.status.replace("_", " ")}</span>
                    <span className="text-[10px] text-white/30 uppercase tracking-wide">{task.task_type.replace(/_/g, " ")}</span>
                    {task.owner && <span className="text-[10px] text-white/30">• {task.owner}</span>}
                  </div>
                  <p className="text-sm text-white font-medium">{task.title}</p>
                  {task.reason && <p className="text-xs text-white/40 mt-1">{task.reason}</p>}
                  {task.suggested_action && <p className="text-xs text-white/60 mt-1"><span className="text-white/30">Action:</span> {task.suggested_action}</p>}
                  {task.expected_impact && <p className="text-xs text-white/50 mt-0.5"><span className="text-white/30">Impact:</span> {task.expected_impact}</p>}
                  {task.exec_recommendation && <p className="text-xs text-indigo-300/70 mt-1.5 italic">EXEC™: {task.exec_recommendation}</p>}
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-white/30">
                    {task.target_name && <span>{task.target_name}</span>}
                    {task.target_email && <span>{task.target_email}</span>}
                    {task.target_company && <span>{task.target_company}</span>}
                    {task.due_date && <span>Due: {task.due_date}</span>}
                    {task.expected_revenue > 0 && <span className="text-emerald-400 font-semibold">${task.expected_revenue}/yr</span>}
                    {task.source_rule_name && <span className="text-white/20">Rule: {task.source_rule_name}</span>}
                  </div>
                </div>
                {task.status === "pending" && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => updateStatus(task.id, "in_progress")} title="Start" className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"><Play size={12} /></button>
                    <button onClick={() => updateStatus(task.id, "completed")} title="Complete" className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"><Check size={12} /></button>
                    <button onClick={() => updateStatus(task.id, "skipped")} title="Skip" className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 transition-colors"><SkipForward size={12} /></button>
                  </div>
                )}
                {task.status === "in_progress" && (
                  <button onClick={() => updateStatus(task.id, "completed")} title="Complete" className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors flex-shrink-0"><Check size={12} /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}