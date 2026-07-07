import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Network, Plus, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SuccessionPlanModal from "@/components/hr/SuccessionPlanModal";
import { useOrganizationMembers } from "@/hooks/useOrganizationMembers";

const RISK_STYLES = {
  critical: { badge: "bg-red-500/10 text-red-400", label: "Critical" },
  high: { badge: "bg-orange-500/10 text-orange-400", label: "High" },
  medium: { badge: "bg-amber-500/10 text-amber-400", label: "Medium" },
  low: { badge: "bg-emerald-500/10 text-emerald-400", label: "Low" },
};

const STATUS_STYLES = {
  identified: "bg-white/5 text-white/40",
  developing: "bg-blue-500/10 text-blue-400",
  ready: "bg-emerald-500/10 text-emerald-400",
  vacant: "bg-red-500/10 text-red-400",
};

export default function SuccessionPlanning() {
  const { members, loading: loadingMembers } = useOrganizationMembers();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editPlan, setEditPlan] = useState(null);

  useEffect(() => {
    load();
  }, [loadingMembers, members]);

  const load = async () => {
    if (loadingMembers) return;
    try {
      const memberNames = new Set(members.map((m) => m.full_name));
      const p = await base44.entities.SuccessionPlan.list("-created_date", 100);
      const orgPlans = p.filter((plan) => {
        try {
          const succ = JSON.parse(plan.successors_json || "[]");
          return succ.some((s) => memberNames.has(s.name)) || memberNames.has(plan.incumbent_name);
        } catch (e) { return false; }
      });
      setPlans(orgPlans.length > 0 ? orgPlans : p);
    } catch (e) {}
    setLoading(false);
  };

  const handleSave = async (data) => {
    try {
      if (editPlan) {
        await base44.entities.SuccessionPlan.update(editPlan.id, data);
      } else {
        await base44.entities.SuccessionPlan.create(data);
      }
      setShowModal(false);
      setEditPlan(null);
      await load();
    } catch (e) {}
  };

  const handleDelete = async (id) => {
    await base44.entities.SuccessionPlan.delete(id);
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const parseSuccessors = (json) => {
    try { return JSON.parse(json || "[]"); } catch { return []; }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <Network size={12} className="text-indigo-400" />
            Succession Planning
          </div>
          <h1 className="text-2xl font-bold text-white">Key Role Succession</h1>
          <p className="text-white/40 text-sm mt-1">Identify and develop successors for critical roles.</p>
        </div>
        <button onClick={() => { setEditPlan(null); setShowModal(true); }}
          className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors">
          <Plus size={18} /> New Plan
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-indigo-400" /></div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20">
          <Network size={32} className="mx-auto text-white/10 mb-4" />
          <p className="text-white/30 text-sm mb-4">No succession plans yet. Start by identifying your critical roles.</p>
          <button onClick={() => setShowModal(true)} className="text-indigo-400 text-sm hover:text-indigo-300">Create your first plan</button>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan, i) => {
            const successors = parseSuccessors(plan.successors_json);
            const risk = RISK_STYLES[plan.risk_level] || RISK_STYLES.medium;
            const hasReadySuccessor = successors.some((s) => s.readiness >= 70);
            return (
              <motion.div key={plan.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white/[0.03] border border-white/5 rounded-xl p-5 group">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold">{plan.role_title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${risk.badge}`}>{risk.label}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_STYLES[plan.status] || STATUS_STYLES.identified}`}>{plan.status}</span>
                    </div>
                    <p className="text-white/30 text-xs">{plan.department} · Incumbent: {plan.incumbent_name || "Vacant"}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => { setEditPlan(plan); setShowModal(true); }} className="text-white/30 hover:text-white/60 px-2 py-1 text-xs">Edit</button>
                    <button onClick={() => handleDelete(plan.id)} className="text-white/30 hover:text-red-400 px-2 py-1"><Trash2 size={14} /></button>
                  </div>
                </div>

                {successors.length > 0 ? (
                  <div className="space-y-2 mt-4">
                    {successors.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white/[0.02] rounded-lg px-3 py-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-500/10 flex items-center justify-center text-xs font-bold text-indigo-400">
                          {(s.name || "?").charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white/80 text-sm">{s.name}</div>
                          {s.notes && <div className="text-white/30 text-xs truncate">{s.notes}</div>}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${s.readiness >= 70 ? "bg-emerald-500" : s.readiness >= 50 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${s.readiness}%` }} />
                          </div>
                          <span className={`text-xs font-medium w-8 text-right ${s.readiness >= 70 ? "text-emerald-400" : s.readiness >= 50 ? "text-amber-400" : "text-red-400"}`}>{s.readiness}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-red-500/5 border border-red-500/10 rounded-lg">
                    <AlertTriangle size={14} className="text-red-400" />
                    <span className="text-red-400 text-xs">No successors identified for this role.</span>
                  </div>
                )}

                {plan.notes && <p className="text-white/30 text-xs mt-3 pt-3 border-t border-white/5">{plan.notes}</p>}
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showModal && <SuccessionPlanModal plan={editPlan} members={members} onSave={handleSave} onClose={() => { setShowModal(false); setEditPlan(null); }} />}
      </AnimatePresence>
    </div>
  );
}