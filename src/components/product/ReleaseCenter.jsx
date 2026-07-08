import React, { useState } from "react";
import { Rocket, Plus, X, Send, CheckCircle2, Link2 } from "lucide-react";
import SectionHeader from "@/components/product/SectionHeader";
import { RELEASE_STATUSES, getReleaseStatus, generateReleaseVersion, canManageReleases } from "@/lib/productManagement";
import { safeParse } from "@/lib/feedbackConfig";
import { formatRelative } from "@/lib/productManagement";

export default function ReleaseCenter({ pm, onSelect }) {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ version: "", release_name: "", release_date: "", status: "planned", release_notes: "", breaking_changes: "" });
  const canManage = canManageReleases(pm.user?.role);

  const handleCreate = async () => {
    if (!form.version.trim() || !form.release_name.trim()) return;
    await pm.createRelease({
      ...form,
      release_date: form.release_date || new Date().toISOString(),
      completed_features_json: "[]",
      bug_fixes_json: "[]",
    });
    setForm({ version: "", release_name: "", release_date: "", status: "planned", release_notes: "", breaking_changes: "" });
    setShowCreate(false);
  };

  const suggestVersion = () => {
    const latest = pm.releases[0]?.version;
    setForm(f => ({ ...f, version: generateReleaseVersion(latest) }));
  };

  const inputCls = "w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-indigo-500/50";

  return (
    <div>
      <SectionHeader
        icon={Rocket}
        title="Release Center"
        description={`${pm.releases.length} releases tracked.`}
        actions={canManage && <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium"><Plus size={13} /> New Release</button>}
      />

      {showCreate && (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white">Create Release</span>
            <button onClick={() => setShowCreate(false)} className="text-white/40 hover:text-white"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-white/30 block mb-1">Version</label>
              <div className="flex gap-2">
                <input value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} placeholder="4.2.0" className={inputCls} />
                <button onClick={suggestVersion} className="px-2 rounded-lg bg-white/5 text-white/40 text-xs whitespace-nowrap">Auto</button>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-white/30 block mb-1">Release Name</label>
              <input value={form.release_name} onChange={e => setForm(f => ({ ...f, release_name: e.target.value }))} placeholder="Executive Intelligence Update" className={inputCls} />
            </div>
            <div>
              <label className="text-[10px] text-white/30 block mb-1">Release Date</label>
              <input type="date" value={form.release_date?.slice(0, 10) || ""} onChange={e => setForm(f => ({ ...f, release_date: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="text-[10px] text-white/30 block mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={inputCls}>
                {RELEASE_STATUSES.map(s => <option key={s.id} value={s.id} className="bg-[#0d0d14]">{s.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-white/30 block mb-1">Release Notes</label>
            <textarea value={form.release_notes} onChange={e => setForm(f => ({ ...f, release_notes: e.target.value }))} rows={3} placeholder="What's new..." className={inputCls} />
          </div>
          <div>
            <label className="text-[10px] text-white/30 block mb-1">Breaking Changes</label>
            <input value={form.breaking_changes} onChange={e => setForm(f => ({ ...f, breaking_changes: e.target.value }))} placeholder="None" className={inputCls} />
          </div>
          <button onClick={handleCreate} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium">Create Release</button>
        </div>
      )}

      {pm.releases.length === 0 ? (
        <div className="text-center py-12 text-white/30">
          <Rocket size={28} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">No releases yet. Create your first release to start tracking shipped features and bug fixes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pm.releases.map(rel => {
            const status = getReleaseStatus(rel.status);
            const features = safeParse(rel.completed_features_json, []);
            const fixes = safeParse(rel.bug_fixes_json, []);
            return (
              <div key={rel.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-mono font-bold">v{rel.version}</span>
                      <span className="text-sm font-medium text-white">{rel.release_name}</span>
                    </div>
                    <div className="text-[10px] text-white/30 mt-1">
                      {rel.release_date ? new Date(rel.release_date).toLocaleDateString() : "No date"} · by {rel.created_by_name || "—"}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-medium" style={{ color: status.color, background: `${status.color}15` }}>{status.label}</span>
                </div>

                {(features.length > 0 || fixes.length > 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    {features.length > 0 && (
                      <div>
                        <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5 flex items-center gap-1"><CheckCircle2 size={10} /> Features ({features.length})</div>
                        <div className="space-y-1">
                          {features.map((f, i) => (
                            <div key={i} onClick={() => onSelect(f.id)} className="text-xs text-white/60 hover:text-indigo-400 cursor-pointer flex items-center gap-1">
                              <Link2 size={10} className="text-white/20" /> {f.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {fixes.length > 0 && (
                      <div>
                        <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1.5">Bug Fixes ({fixes.length})</div>
                        <div className="space-y-1">
                          {fixes.map((f, i) => (
                            <div key={i} onClick={() => onSelect(f.id)} className="text-xs text-white/60 hover:text-indigo-400 cursor-pointer flex items-center gap-1">
                              <Link2 size={10} className="text-white/20" /> {f.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {rel.release_notes && (
                  <div className="mt-3 text-xs text-white/50 bg-white/[0.02] rounded-lg p-3 border border-white/5 whitespace-pre-wrap">{rel.release_notes}</div>
                )}
                {rel.breaking_changes && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-400"><X size={11} /> Breaking: {rel.breaking_changes}</div>
                )}

                {canManage && rel.status === "released" && !rel.customer_notified && (
                  <button onClick={async () => {
                    await pm.updateRelease(rel.id, { notify_customers: true, customer_notified: true });
                  }} className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium">
                    <Send size={11} /> Notify Customers
                  </button>
                )}
                {rel.customer_notified && (
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-400"><CheckCircle2 size={11} /> Customers notified</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}