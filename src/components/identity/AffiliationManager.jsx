import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Plus, Check, Loader2, Briefcase, Shield, Star,
  Users, DollarSign, Handshake, Award, X
} from "lucide-react";

const AFFILIATION_TYPES = [
  { id: "employee", label: "Employee", icon: Briefcase, color: "text-blue-400" },
  { id: "board_member", label: "Board Member", icon: Shield, color: "text-purple-400" },
  { id: "advisor", label: "Advisor", icon: Star, color: "text-amber-400" },
  { id: "mentor", label: "Mentor", icon: Users, color: "text-emerald-400" },
  { id: "investor", label: "Investor", icon: DollarSign, color: "text-green-400" },
  { id: "consultant", label: "Consultant", icon: Briefcase, color: "text-cyan-400" },
  { id: "partner", label: "Partner", icon: Handshake, color: "text-indigo-400" },
  { id: "fellow", label: "Fellow", icon: Award, color: "text-rose-400" },
];

function getTypeConfig(typeId) {
  return AFFILIATION_TYPES.find(t => t.id === typeId) || AFFILIATION_TYPES[0];
}

export default function AffiliationManager() {
  const { toast } = useToast();
  const [affiliations, setAffiliations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ organization_name: "", affiliation_type: "advisor", role_title: "" });

  useEffect(() => {
    loadAffiliations();
  }, []);

  const loadAffiliations = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke("manageIdentityTransfer", { action: "get_affiliations" });
      const d = res.data || res;
      setAffiliations(d.affiliations || []);
    } catch {}
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!form.organization_name.trim()) return;
    setSubmitting(true);
    try {
      const res = await base44.functions.invoke("manageIdentityTransfer", {
        action: "add_affiliation",
        organization_name: form.organization_name,
        affiliation_type: form.affiliation_type,
        role_title: form.role_title,
      });
      const d = res.data || res;
      if (d.success) {
        toast({ title: "Affiliation Added", description: `${form.organization_name} added to your profile.` });
        setForm({ organization_name: "", affiliation_type: "advisor", role_title: "" });
        setShowForm(false);
        loadAffiliations();
      }
    } catch {
      toast({ title: "Failed to add affiliation", variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleEnd = async (id, orgName) => {
    try {
      const res = await base44.functions.invoke("manageIdentityTransfer", { action: "end_affiliation", affiliation_id: id });
      const d = res.data || res;
      if (d.success) {
        toast({ title: "Affiliation Ended", description: `${orgName} removed from your active affiliations.` });
        loadAffiliations();
      }
    } catch {
      toast({ title: "Failed to end affiliation", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 pb-12">
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Building2 size={18} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white/90 text-sm">Organization Affiliations</h2>
              <p className="text-white/40 text-xs">One Executive Identity, Multiple Organizations</p>
            </div>
          </div>
          {!showForm && (
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium rounded-lg transition-colors">
              <Plus size={14} /> Add
            </button>
          )}
        </div>

        {/* Add Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 mb-4 space-y-3">
                <div>
                  <label className="block text-white/40 text-xs mb-1.5">Organization Name</label>
                  <input value={form.organization_name} onChange={(e) => setForm({ ...form, organization_name: e.target.value })}
                    placeholder="e.g., Acme Corporation"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/40 text-xs mb-1.5">Affiliation Type</label>
                    <select value={form.affiliation_type} onChange={(e) => setForm({ ...form, affiliation_type: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50">
                      {AFFILIATION_TYPES.map(t => <option key={t.id} value={t.id} className="bg-[#1a1a24]">{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/40 text-xs mb-1.5">Role Title</label>
                    <input value={form.role_title} onChange={(e) => setForm({ ...form, role_title: e.target.value })}
                      placeholder="e.g., Strategic Advisor"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50" />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button onClick={handleAdd} disabled={!form.organization_name.trim() || submitting}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white text-xs font-medium rounded-lg transition-colors">
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Add Affiliation
                  </button>
                  <button onClick={() => { setShowForm(false); setForm({ organization_name: "", affiliation_type: "advisor", role_title: "" }); }}
                    className="flex items-center gap-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 text-xs font-medium rounded-lg transition-colors">
                    <X size={12} /> Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Affiliations List */}
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>
        ) : affiliations.length === 0 ? (
          <div className="text-center py-8">
            <Building2 size={24} className="text-white/10 mx-auto mb-2" />
            <p className="text-white/30 text-xs">No affiliations yet. Add one to showcase your multi-org roles.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {affiliations.map((aff) => {
              const typeConfig = getTypeConfig(aff.affiliation_type);
              const Icon = typeConfig.icon;
              return (
                <div key={aff.id} className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className={typeConfig.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white/80 text-sm font-medium truncate">{aff.organization_name}</span>
                      {aff.is_primary && <span className="text-[9px] px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 rounded font-medium">PRIMARY</span>}
                      {aff.sponsored_by_org && <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded font-medium">SPONSORED</span>}
                    </div>
                    <div className="text-white/30 text-xs">{typeConfig.label}{aff.role_title ? ` · ${aff.role_title}` : ""}</div>
                  </div>
                  {!aff.sponsored_by_org && (
                    <button onClick={() => handleEnd(aff.id, aff.organization_name)}
                      className="text-white/30 hover:text-red-400 text-xs transition-colors px-2 py-1">
                      End
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Product message */}
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-white/30 text-[11px] text-center italic">
            Your employer may sponsor your EXECLEAD.AI membership, but your Executive Identity belongs to you.
          </p>
        </div>
      </div>
    </div>
  );
}