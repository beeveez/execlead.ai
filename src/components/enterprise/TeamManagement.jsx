import React, { useState, useEffect } from "react";
import { Loader2, Plus, Users, Trash2, Pencil, X, ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const FIELD_CLASS = "w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50";
const LABEL_CLASS = "text-white/40 text-xs uppercase tracking-wider mb-1.5 block";

function TeamForm({ organization, departments, editing, onSaved, onCancel }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: editing?.name || "",
    description: editing?.description || "",
    department_id: editing?.department_id || "",
    manager_name: editing?.manager_name || "",
    capacity: editing?.capacity || 10,
    is_cross_functional: editing?.is_cross_functional || false,
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description,
        organization_id: organization.id,
        department_id: form.department_id || null,
        manager_name: form.manager_name,
        capacity: parseInt(form.capacity) || 10,
        is_cross_functional: form.is_cross_functional,
      };
      if (editing) {
        await base44.entities.Team.update(editing.id, payload);
        toast({ title: "Team updated" });
      } else {
        await base44.entities.Team.create(payload);
        toast({ title: "Team created" });
      }
      onSaved();
    } catch (e) {
      toast({ title: "Failed", description: e?.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-white/60 text-xs font-medium uppercase tracking-wider">{editing ? "Edit" : "New"} Team</span>
        <button onClick={onCancel} className="text-white/30 hover:text-white"><X size={14} /></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLASS}>Team Name</label>
          <input className={FIELD_CLASS} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Platform Engineering" />
        </div>
        <div>
          <label className={LABEL_CLASS}>Department</label>
          <select className={FIELD_CLASS} value={form.department_id} onChange={(e) => set("department_id", e.target.value)}>
            <option value="">Unassigned</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS}>Manager</label>
          <input className={FIELD_CLASS} value={form.manager_name} onChange={(e) => set("manager_name", e.target.value)} placeholder="Team manager name" />
        </div>
        <div>
          <label className={LABEL_CLASS}>Capacity</label>
          <input type="number" min="1" className={FIELD_CLASS} value={form.capacity} onChange={(e) => set("capacity", e.target.value)} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="cross-functional" checked={form.is_cross_functional} onChange={(e) => set("is_cross_functional", e.target.checked)} className="rounded" />
        <label htmlFor="cross-functional" className="text-white/60 text-sm cursor-pointer">Cross-functional team (spans multiple departments)</label>
      </div>
      <Button onClick={handleSave} size="sm" className="bg-indigo-600 hover:bg-indigo-500" disabled={saving}>
        {saving ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Plus size={14} className="mr-1.5" />}
        {editing ? "Update" : "Create"} Team
      </Button>
    </div>
  );
}

export default function TeamManagement({ organization }) {
  const { toast } = useToast();
  const [teams, setTeams] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    if (!organization?.id) return;
    load();
  }, [organization?.id]);

  const load = async () => {
    setLoading(true);
    try {
      const [tms, depts] = await Promise.all([
        base44.entities.Team.filter({ organization_id: organization.id }, "sort_order", 100),
        base44.entities.Department.filter({ organization_id: organization.id }),
      ]);
      setTeams(tms);
      setDepartments(depts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete team "${name}"?`)) return;
    try {
      await base44.entities.Team.delete(id);
      await load();
      toast({ title: "Team deleted", description: name });
    } catch (e) {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const deptName = (deptId) => departments.find((d) => d.id === deptId)?.name || "Unassigned";

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-400" size={24} /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button onClick={() => { setEditing(null); setShowForm(!showForm); }} size="sm" className="bg-indigo-600 hover:bg-indigo-500">
          <Plus size={14} className="mr-1.5" /> New Team
        </Button>
        <span className="text-white/30 text-xs">{teams.length} teams</span>
      </div>

      {showForm && (
        <TeamForm organization={organization} departments={departments} editing={editing} onSaved={() => { setShowForm(false); setEditing(null); load(); }} onCancel={() => { setShowForm(false); setEditing(null); }} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {teams.map((t) => {
          const fillPct = Math.min(100, Math.round(((t.member_count || 0) / (t.capacity || 10)) * 100));
          return (
            <div key={t.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
                  <Users size={16} className="text-teal-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-medium truncate">{t.name}</span>
                    {t.is_cross_functional && <ShieldCheck size={12} className="text-violet-400 shrink-0" />}
                  </div>
                  <div className="text-white/30 text-xs truncate">{deptName(t.department_id)}{t.manager_name ? ` · ${t.manager_name}` : ""}</div>
                </div>
                <button onClick={() => { setEditing(t); setShowForm(true); }} className="text-white/30 hover:text-white p-1"><Pencil size={12} /></button>
                <button onClick={() => handleDelete(t.id, t.name)} className="text-white/30 hover:text-red-400 p-1"><Trash2 size={12} /></button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${fillPct >= 90 ? "bg-red-500" : fillPct >= 70 ? "bg-amber-500" : "bg-teal-500"}`} style={{ width: `${fillPct}%` }} />
                </div>
                <span className="text-white/40 text-xs font-mono shrink-0">{t.member_count || 0}/{t.capacity || 10}</span>
              </div>
            </div>
          );
        })}
        {teams.length === 0 && !showForm && (
          <div className="col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
            <p className="text-white/30 text-sm">No teams yet. Create teams and assign them to departments.</p>
          </div>
        )}
      </div>
    </div>
  );
}