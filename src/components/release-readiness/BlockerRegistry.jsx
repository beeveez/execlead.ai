import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { READINESS_DOMAINS, computeBlockerSummary, getSeverityRank } from "@/lib/releaseReadinessEngine";
import { StatusBadge, SectionCard, StatCard, Spinner, EmptyState, ProgressBar } from "./Shared";
import { AlertTriangle, Plus, Edit2, Trash2, ChevronDown, ChevronUp } from "lucide-react";

export default function BlockerRegistry() {
  const [blockers, setBlockers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    loadBlockers();
  }, []);

  async function loadBlockers() {
    try {
      const data = await base44.entities.ReleaseBlocker.list("-created_date", 100);
      setBlockers(data || []);
    } catch {
      setBlockers([]);
    } finally {
      setLoading(false);
    }
  }

  const summary = computeBlockerSummary(blockers);
  const sorted = [...blockers].sort((a, b) => {
    const sevDiff = getSeverityRank(a.severity) - getSeverityRank(b.severity);
    if (sevDiff !== 0) return sevDiff;
    return (a.status === "open" ? 0 : a.status === "in_progress" ? 1 : 2) - (b.status === "open" ? 0 : b.status === "in_progress" ? 1 : 2);
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard label="Total" value={summary.total} color="indigo" />
        <StatCard label="Critical" value={summary.critical} color="red" />
        <StatCard label="High" value={summary.high} color="orange" />
        <StatCard label="Unresolved" value={summary.unresolved} color="amber" />
        <StatCard label="Resolved" value={summary.resolved + summary.verified} color="emerald" />
      </div>

      <SectionCard
        title="Blocker Registry"
        icon={AlertTriangle}
        action={
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Blocker
          </button>
        }
      >
        {loading ? (
          <Spinner label="Loading blockers..." />
        ) : sorted.length === 0 ? (
          <EmptyState label="No blockers registered. The path is clear." />
        ) : (
          <div className="space-y-2">
            {sorted.map((blocker) => (
              <BlockerCard
                key={blocker.id}
                blocker={blocker}
                isExpanded={expanded === blocker.id}
                onToggle={() => setExpanded(expanded === blocker.id ? null : blocker.id)}
                onEdit={() => { setEditing(blocker); setShowForm(true); }}
                onDelete={async () => {
                  if (!confirm("Delete this blocker?")) return;
                  await base44.entities.ReleaseBlocker.delete(blocker.id);
                  loadBlockers();
                }}
                onStatusChange={async (newStatus) => {
                  await base44.entities.ReleaseBlocker.update(blocker.id, { status: newStatus, resolved_at: newStatus === "resolved" || newStatus === "verified" ? new Date().toISOString() : null });
                  loadBlockers();
                }}
              />
            ))}
          </div>
        )}
      </SectionCard>

      {showForm && (
        <BlockerForm
          blocker={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSaved={() => { setShowForm(false); setEditing(null); loadBlockers(); }}
        />
      )}
    </div>
  );
}

function BlockerCard({ blocker, isExpanded, onToggle, onEdit, onDelete, onStatusChange }) {
  const scoreColor = blocker.severity === "critical" ? "red" : blocker.severity === "high" ? "amber" : "slate";
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.01] overflow-hidden">
      <div className="flex items-center gap-3 px-3 py-2.5">
        <button onClick={onToggle} className="flex-1 flex items-center gap-3 text-left min-w-0">
          <StatusBadge status={blocker.severity} />
          <span className="text-sm font-medium text-white truncate">{blocker.title}</span>
          {blocker.domain && (
            <span className="text-[10px] text-white/30 hidden sm:inline">
              {READINESS_DOMAINS.find((d) => d.id === blocker.domain)?.name || blocker.domain}
            </span>
          )}
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={blocker.status} />
          {blocker.target_date && <span className="text-[10px] text-white/40 hidden sm:inline">{blocker.target_date}</span>}
          <select
            value={blocker.status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="text-[10px] bg-white/5 border border-white/10 rounded px-1.5 py-1 text-white/60 focus:outline-none"
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="verified">Verified</option>
          </select>
          <button onClick={onEdit} className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white/70 transition-colors">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="p-1 hover:bg-red-500/10 rounded text-white/40 hover:text-red-400 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onToggle} className="p-1 hover:bg-white/10 rounded text-white/40">
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-2">
          {blocker.description && <Field label="Description" value={blocker.description} />}
          {blocker.owner_name && <Field label="Owner" value={blocker.owner_name} />}
          {blocker.target_date && <Field label="Target Date" value={blocker.target_date} />}
          {blocker.evidence && <Field label="Evidence" value={blocker.evidence} />}
          {blocker.dependencies && <Field label="Dependencies" value={blocker.dependencies} />}
          {blocker.repair_action && <Field label="Repair Action" value={blocker.repair_action} />}
          {blocker.verify_method && <Field label="Verify Method" value={blocker.verify_method} />}
          {blocker.resolution_notes && <Field label="Resolution Notes" value={blocker.resolution_notes} />}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-white/30 mb-0.5">{label}</div>
      <div className="text-xs text-white/60">{value}</div>
    </div>
  );
}

function BlockerForm({ blocker, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: blocker?.title || "",
    description: blocker?.description || "",
    domain: blocker?.domain || "",
    severity: blocker?.severity || "medium",
    owner_name: blocker?.owner_name || "",
    target_date: blocker?.target_date || "",
    evidence: blocker?.evidence || "",
    dependencies: blocker?.dependencies || "",
    repair_action: blocker?.repair_action || "",
    verify_method: blocker?.verify_method || "",
    status: blocker?.status || "open",
  });
  const [saving, setSaving] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (blocker) {
        await base44.entities.ReleaseBlocker.update(blocker.id, form);
      } else {
        await base44.entities.ReleaseBlocker.create(form);
      }
      onSaved();
    } catch (err) {
      alert("Failed to save blocker: " + (err.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#0d0d14] border border-white/10 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 sticky top-0 bg-[#0d0d14] z-10">
          <h3 className="text-sm font-semibold text-white">{blocker ? "Edit Blocker" : "Add Blocker"}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white/70 text-xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <FormField label="Title" required>
            <input className="form-input" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Blocker title" required />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Severity">
              <select className="form-input" value={form.severity} onChange={(e) => update("severity", e.target.value)}>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </FormField>
            <FormField label="Status">
              <select className="form-input" value={form.status} onChange={(e) => update("status", e.target.value)}>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="verified">Verified</option>
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Domain">
              <select className="form-input" value={form.domain} onChange={(e) => update("domain", e.target.value)}>
                <option value="">— None —</option>
                {READINESS_DOMAINS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </FormField>
            <FormField label="Target Date">
              <input type="date" className="form-input" value={form.target_date} onChange={(e) => update("target_date", e.target.value)} />
            </FormField>
          </div>
          <FormField label="Owner">
            <input className="form-input" value={form.owner_name} onChange={(e) => update("owner_name", e.target.value)} placeholder="Responsible owner" />
          </FormField>
          <FormField label="Description">
            <textarea className="form-input min-h-[60px]" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Detailed description" />
          </FormField>
          <FormField label="Evidence">
            <textarea className="form-input min-h-[50px]" value={form.evidence} onChange={(e) => update("evidence", e.target.value)} placeholder="Logs, links, findings" />
          </FormField>
          <FormField label="Dependencies">
            <textarea className="form-input min-h-[50px]" value={form.dependencies} onChange={(e) => update("dependencies", e.target.value)} placeholder="What must be resolved first" />
          </FormField>
          <FormField label="Repair Action">
            <textarea className="form-input min-h-[50px]" value={form.repair_action} onChange={(e) => update("repair_action", e.target.value)} placeholder="Action plan to resolve" />
          </FormField>
          <FormField label="Verify Method">
            <textarea className="form-input min-h-[50px]" value={form.verify_method} onChange={(e) => update("verify_method", e.target.value)} placeholder="How to verify resolution" />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-white/10 text-white/60 text-sm hover:bg-white/5">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium disabled:opacity-50">
              {saving ? "Saving..." : blocker ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ label, required, children }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wide text-white/40 mb-1 block">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}