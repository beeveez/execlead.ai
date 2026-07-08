import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { isSuperAdmin, isPlatformAdmin } from "@/lib/roles";
import { getMembershipPrograms, createDefaultProgram } from "@/lib/membershipEngine";
import { Shield, Plus, Loader2, Award, Users, Percent, TrendingUp, Sparkles } from "lucide-react";
import ProgramCard from "@/components/membership/ProgramCard";
import ProgramFormModal from "@/components/membership/ProgramFormModal";
import EnrollUserModal from "@/components/membership/EnrollUserModal";
import MembersPanel from "@/components/membership/MembersPanel";

export default function MembershipAdmin() {
  const [user, setUser] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [enrollProgram, setEnrollProgram] = useState(null);
  const [membersProgram, setMembersProgram] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        if (isSuperAdmin(me.role) || isPlatformAdmin(me.role)) {
          const list = await getMembershipPrograms();
          setPrograms(list);
        }
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, []);

  const canAccess = user && (isSuperAdmin(user.role) || isPlatformAdmin(user.role));

  const handleSave = async (data) => {
    if (editing) {
      const updated = await base44.entities.MembershipProgram.update(editing.id, data);
      setPrograms((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...updated } : p)));
    } else {
      const created = await base44.entities.MembershipProgram.create(data);
      setPrograms((prev) => [...prev, created]);
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = async (program) => {
    if (!confirm(`Delete "${program.name}"? Enrolled members will lose their benefits.`)) return;
    try {
      await base44.entities.MembershipProgram.delete(program.id);
      setPrograms((prev) => prev.filter((p) => p.id !== program.id));
    } catch (e) {}
  };

  const handleEnrolled = async () => {
    setEnrollProgram(null);
    const list = await getMembershipPrograms();
    setPrograms(list);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  }

  if (!canAccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
          <Shield size={32} className="mx-auto text-white/20 mb-3" />
          <h2 className="text-white font-medium mb-1">Access Restricted</h2>
          <p className="text-white/30 text-sm">This area is restricted to platform administrators.</p>
        </div>
      </div>
    );
  }

  const activeCount = programs.filter((p) => p.is_active).length;
  const totalMembers = programs.reduce((sum, p) => sum + (p.enrolled_count || 0), 0);
  const avgDiscount = programs.length > 0
    ? Math.round(programs.reduce((sum, p) => sum + (p.discount_percentage || 0), 0) / programs.length)
    : 0;

  const stats = [
    { label: "Total Programs", value: programs.length, icon: Award, color: "text-indigo-400" },
    { label: "Active Programs", value: activeCount, icon: Sparkles, color: "text-emerald-400" },
    { label: "Total Members", value: totalMembers, icon: Users, color: "text-cyan-400" },
    { label: "Avg Discount", value: `${avgDiscount}%`, icon: Percent, color: "text-amber-400" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <Shield size={12} className="text-purple-400" /> Platform Admin
            <span className="text-white/10">→</span>
            <span className="text-white/50">Membership Programs</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Membership Program Management</h1>
          <p className="text-white/40 text-sm mt-1">Create and manage membership programs independent of subscription plans. Memberships layer discounts, badges, and benefits on top of any plan.</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Create Program
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/30 text-xs">{s.label}</span>
              <s.icon size={16} className={s.color} />
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Programs grid */}
      {programs.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-12 text-center">
          <Award size={32} className="mx-auto text-white/10 mb-3" />
          <h3 className="text-white font-medium mb-1">No membership programs yet</h3>
          <p className="text-white/30 text-sm mb-6 max-w-md mx-auto">Create your first membership program to grant exclusive discounts, badges, and benefits to selected users — independent of their subscription plan.</p>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            <Plus size={16} /> Create First Program
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map((program) => (
            <ProgramCard
              key={program.id}
              program={program}
              onEdit={() => { setEditing(program); setShowForm(true); }}
              onEnroll={() => setEnrollProgram(program)}
              onManageMembers={() => setMembersProgram(program)}
              onDelete={() => handleDelete(program)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showForm && (
          <ProgramFormModal
            program={editing}
            onSave={handleSave}
            onClose={() => { setShowForm(false); setEditing(null); }}
          />
        )}
        {enrollProgram && (
          <EnrollUserModal
            program={enrollProgram}
            adminUser={user}
            onEnrolled={handleEnrolled}
            onClose={() => setEnrollProgram(null)}
          />
        )}
        {membersProgram && (
          <MembersPanel
            program={membersProgram}
            onClose={() => setMembersProgram(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}