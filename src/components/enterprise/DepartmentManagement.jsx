import React, { useState, useEffect } from "react";
import { Loader2, Plus, Building2, Trash2, Pencil, X, Network } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const SEED_DEPARTMENTS = ["IT", "HR", "Finance", "Sales", "Marketing", "Operations", "Customer Success", "Engineering", "Legal", "Compliance", "Executive Office"];

const FIELD_CLASS = "w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50";
const LABEL_CLASS = "text-white/40 text-xs uppercase tracking-wider mb-1.5 block";

function DeptForm({ organization, departments, editing, onSaved, onCancel }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: editing?.name || "",
    description: editing?.description || "",
    department_type: editing?.department_type || "department",
    parent_department_id: editing?.parent_department_id || "",
    head_name: editing?.head_name || "",
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
        department_type: form.department_type,
        parent_department_id: form.parent_department_id || null,
        head_name: form.head_name,
      };
      if (editing) {
        await base44.entities.Department.update(editing.id, payload);
        toast({ title: "Department updated" });
      } else {
        await base44.entities.Department.create(payload);
        toast({ title: "Department created" });
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
        <span className="text-white/60 text-xs font-medium uppercase tracking-wider">{editing ? "Edit" : "New"} Department</span>
        <button onClick={onCancel} className="text-white/30 hover:text-white"><X size={14} /></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className={LABEL_CLASS}>Name</label>
          <input className={FIELD_CLASS} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Engineering" />
        </div>
        <div>
          <label className={LABEL_CLASS}>Type</label>
          <select className={FIELD_CLASS} value={form.department_type} onChange={(e) => set("department_type", e.target.value)}>
            <option value="business_unit">Business Unit</option>
            <option value="department">Department</option>
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS}>Parent (optional)</label>
          <select className={FIELD_CLASS} value={form.parent_department_id} onChange={(e) => set("parent_department_id", e.target.value)}>
            <option value="">None (top-level)</option>
            {departments.filter((d) => d.id !== editing?.id).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS}>Head / Manager</label>
          <input className={FIELD_CLASS} value={form.head_name} onChange={(e) => set("head_name", e.target.value)} placeholder="Department head name" />
        </div>
      </div>
      <div>
        <label className={LABEL_CLASS}>Description</label>
        <textarea className={`${FIELD_CLASS} resize-y`} rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} />
      </div>
      <Button onClick={handleSave} size="sm" className="bg-indigo-600 hover:bg-indigo-500" disabled={saving}>
        {saving ? <Loader2 size={14} className="animate-spin mr-1.5" /> : <Plus size={14} className="mr-1.5" />}
        {editing ? "Update" : "Create"} Department
      </Button>
    </div>
  );
}

export default function DepartmentManagement({ organization }) {
  const { toast } = useToast();
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
      const data = await base44.entities.Department.filter({ organization_id: organization.id }, "sort_order", 100);
      setDepartments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await base44.entities.Department.delete(id);
      await load();
      toast({ title: "Department deleted", description: name });
    } catch (e) {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const handleSeed = async () => {
    const existing = new Set(departments.map((d) => d.name));
    const toCreate = SEED_DEPARTMENTS.filter((n) => !existing.has(n)).map((name, i) => ({
      name,
      organization_id: organization.id,
      department_type: "department",
      sort_order: i,
    }));
    if (toCreate.length === 0) { toast({ title: "All standard departments already exist" }); return; }
    try {
      await base44.entities.Department.bulkCreate(toCreate);
      await load();
      toast({ title: "Departments seeded", description: `${toCreate.length} standard departments created.` });
    } catch (e) {
      toast({ title: "Seed failed", variant: "destructive" });
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-400" size={24} /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button onClick={() => { setEditing(null); setShowForm(!showForm); }} size="sm" className="bg-indigo-600 hover:bg-indigo-500">
            <Plus size={14} className="mr-1.5" /> New Department
          </Button>
          <Button onClick={handleSeed} size="sm" variant="outline" className="border-white/10 bg-white/5 text-white/60 hover:text-white">
            <Network size={14} className="mr-1.5" /> Seed Standard Departments
          </Button>
        </div>
        <span className="text-white/30 text-xs">{departments.length} departments</span>
      </div>

      {showForm && (
        <DeptForm organization={organization} departments={departments} editing={editing} onSaved={() => { setShowForm(false); setEditing(null); load(); }} onCancel={() => { setShowForm(false); setEditing(null); }} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {departments.map((d) => (
          <div key={d.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${d.department_type === "business_unit" ? "bg-purple-500/10" : "bg-blue-500/10"}`}>
              <Building2 size={16} className={d.department_type === "business_unit" ? "text-purple-400" : "text-blue-400"} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{d.name}</div>
              <div className="text-white/30 text-xs truncate">
                {d.department_type === "business_unit" ? "Business Unit" : "Department"}
                {d.head_name ? ` · ${d.head_name}` : ""}
                {` · ${d.member_count || 0} members`}
              </div>
            </div>
            <button onClick={() => { setEditing(d); setShowForm(true); }} className="text-white/30 hover:text-white p-1"><Pencil size={12} /></button>
            <button onClick={() => handleDelete(d.id, d.name)} className="text-white/30 hover:text-red-400 p-1"><Trash2 size={12} /></button>
          </div>
        ))}
        {departments.length === 0 && !showForm && (
          <div className="col-span-2 bg-white/[0.02] border border-white/5 rounded-xl p-8 text-center">
            <p className="text-white/30 text-sm">No departments yet. Create one or seed standard departments.</p>
          </div>
        )}
      </div>
    </div>
  );
}