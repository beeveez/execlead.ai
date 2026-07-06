import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ClipboardCheck, Plus, Trash2, Loader2, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";
import AssignmentModal from "@/components/hr/AssignmentModal";

const STATUS_STYLES = {
  assigned: { badge: "bg-white/5 text-white/40", icon: Clock },
  in_progress: { badge: "bg-blue-500/10 text-blue-400", icon: Clock },
  completed: { badge: "bg-emerald-500/10 text-emerald-400", icon: CheckCircle2 },
  overdue: { badge: "bg-red-500/10 text-red-400", icon: AlertCircle },
};

const PRIORITY_STYLES = {
  low: "bg-emerald-500/10 text-emerald-400",
  medium: "bg-amber-500/10 text-amber-400",
  high: "bg-red-500/10 text-red-400",
};

export default function LearningAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const [a, m] = await Promise.all([
        base44.entities.LearningAssignment.list("-created_date", 200),
        base44.entities.UserProfile.list(),
      ]);
      setAssignments(a);
      setMembers(m);
    } catch (e) {}
    setLoading(false);
  };

  const handleSave = async (data) => {
    try {
      await base44.entities.LearningAssignment.create(data);
      setShowModal(false);
      await load();
    } catch (e) {}
  };

  const handleStatusChange = async (id, status) => {
    const assignment = assignments.find((a) => a.id === id);
    if (!assignment) return;
    const progress = status === "completed" ? 100 : status === "in_progress" ? Math.max(assignment.progress || 0, 10) : assignment.progress;
    await base44.entities.LearningAssignment.update(id, { status, progress });
    setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, status, progress } : a)));
  };

  const handleDelete = async (id) => {
    await base44.entities.LearningAssignment.delete(id);
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  const today = moment().format("YYYY-MM-DD");
  const stats = {
    total: assignments.length,
    inProgress: assignments.filter((a) => a.status === "in_progress").length,
    completed: assignments.filter((a) => a.status === "completed").length,
    overdue: assignments.filter((a) => a.status === "overdue" || (a.due_date && a.due_date < today && a.status !== "completed")).length,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <ClipboardCheck size={12} className="text-amber-400" />
            Learning Assignments
          </div>
          <h1 className="text-2xl font-bold text-white">Team Learning Management</h1>
          <p className="text-white/40 text-sm mt-1">Assign and track learning paths across your team.</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors">
          <Plus size={18} /> Assign
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Assigned", value: stats.total, color: "text-white" },
          { label: "In Progress", value: stats.inProgress, color: "text-blue-400" },
          { label: "Completed", value: stats.completed, color: "text-emerald-400" },
          { label: "Overdue", value: stats.overdue, color: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-white/30 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-indigo-400" /></div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-20">
          <ClipboardCheck size={32} className="mx-auto text-white/10 mb-4" />
          <p className="text-white/30 text-sm mb-4">No learning assignments yet.</p>
          <button onClick={() => setShowModal(true)} className="text-indigo-400 text-sm hover:text-indigo-300">Assign your first learning path</button>
        </div>
      ) : (
        <div className="space-y-2">
          {assignments.map((a, i) => {
            const isOverdue = a.due_date && a.due_date < today && a.status !== "completed";
            const status = isOverdue && a.status !== "overdue" ? "overdue" : a.status;
            const style = STATUS_STYLES[status] || STATUS_STYLES.assigned;
            return (
              <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-white/[0.03] border border-white/5 rounded-xl p-4 group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                      <style.icon size={16} className={style.badge.split(" ")[1]} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-white font-medium text-sm">{a.title}</h3>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${PRIORITY_STYLES[a.priority] || PRIORITY_STYLES.medium}`}>{a.priority}</span>
                      </div>
                      <div className="text-white/30 text-xs">{a.assignee_name} · {a.learning_path}</div>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden max-w-xs">
                          <div className={`h-full rounded-full transition-all ${status === "completed" ? "bg-emerald-500" : status === "overdue" ? "bg-red-500" : "bg-indigo-500"}`} style={{ width: `${a.progress || 0}%` }} />
                        </div>
                        <span className="text-xs text-white/40">{a.progress || 0}%</span>
                        {a.due_date && (
                          <span className={`text-xs ${isOverdue ? "text-red-400" : "text-white/30"}`}>
                            Due {moment(a.due_date).format("MMM D")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    {status !== "completed" && (
                      <select value={a.status} onChange={(e) => handleStatusChange(a.id, e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/60 focus:outline-none">
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    )}
                    <button onClick={() => handleDelete(a.id)} className="text-white/30 hover:text-red-400 p-1"><Trash2 size={14} /></button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showModal && <AssignmentModal members={members} onSave={handleSave} onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}