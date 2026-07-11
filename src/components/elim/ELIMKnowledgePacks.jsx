import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { ELIM_FRAMEWORKS, KNOWLEDGE_PACKS } from "@/lib/elimFrameworks";
import { toast } from "@/components/ui/use-toast";
import { Plus, Trash2, Loader2, Package, Edit3, X, Check } from "lucide-react";

export default function ELIMKnowledgePacks() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("manageELIM", { action: "list_knowledge_packs" });
      setPacks(res.data.packs || []);
    } catch {
      setPacks([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (data) => {
    try {
      await base44.functions.invoke("manageELIM", { action: "create_knowledge_pack", pack: data });
      toast({ title: "Knowledge Pack Created" });
      setCreating(false);
      load();
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    }
  };

  const handleUpdate = async (id, updates) => {
    try {
      await base44.functions.invoke("manageELIM", { action: "update_knowledge_pack", pack_id: id, updates });
      toast({ title: "Updated" });
      setEditing(null);
      load();
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    try {
      await base44.functions.invoke("manageELIM", { action: "delete_knowledge_pack", pack_id: id });
      toast({ title: "Deleted" });
      load();
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    }
  };

  const handlePublish = async (id, version) => {
    try {
      await base44.functions.invoke("manageELIM", { action: "publish_version", pack_id: id, version });
      toast({ title: "Published", description: `Version ${version} is now active.` });
      load();
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    }
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-white/30" /></div>;

  const builtinIds = KNOWLEDGE_PACKS.map((p) => p.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold text-sm">Knowledge Packs</h3>
          <p className="text-white/30 text-xs">Every framework belongs to a Knowledge Pack — editable by administrators.</p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-xs font-medium">
          <Plus size={14} /> New Pack
        </button>
      </div>

      {/* Built-in packs */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/20 mb-2">Built-in Packs</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {KNOWLEDGE_PACKS.map((p) => {
            const fw = ELIM_FRAMEWORKS.find((f) => f.id === p.framework_id);
            return (
              <div key={p.id} className="p-3 rounded-lg border border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-1">
                  <Package size={14} style={{ color: fw?.color }} />
                  <span className="text-white/80 text-sm font-medium">{p.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">v{p.version}</span>
                </div>
                <p className="text-white/30 text-xs">{p.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {p.contents.slice(0, 5).map((c) => (
                    <span key={c} className="px-1.5 py-0.5 rounded text-[9px] bg-white/5 text-white/30">{c}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom packs */}
      {packs.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/20 mb-2">Custom Packs</p>
          <div className="space-y-2">
            {packs.map((p) => (
              <div key={p.id} className="p-3 rounded-lg border border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white/80 text-sm font-medium">{p.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${p.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                      {p.status} v{p.version}
                    </span>
                  </div>
                  <p className="text-white/30 text-xs truncate">{p.description || "No description"}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {p.status === "draft" && (
                    <button onClick={() => handlePublish(p.id, p.version)} className="p-1.5 rounded hover:bg-white/5 text-emerald-400" title="Publish">
                      <Check size={14} />
                    </button>
                  )}
                  <button onClick={() => setEditing(p)} className="p-1.5 rounded hover:bg-white/5 text-white/40" title="Edit">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-white/5 text-red-400" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(creating || editing) && (
        <KnowledgePackModal
          pack={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSave={editing ? (updates) => handleUpdate(editing.id, updates) : handleCreate}
        />
      )}
    </div>
  );
}

function KnowledgePackModal({ pack, onClose, onSave }) {
  const [form, setForm] = useState({
    pack_id: pack?.pack_id || `kp_custom_${Date.now()}`,
    framework_id: pack?.framework_id || "eecf",
    name: pack?.name || "",
    version: pack?.version || "1.0",
    status: pack?.status || "draft",
    description: pack?.description || "",
    methodology_json: pack?.methodology_json || "",
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-[#0d0d14] border border-white/10 rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-sm">{pack ? "Edit Knowledge Pack" : "New Knowledge Pack"}</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white/80"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-white/40 mb-1 block">Name</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90" />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Framework</label>
            <select value={form.framework_id} onChange={(e) => set("framework_id", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90">
              {ELIM_FRAMEWORKS.map((f) => <option key={f.id} value={f.id} className="bg-[#0d0d14]">{f.shortName}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/40 mb-1 block">Version</label>
              <input value={form.version} onChange={(e) => set("version", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90" />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90">
                <option value="draft" className="bg-[#0d0d14]">Draft</option>
                <option value="active" className="bg-[#0d0d14]">Active</option>
                <option value="archived" className="bg-[#0d0d14]">Archived</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 resize-none" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-3 py-2 rounded-lg text-white/40 hover:bg-white/5 text-sm">Cancel</button>
          <button onClick={() => onSave(form)} disabled={!form.name} className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium disabled:opacity-40">Save</button>
        </div>
      </div>
    </div>
  );
}