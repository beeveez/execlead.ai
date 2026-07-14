import React, { useState } from "react";
import { Wrench, Plus, Clock, Calendar, Play, Check, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SYSTEM_COMPONENTS, IMPACT_META } from "@/lib/systemStatusEngine";
import { Spinner, formatDateTime, formatDuration } from "./Shared";

export default function MaintenanceSchedule({ maintenance, loading, user, onAction }) {
  const [showForm, setShowForm] = useState(false);
  const canManage = ["super_admin", "platform_admin", "admin", "developer"].includes(user?.role);

  if (loading) return <Spinner label="Loading maintenance..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wrench size={16} className="text-indigo-400" />
          <h2 className="text-white font-semibold text-sm">Scheduled Maintenance</h2>
        </div>
        {canManage && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium hover:bg-indigo-500/20 transition-colors"
          >
            <Plus size={12} /> Schedule
          </button>
        )}
      </div>

      {maintenance.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 text-center">
          <Wrench size={24} className="mx-auto text-white/20 mb-2" />
          <p className="text-white/50 text-sm">No Scheduled Maintenance</p>
          <p className="text-white/30 text-xs mt-0.5">No maintenance windows are currently planned.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {maintenance.map((m) => (
            <MaintenanceCard key={m.id} maintenance={m} canManage={canManage} user={user} onAction={onAction} />
          ))}
        </div>
      )}

      {showForm && <MaintenanceForm user={user} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); onAction?.(); }} />}
    </div>
  );
}

function MaintenanceCard({ maintenance, canManage, user, onAction }) {
  const affectedComponents = (() => {
    try { return JSON.parse(maintenance.affected_components || "[]"); } catch { return []; }
  })();
  const meta = IMPACT_META[maintenance.impact_level] || IMPACT_META.degraded;
  const startTime = maintenance.start_time ? new Date(maintenance.start_time).getTime() : 0;
  const endTime = maintenance.end_time ? new Date(maintenance.end_time).getTime() : 0;
  const isInProgress = maintenance.status === "in_progress";
  const isCompleted = maintenance.status === "completed";

  return (
    <div className={`rounded-xl border p-4 ${
      isInProgress ? "bg-indigo-500/5 border-indigo-500/20" :
      isCompleted ? "bg-white/[0.02] border-white/5 opacity-60" :
      "bg-white/[0.02] border-white/10"
    }`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-white">{maintenance.title}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
              isInProgress ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
              isCompleted ? "bg-emerald-500/10 text-emerald-400" :
              maintenance.status === "cancelled" ? "bg-red-500/10 text-red-400" :
              "bg-white/5 text-white/50"
            }`}>
              {maintenance.status === "in_progress" ? "In Progress" :
               maintenance.status === "completed" ? "Completed" :
               maintenance.status === "cancelled" ? "Cancelled" : "Scheduled"}
            </span>
            <span className="text-[10px] font-medium" style={{ color: meta.color }}>{meta.label}</span>
          </div>
          {maintenance.description && <p className="text-white/40 text-xs mt-1">{maintenance.description}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4 text-[11px] text-white/40 mt-2">
        <span className="flex items-center gap-1"><Calendar size={11} /> {formatDateTime(maintenance.start_time)}</span>
        {endTime > startTime && (
          <>
            <span>→</span>
            <span className="flex items-center gap-1"><Clock size={11} /> {formatDateTime(maintenance.end_time)}</span>
            <span className="text-white/20">·</span>
            <span>{formatDuration(endTime - startTime)}</span>
          </>
        )}
      </div>

      {affectedComponents.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap mt-2">
          {affectedComponents.map((id) => {
            const comp = SYSTEM_COMPONENTS.find((c) => c.id === id);
            return (
              <span key={id} className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] text-white/50">
                {comp?.name || id}
              </span>
            );
          })}
        </div>
      )}

      {canManage && !isCompleted && maintenance.status !== "cancelled" && (
        <div className="flex gap-2 mt-3">
          {maintenance.status === "scheduled" && (
            <button
              onClick={async () => {
                await base44.entities.ScheduledMaintenance.update(maintenance.id, { status: "in_progress" });
                onAction?.();
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-medium hover:bg-indigo-500/20 transition-colors"
            >
              <Play size={10} /> Start
            </button>
          )}
          {isInProgress && (
            <button
              onClick={async () => {
                await base44.entities.ScheduledMaintenance.update(maintenance.id, { status: "completed", is_upcoming: false });
                onAction?.();
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium hover:bg-emerald-500/20 transition-colors"
            >
              <Check size={10} /> Complete
            </button>
          )}
          <button
            onClick={async () => {
              await base44.entities.ScheduledMaintenance.update(maintenance.id, { status: "cancelled", is_upcoming: false });
              onAction?.();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/40 text-[10px] hover:text-red-400 hover:border-red-500/20 transition-colors"
          >
            <X size={10} /> Cancel
          </button>
        </div>
      )}
    </div>
  );
}

function MaintenanceForm({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    impact_level: "degraded",
    affected_components: [],
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.start_time) return;
    setSaving(true);
    try {
      await base44.entities.ScheduledMaintenance.create({
        ...form,
        start_time: new Date(form.start_time).toISOString(),
        end_time: form.end_time ? new Date(form.end_time).toISOString() : null,
        affected_components: JSON.stringify(form.affected_components),
        status: "scheduled",
        is_upcoming: true,
        declared_by_id: user?.id || "",
        declared_by_name: user?.full_name || user?.email || "Operator",
      });
      onSaved();
    } catch (err) {
      console.error("Failed to schedule maintenance:", err);
    }
    setSaving(false);
  };

  const toggleComponent = (id) => {
    setForm((f) => ({
      ...f,
      affected_components: f.affected_components.includes(id)
        ? f.affected_components.filter((c) => c !== id)
        : [...f.affected_components, id],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full max-w-lg bg-[#0d0d14] border border-white/10 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#0d0d14] border-b border-white/5 px-5 py-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-white">Schedule Maintenance</h3>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white/80 text-sm">✕</button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Title *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Database upgrade" className="form-input" required />
          </div>
          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="What maintenance is being performed?" className="form-input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Start Time *</label>
              <input type="datetime-local" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="form-input" required />
            </div>
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">End Time</label>
              <input type="datetime-local" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="form-input" />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Expected Impact</label>
            <select value={form.impact_level} onChange={(e) => setForm({ ...form, impact_level: e.target.value })} className="form-input">
              <option value="none">No Impact</option>
              <option value="degraded">Degraded Performance</option>
              <option value="partial_outage">Partial Outage</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wider mb-2 block">Affected Components</label>
            <div className="grid grid-cols-2 gap-1.5">
              {SYSTEM_COMPONENTS.map((comp) => (
                <button
                  key={comp.id}
                  type="button"
                  onClick={() => toggleComponent(comp.id)}
                  className={`px-2 py-1.5 rounded-lg text-[10px] text-left transition-colors border ${
                    form.affected_components.includes(comp.id)
                      ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                      : "bg-white/[0.02] border-white/5 text-white/50 hover:bg-white/5"
                  }`}
                >
                  {comp.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 bg-[#0d0d14] border-t border-white/5 px-5 py-3 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-sm">Cancel</button>
          <button type="submit" disabled={saving || !form.title || !form.start_time} className="flex-1 px-4 py-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-sm font-medium hover:bg-indigo-500/30 transition-colors disabled:opacity-30">
            {saving ? "Scheduling..." : "Schedule Maintenance"}
          </button>
        </div>
      </form>
    </div>
  );
}