import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck, ShieldAlert, FileCheck2, AlertTriangle, Layers, Plus, X, Database, Sparkles, KeyRound, Boxes,
} from "lucide-react";
import {
  runArchitectureValidation, listArchitectureExceptions, createArchitectureException,
  ARCHITECTURE_WARNING,
} from "@/lib/architectureGovernanceEngine";

const KIND_ICON = { service: Boxes, repository: Database, ai: Sparkles, prompt: FileCheck2, config: FileCheck2, auth: KeyRound, storage: Database };

export default function PlatformExceptionGovernance() {
  const validation = useMemo(() => runArchitectureValidation(), []);
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", module: "", owner: "", runtime_dependency: "entity", alternative_considered: "", expected_resolution: "", target_removal_version: "", supporting_notes: "" });
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setExceptions(await listArchitectureExceptions());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.title || !form.module || !form.owner) return;
    setSubmitting(true);
    try {
      await createArchitectureException({ ...form, workspace: "executive", severity: "medium", risk_level: "medium" });
      setShowForm(false);
      setForm({ title: "", module: "", owner: "", runtime_dependency: "entity", alternative_considered: "", expected_resolution: "", target_removal_version: "", supporting_notes: "" });
      await load();
    } catch (e) {}
    setSubmitting(false);
  };

  const v = validation;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.02] border border-white/8 rounded-2xl p-5 space-y-5">
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${v.passed ? "bg-emerald-500/10" : "bg-rose-500/10"}`}>
          <ShieldCheck size={14} className={v.passed ? "text-emerald-400" : "text-rose-400"} />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-white/30">Architecture Standard v1.0</div>
          <h3 className="text-sm font-semibold text-white">Platform Exception Governance™</h3>
        </div>
        <span className={`ml-auto text-[10px] px-2 py-1 rounded-full font-semibold ${v.passed ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : "bg-rose-500/15 text-rose-400 border border-rose-500/25"}`}>
          {v.passed ? "VALIDATION PASS" : `${v.violations.length} VIOLATION(S)`}
        </span>
      </div>

      {/* DX warning banner */}
      <div className="rounded-xl bg-amber-500/[0.06] border border-amber-500/15 p-3 flex gap-2">
        <AlertTriangle size={13} className="text-amber-400 mt-0.5 shrink-0" />
        <p className="text-[11px] text-amber-200/80 leading-relaxed">{ARCHITECTURE_WARNING}</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: "Migrated", value: v.summary.migratedCount, icon: FileCheck2, accent: "text-emerald-400" },
          { label: "Architecture Debt", value: v.summary.debtCount, icon: Layers, accent: "text-amber-400" },
          { label: "Violations", value: v.summary.violationCount, icon: ShieldAlert, accent: v.summary.violationCount > 0 ? "text-rose-400" : "text-white/60" },
          { label: "Approved Layers", value: v.authorizedLayers.length, icon: ShieldCheck, accent: "text-indigo-400" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl bg-white/[0.03] border border-white/8 p-3">
            <m.icon size={13} className={`${m.accent} mb-1.5`} />
            <div className={`text-lg font-bold ${m.accent}`}>{m.value}</div>
            <div className="text-[9px] text-white/40 uppercase tracking-wider leading-tight">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Authorized Dependency Allowlist */}
      <div>
        <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Authorized Dependency Allowlist™</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {v.authorizedLayers.map((l) => {
            const Icon = KIND_ICON[l.kind] || Boxes;
            return (
              <div key={l.path} className="flex items-center gap-2 rounded-lg bg-white/[0.02] border border-white/8 px-2.5 py-1.5">
                <Icon size={11} className="text-emerald-400 shrink-0" />
                <span className="text-[11px] text-white/70">{l.label}</span>
                <span className="ml-auto text-[9px] text-white/25 font-mono truncate max-w-[45%]">{l.path}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Architecture Debt (legacy direct usage — opportunistic) */}
      {v.debt.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Architecture Debt — migrate opportunistically</div>
          <div className="space-y-1.5">
            {v.debt.map((d) => (
              <div key={d.id} className="rounded-lg bg-amber-500/[0.04] border border-amber-500/15 p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-white/80">{d.module}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/20">{d.severity}</span>
                </div>
                <div className="text-[10px] text-white/30 font-mono mb-1">{d.file}</div>
                <div className="text-[10px] text-amber-200/70">{d.remediation}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Violations (fail CI/CD) */}
      {v.violations.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-rose-400/70 mb-2">Architecture Violations — CI/CD will fail</div>
          <div className="space-y-1.5">
            {v.violations.map((x) => (
              <div key={x.id} className="rounded-lg bg-rose-500/[0.05] border border-rose-500/20 p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-white/80">{x.module}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/20">{x.severity}</span>
                </div>
                <div className="text-[10px] text-white/30 font-mono mb-1">{x.file}</div>
                <div className="text-[10px] text-rose-200/70">{x.remediation}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exception Registry */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] uppercase tracking-wider text-white/30">Exception Registry™</div>
          <button onClick={() => setShowForm((s) => !s)} className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors">
            {showForm ? <X size={11} /> : <Plus size={11} />} {showForm ? "Cancel" : "Request Exception"}
          </button>
        </div>

        {showForm && (
          <div className="rounded-xl bg-white/[0.02] border border-white/10 p-3 mb-2 space-y-2">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Exception title" className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" />
            <div className="grid grid-cols-2 gap-2">
              <input value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })} placeholder="Affected module / file" className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" />
              <input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} placeholder="Owner" className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" />
            </div>
            <select value={form.runtime_dependency} onChange={(e) => setForm({ ...form, runtime_dependency: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-indigo-500/40">
              <option value="entity">Entity access</option>
              <option value="ai">AI provider (InvokeLLM)</option>
              <option value="storage">Storage (UploadFile)</option>
              <option value="auth">Authentication</option>
              <option value="config">Runtime configuration</option>
            </select>
            <input value={form.alternative_considered} onChange={(e) => setForm({ ...form, alternative_considered: e.target.value })} placeholder="Platform Service alternative considered" className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" />
            <input value={form.expected_resolution} onChange={(e) => setForm({ ...form, expected_resolution: e.target.value })} placeholder="Planned resolution" className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" />
            <input value={form.target_removal_version} onChange={(e) => setForm({ ...form, target_removal_version: e.target.value })} placeholder="Target removal version" className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" />
            <textarea value={form.supporting_notes} onChange={(e) => setForm({ ...form, supporting_notes: e.target.value })} placeholder="Supporting notes / justification" rows={2} className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40 resize-none" />
            <button onClick={submit} disabled={submitting || !form.title || !form.module || !form.owner} className="w-full py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-500/90 text-[11px] text-white font-semibold disabled:opacity-40 transition-colors">
              {submitting ? "Submitting…" : "Submit Exception Request"}
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-[11px] text-white/40">Loading exceptions…</div>
        ) : exceptions.length === 0 ? (
          <div className="text-[11px] text-white/40">No architecture exceptions recorded. All direct runtime access is currently governed by the Authorized Dependency Allowlist™.</div>
        ) : (
          <div className="space-y-1.5">
            {exceptions.map((ex) => (
              <div key={ex.id} className="rounded-lg bg-white/[0.02] border border-white/8 p-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-white/80">{ex.title}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
                    ex.approval_status === 'approved' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' :
                    ex.approval_status === 'rejected' || ex.approval_status === 'revoked' ? 'bg-rose-500/15 text-rose-300 border-rose-500/25' :
                    'bg-amber-500/15 text-amber-300 border-amber-500/25'
                  }`}>{ex.approval_status}</span>
                </div>
                <div className="text-[10px] text-white/30 font-mono">{ex.exception_id} · {ex.module}</div>
                <div className="text-[10px] text-white/40 mt-0.5">Owner: {ex.owner} · Dependency: {ex.runtime_dependency}</div>
                {ex.expected_resolution && <div className="text-[10px] text-white/30 mt-0.5">Resolution: {ex.expected_resolution}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}