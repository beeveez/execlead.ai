import React, { useState } from "react";
import { Users, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Panel, StatCard, StatusBadge, Empty } from "./Shared";

const COHORT_TYPES = [
  { id: "founding_a", label: "Founding Cohort A", color: "#8b5cf6" },
  { id: "founding_b", label: "Founding Cohort B", color: "#a855f7" },
  { id: "enterprise", label: "Enterprise Cohort", color: "#06b6d4" },
  { id: "executive", label: "Executive Cohort", color: "#3b82f6" },
  { id: "partner", label: "Partner Cohort", color: "#10b981" },
];

export default function ReleaseCohorts({ cohorts, data, onAction, user }) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", type: "founding_a", size: 25, description: "" });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await base44.entities.BetaCohort.create({
        cohort_name: form.name,
        cohort_type: form.type,
        description: form.description,
        target_size: parseInt(form.size),
        status: "forming",
        start_date: new Date().toISOString().slice(0, 10),
        created_by_name: user?.full_name,
      });
      toast({ title: "Cohort Created", description: `${form.name} is now forming.` });
      setForm({ name: "", type: "founding_a", size: 25, description: "" });
      setShowForm(false);
      onAction?.();
    } catch {
      toast({ title: "Error", description: "Failed to create cohort.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {COHORT_TYPES.map((ct) => {
          const count = (cohorts || []).filter((c) => c.cohort_type === ct.id).length;
          return <StatCard key={ct.id} label={ct.label} value={count} color="purple" />;
        })}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Release Cohorts</h3>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 transition-colors">
          <Plus size={12} /> New Cohort
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Cohort name" required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/40">
            {COHORT_TYPES.map((ct) => <option key={ct.id} value={ct.id}>{ct.label}</option>)}
          </select>
          <input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} type="number" min={1} max={500} placeholder="Target size" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/40" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" />
          <button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">Create Cohort</button>
        </form>
      )}

      {(!cohorts || cohorts.length === 0) ? (
        <Empty text="No cohorts created yet." />
      ) : (
        <div className="space-y-2">
          {cohorts.map((c) => {
            const ct = COHORT_TYPES.find((t) => t.id === c.cohort_type) || COHORT_TYPES[0];
            const metrics = data?.cohortMetrics?.find((m) => m.id === c.id);
            return (
              <div key={c.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${ct.color}1a` }}>
                  <Users size={16} style={{ color: ct.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/80 font-medium">{c.cohort_name}</div>
                  <div className="text-[10px] text-white/30">{ct.label} · Target: {c.target_size} · {metrics ? `${metrics.participantCount} participants, ${metrics.engagement}% engaged` : "No participants yet"}</div>
                </div>
                <StatusBadge status={c.status} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}