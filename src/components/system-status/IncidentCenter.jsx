import React, { useState } from "react";
import { AlertTriangle, Plus, Clock, ChevronDown, ChevronUp, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SYSTEM_COMPONENTS, INCIDENT_STATUS_META, parseIncidentUpdates } from "@/lib/systemStatusEngine";
import { IncidentBadge, SeverityBadge, ImpactBadge, Spinner, formatDateTime, formatRelativeTime, formatDuration } from "./Shared";

const STATUS_FLOW = ["investigating", "identified", "monitoring", "resolved"];

export default function IncidentCenter({ incidents, loading, user, onAction }) {
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [updateText, setUpdateText] = useState({});
  const [updateStatus, setUpdateStatus] = useState({});

  const canManage = ["super_admin", "platform_admin", "admin", "developer"].includes(user?.role);

  if (loading) return <Spinner label="Loading incidents..." />;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-400" />
          <h2 className="text-white font-semibold text-sm">Incident Center</h2>
          {incidents.length > 0 && <span className="text-white/30 text-xs">— {incidents.length} active</span>}
        </div>
        {canManage && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium hover:bg-indigo-500/20 transition-colors"
          >
            <Plus size={12} /> Declare Incident
          </button>
        )}
      </div>

      {incidents.length === 0 ? (
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-6 text-center">
          <AlertTriangle size={24} className="mx-auto text-emerald-400/60 mb-2" />
          <p className="text-white/60 text-sm font-medium">No Active Incidents</p>
          <p className="text-white/30 text-xs mt-0.5">All systems are operating normally.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              expanded={expandedId === incident.id}
              onToggle={() => setExpandedId(expandedId === incident.id ? null : incident.id)}
              canManage={canManage}
              user={user}
              updateText={updateText[incident.id] || ""}
              onUpdateText={(text) => setUpdateText({ ...updateText, [incident.id]: text })}
              updateStatus={updateStatus[incident.id] || incident.status}
              onUpdateStatus={(status) => setUpdateStatus({ ...updateStatus, [incident.id]: status })}
              onAddUpdate={async () => {
                const text = updateText[incident.id];
                const newStatus = updateStatus[incident.id] || incident.status;
                if (!text) return;
                const updates = parseIncidentUpdates(incident);
                updates.push({
                  timestamp: new Date().toISOString(),
                  status: newStatus,
                  message: text,
                  author_name: user?.full_name || user?.email || "Operator",
                });
                const changes = {
                  updates_json: JSON.stringify(updates),
                  status: newStatus,
                };
                if (newStatus === "resolved") {
                  changes.resolved_at = new Date().toISOString();
                  changes.is_active = false;
                } else if (newStatus === "monitoring" && !incident.monitoring_at) {
                  changes.monitoring_at = new Date().toISOString();
                } else if (newStatus === "identified" && !incident.identified_at) {
                  changes.identified_at = new Date().toISOString();
                }
                await base44.entities.SystemIncident.update(incident.id, changes);
                setUpdateText({ ...updateText, [incident.id]: "" });
                onAction?.();
              }}
              onAdvance={async (newStatus) => {
                const updates = parseIncidentUpdates(incident);
                updates.push({
                  timestamp: new Date().toISOString(),
                  status: newStatus,
                  message: `Status advanced to ${INCIDENT_STATUS_META[newStatus]?.label || newStatus}`,
                  author_name: user?.full_name || user?.email || "Operator",
                });
                const changes = { updates_json: JSON.stringify(updates), status: newStatus };
                if (newStatus === "resolved") {
                  changes.resolved_at = new Date().toISOString();
                  changes.is_active = false;
                } else if (newStatus === "monitoring" && !incident.monitoring_at) {
                  changes.monitoring_at = new Date().toISOString();
                } else if (newStatus === "identified" && !incident.identified_at) {
                  changes.identified_at = new Date().toISOString();
                }
                await base44.entities.SystemIncident.update(incident.id, changes);
                onAction?.();
              }}
            />
          ))}
        </div>
      )}

      {showForm && <IncidentForm user={user} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); onAction?.(); }} />}
    </div>
  );
}

function IncidentCard({ incident, expanded, onToggle, canManage, user, updateText, onUpdateText, updateStatus, onUpdateStatus, onAddUpdate, onAdvance }) {
  const updates = parseIncidentUpdates(incident);
  const currentIndex = STATUS_FLOW.indexOf(incident.status);
  const affectedComponents = (() => {
    try { return JSON.parse(incident.affected_components || "[]"); } catch { return []; }
  })();

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
      <button onClick={onToggle} className="w-full p-4 flex items-start gap-3 text-left">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-medium text-white">{incident.title}</span>
            <IncidentBadge status={incident.status} />
            <SeverityBadge severity={incident.severity} />
            <ImpactBadge level={incident.impact_level} />
          </div>
          {incident.description && <p className="text-white/40 text-xs">{incident.description}</p>}
          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-white/30">
            <span className="flex items-center gap-1"><Clock size={10} /> Started {formatRelativeTime(incident.started_at || incident.created_date)}</span>
            {incident.resolved_at && <span>Resolved {formatRelativeTime(incident.resolved_at)}</span>}
            {updates.length > 0 && <span>{updates.length} update{updates.length !== 1 ? "s" : ""}</span>}
          </div>
        </div>
        {expanded ? <ChevronUp size={14} className="text-white/30 shrink-0" /> : <ChevronDown size={14} className="text-white/30 shrink-0" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3">
          {/* Affected Components */}
          {affectedComponents.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-white/30 uppercase tracking-wider">Affected:</span>
              {affectedComponents.map((id) => {
                const comp = SYSTEM_COMPONENTS.find((c) => c.id === id);
                return (
                  <span key={id} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/50">
                    {comp?.name || id}
                  </span>
                );
              })}
            </div>
          )}

          {/* Status Flow */}
          {canManage && incident.status !== "resolved" && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-white/30 uppercase tracking-wider">Advance:</span>
              {STATUS_FLOW.map((status, i) => {
                if (i <= currentIndex) return null;
                return (
                  <button
                    key={status}
                    onClick={() => onAdvance(status)}
                    className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/60 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    {INCIDENT_STATUS_META[status]?.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Updates Timeline */}
          {updates.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] text-white/30 uppercase tracking-wider">Timeline</span>
              {updates.slice().reverse().map((update, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full ${INCIDENT_STATUS_META[update.status]?.bg?.replace("/10", "") || "bg-white/20"} mt-1.5`} />
                    {i < updates.length - 1 && <div className="w-px flex-1 bg-white/5 min-h-[20px]" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2">
                      <IncidentBadge status={update.status} />
                      <span className="text-[10px] text-white/30">{formatDateTime(update.timestamp)} · {update.author_name}</span>
                    </div>
                    <p className="text-white/50 text-xs mt-1">{update.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Update */}
          {canManage && incident.status !== "resolved" && (
            <div className="flex gap-2">
              <select
                value={updateStatus}
                onChange={(e) => onUpdateStatus(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-white/70"
              >
                {STATUS_FLOW.map((s) => (
                  <option key={s} value={s}>{INCIDENT_STATUS_META[s]?.label}</option>
                ))}
              </select>
              <input
                value={updateText}
                onChange={(e) => onUpdateText(e.target.value)}
                placeholder="Add an update..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40"
                onKeyDown={(e) => { if (e.key === "Enter" && updateText) onAddUpdate(); }}
              />
              <button
                onClick={onAddUpdate}
                disabled={!updateText}
                className="px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[11px] font-medium hover:bg-indigo-500/30 transition-colors disabled:opacity-30"
              >
                <Send size={12} />
              </button>
            </div>
          )}

          {/* Post-Incident Report */}
          {incident.status === "resolved" && incident.post_incident_report && (
            <div className="bg-white/[0.02] rounded-lg p-3">
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Post-Incident Report</div>
              <p className="text-white/50 text-xs">{incident.post_incident_report}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function IncidentForm({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    severity: "minor",
    impact_level: "degraded",
    affected_components: [],
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      await base44.entities.SystemIncident.create({
        ...form,
        affected_components: JSON.stringify(form.affected_components),
        status: "investigating",
        started_at: now,
        updates_json: JSON.stringify([{
          timestamp: now,
          status: "investigating",
          message: form.description || "Incident declared. Investigation in progress.",
          author_name: user?.full_name || user?.email || "Operator",
        }]),
        is_active: true,
        declared_by_id: user?.id || "",
        declared_by_name: user?.full_name || user?.email || "Operator",
      });
      onSaved();
    } catch (err) {
      console.error("Failed to create incident:", err);
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
          <h3 className="text-sm font-medium text-white">Declare Incident</h3>
          <button type="button" onClick={onClose} className="text-white/40 hover:text-white/80 text-sm">✕</button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Title *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Authentication service degraded" className="form-input" required />
          </div>
          <div>
            <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="What is happening?" className="form-input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Severity</label>
              <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="form-input">
                <option value="minor">Minor</option>
                <option value="major">Major</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider mb-1 block">Impact</label>
              <select value={form.impact_level} onChange={(e) => setForm({ ...form, impact_level: e.target.value })} className="form-input">
                <option value="none">No Impact</option>
                <option value="degraded">Degraded</option>
                <option value="partial_outage">Partial Outage</option>
                <option value="full_outage">Full Outage</option>
              </select>
            </div>
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
          <button type="submit" disabled={saving || !form.title} className="flex-1 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors disabled:opacity-30">
            {saving ? "Declaring..." : "Declare Incident"}
          </button>
        </div>
      </form>
    </div>
  );
}