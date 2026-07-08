import React, { useState, useEffect } from "react";
import { AlertTriangle, Loader2, Plus, Clock, User, FileText, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { INCIDENT_SEVERITIES, INCIDENT_STATUSES, INCIDENT_CATEGORIES } from "@/lib/zeroTrustEngine";

function IncidentCard({ incident, onUpdate }) {
  const sevColor = INCIDENT_SEVERITIES[incident.severity]?.color || "#64748b";
  const statusColor = INCIDENT_STATUSES[incident.status]?.color || "#64748b";

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded border" style={{ color: sevColor, borderColor: `${sevColor}30`, background: `${sevColor}10` }}>
              {INCIDENT_SEVERITIES[incident.severity]?.label}
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded border" style={{ color: statusColor, borderColor: `${statusColor}30`, background: `${statusColor}10` }}>
              {INCIDENT_STATUSES[incident.status]?.label}
            </span>
          </div>
          <div className="text-sm text-white/80 font-medium">{incident.title}</div>
          <p className="text-xs text-white/40 mt-1">{incident.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5 text-[10px] text-white/30">
        <span className="flex items-center gap-1"><Clock size={10} /> {incident.created_date ? new Date(incident.created_date).toLocaleDateString() : "—"}</span>
        {incident.assigned_to_name && <span className="flex items-center gap-1"><User size={10} /> {incident.assigned_to_name}</span>}
        <span className="flex items-center gap-1"><FileText size={10} /> {INCIDENT_CATEGORIES[incident.category] || "Other"}</span>
        {incident.affected_users > 0 && <span>{incident.affected_users} affected</span>}
      </div>
      {incident.status !== "resolved" && incident.status !== "postmortem" && (
        <div className="flex gap-2 mt-3">
          <select value={incident.status} onChange={e => onUpdate(incident, { status: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-lg px-2 h-8 text-xs text-white/70 focus:outline-none focus:border-violet-500/50">
            {Object.entries(INCIDENT_STATUSES).map(([k, v]) => <option key={k} value={k} className="bg-[#0d0d14]">{v.label}</option>)}
          </select>
        </div>
      )}
      {incident.resolution && (
        <div className="mt-3 p-2.5 bg-emerald-500/[0.05] border border-emerald-500/15 rounded-lg">
          <div className="text-[10px] text-emerald-400 font-medium mb-0.5">Resolution</div>
          <p className="text-xs text-white/50">{incident.resolution}</p>
        </div>
      )}
    </div>
  );
}

export default function IncidentResponse() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", severity: "medium", category: "other" });

  const load = async () => {
    try {
      const records = await base44.entities.SecurityIncident.list("-created_date", 50);
      setIncidents(records);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    try {
      await base44.entities.SecurityIncident.create({
        ...form,
        status: "open",
        assigned_to_id: user?.id,
        assigned_to_name: user?.full_name,
      });
      await base44.entities.SecurityEvent.create({
        user_id: user?.id,
        user_name: user?.full_name || user?.email,
        event_type: "incident_created",
        severity: form.severity,
        description: `Incident created: ${form.title}`,
        action_taken: "alerted",
      });
      setForm({ title: "", description: "", severity: "medium", category: "other" });
      setShowCreate(false);
      load();
    } catch {}
  };

  const handleUpdate = async (incident, updates) => {
    try {
      const finalUpdates = { ...updates };
      if (updates.status === "resolved" || updates.status === "postmortem") {
        finalUpdates.resolved_date = new Date().toISOString();
      }
      await base44.entities.SecurityIncident.update(incident.id, finalUpdates);
      load();
    } catch {}
  };

  if (loading) return <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 animate-spin text-violet-400" /></div>;

  const openCount = incidents.filter(i => i.status === "open" || i.status === "investigating").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-violet-400 text-xs font-medium uppercase tracking-wider">
          <AlertTriangle size={14} /> Incident Response · {openCount} Open
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 text-violet-400 text-xs font-medium">
          <Plus size={14} /> New Incident
        </button>
      </div>

      {/* Incidents */}
      {incidents.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
          <AlertTriangle size={32} className="text-white/10 mx-auto mb-3" />
          <p className="text-white/30 text-sm">No security incidents. All clear.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {incidents.map(i => <IncidentCard key={i.id} incident={i} onUpdate={handleUpdate} />)}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-[#0d0d14] border border-white/10 rounded-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-sm">Create Security Incident</h3>
              <button onClick={() => setShowCreate(false)}><X size={18} className="text-white/40 hover:text-white/70" /></button>
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="Incident title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-violet-500/50" />
              <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 h-24 resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/70 focus:outline-none focus:border-violet-500/50">
                  {Object.entries(INCIDENT_SEVERITIES).map(([k, v]) => <option key={k} value={k} className="bg-[#0d0d14]">{v.label}</option>)}
                </select>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 h-10 text-sm text-white/70 focus:outline-none focus:border-violet-500/50">
                  {Object.entries(INCIDENT_CATEGORIES).map(([k, v]) => <option key={k} value={k} className="bg-[#0d0d14]">{v}</option>)}
                </select>
              </div>
              <button onClick={handleCreate} disabled={!form.title.trim()} className="w-full h-10 rounded-lg bg-violet-500 hover:bg-violet-600 disabled:opacity-40 text-white text-sm font-medium">
                Create Incident
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}