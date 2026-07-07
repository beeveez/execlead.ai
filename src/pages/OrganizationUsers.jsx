import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useOrganizationMembers } from "@/hooks/useOrganizationMembers";
import { useSubscription } from "@/lib/SubscriptionContext";
import { toast } from "@/components/ui/use-toast";
import { Shield, Users, UserPlus, Loader2, MoreVertical, Trash2, UserCog, BookOpen, Ban, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EditUserModal from "@/components/organization/EditUserModal";
import AssignmentModal from "@/components/hr/AssignmentModal";

export default function OrganizationUsers() {
  const { members, loading, organizationId } = useOrganizationMembers();
  const { profile } = useSubscription();
  const [departments, setDepartments] = useState([]);
  const [org, setOrg] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!organizationId) return;
      try {
        const [depts, orgs] = await Promise.all([
          base44.entities.Department.filter({ organization_id: organizationId }),
          base44.entities.Organization.filter({ id: organizationId }),
        ]);
        setDepartments(depts);
        if (orgs[0]) setOrg(orgs[0]);
      } catch (e) {}
    };
    load();
  }, [organizationId]);

  const handleInvite = async () => {
    if (!inviteEmail.trim() || inviting) return;
    setInviting(true);
    try {
      await base44.users.inviteUser(inviteEmail.trim(), "user");
      if (org) {
        await base44.entities.Organization.update(org.id, { seats_used: (org.seats_used || 0) + 1 });
        setOrg({ ...org, seats_used: (org.seats_used || 0) + 1 });
      }
      setInviteEmail("");
      toast({ title: "Invitation Sent", description: `${inviteEmail} has been invited.` });
    } catch (e) {
      toast({ title: "Invite Failed", description: e.message || "Could not send invitation.", variant: "destructive" });
    }
    setInviting(false);
  };

  const handleSaveMember = async (data) => {
    try {
      await base44.entities.UserProfile.update(editMember.id, data);
      toast({ title: "Member Updated", description: `${editMember.full_name}'s settings have been saved.` });
      setEditMember(null);
      window.location.reload();
    } catch (e) {
      toast({ title: "Update Failed", description: e.message, variant: "destructive" });
    }
  };

  const handleDeactivate = async (member) => {
    try {
      await base44.entities.UserProfile.update(member.id, { status: "inactive" });
      toast({ title: "Member Deactivated", description: `${member.full_name} has been deactivated.` });
      setMenuOpen(null);
      window.location.reload();
    } catch (e) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };

  const handleReactivate = async (member) => {
    try {
      await base44.entities.UserProfile.update(member.id, { status: "active" });
      toast({ title: "Member Reactivated", description: `${member.full_name} is now active.` });
      setMenuOpen(null);
      window.location.reload();
    } catch (e) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };

  const handleRemove = async (member) => {
    if (member.id === profile?.id) {
      toast({ title: "Cannot Remove", description: "You cannot remove yourself.", variant: "destructive" });
      return;
    }
    try {
      await base44.entities.UserProfile.update(member.id, {
        organization_id: "", custom_role: "", department: "", department_id: "", manager_id: "", manager_name: "",
      });
      if (org && (org.seats_used || 0) > 0) {
        await base44.entities.Organization.update(org.id, { seats_used: org.seats_used - 1 });
      }
      toast({ title: "Member Removed", description: `${member.full_name} has been removed from the organization.` });
      setMenuOpen(null);
      window.location.reload();
    } catch (e) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };

  const handleAssignLearning = (member) => {
    setAssignTarget(member);
    setShowAssignModal(true);
    setMenuOpen(null);
  };

  const handleSaveAssignment = async (data) => {
    try {
      await base44.entities.LearningAssignment.create({ ...data, assignee_name: assignTarget?.full_name || data.assignee_name });
      toast({ title: "Learning Path Assigned", description: `Assigned to ${assignTarget?.full_name}.` });
      setShowAssignModal(false);
      setAssignTarget(null);
    } catch (e) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };

  const managers = members.filter((m) => ["Enterprise Manager", "Enterprise Admin", "Organization Owner"].includes(m.custom_role));
  const seatsTotal = org?.seats_total || 0;
  const seatsUsed = org?.seats_used ?? members.length;
  const isUnlimited = seatsTotal === 0;
  const seatPct = isUnlimited ? 0 : Math.min(100, Math.round((seatsUsed / seatsTotal) * 100));

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
            <Shield size={12} className="text-indigo-400" /> User Management
          </div>
          <h1 className="text-2xl font-bold text-white">Organization Members</h1>
          <p className="text-white/40 text-sm mt-1">
            Members of {org?.name || "Your Organization"} · {members.length} {members.length === 1 ? "member" : "members"}
          </p>
        </div>
        <div className="text-right">
          <div className="text-white/30 text-xs uppercase tracking-wider">Seats Used</div>
          <div className="text-white font-bold">{seatsUsed} / {isUnlimited ? "Unlimited" : seatsTotal}</div>
          {!isUnlimited && (
            <div className="w-24 h-1.5 bg-white/5 rounded-full mt-1 overflow-hidden">
              <div className={`h-full rounded-full ${seatPct >= 90 ? "bg-red-500" : seatPct >= 70 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${seatPct}%` }} />
            </div>
          )}
        </div>
      </div>

      {/* Invite */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <UserPlus size={16} className="text-indigo-400" />
          <h3 className="text-sm font-medium text-white/60">Invite Team Member</h3>
        </div>
        <div className="flex gap-2">
          <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} disabled={inviting}
            placeholder="colleague@company.com"
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50" />
          <button onClick={handleInvite} disabled={!inviteEmail.trim() || inviting}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 text-white text-sm font-medium transition-colors">
            {inviting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />} Invite
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center gap-2">
          <Users size={16} className="text-white/40" />
          <h3 className="text-sm font-medium text-white/60">Members ({members.length})</h3>
        </div>
        {members.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={32} className="mx-auto text-white/10 mb-3" />
            <p className="text-white/30 text-sm">No members found in this organization.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/5">
                <tr className="text-left text-xs text-white/30 uppercase tracking-wider">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Manager</th>
                  <th className="px-4 py-3">Learning</th>
                  <th className="px-4 py-3">Exec Score</th>
                  <th className="px-4 py-3">Promotion</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-500/10 flex items-center justify-center text-xs font-bold text-indigo-400">{(m.full_name || "U").charAt(0)}</div>
                        <span className="text-white/70">{m.full_name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        m.custom_role === "Organization Owner" ? "bg-amber-500/10 text-amber-400" :
                        m.custom_role === "Enterprise Admin" ? "bg-indigo-500/10 text-indigo-400" :
                        m.custom_role === "Enterprise Manager" ? "bg-cyan-500/10 text-cyan-400" :
                        "bg-white/5 text-white/40"
                      }`}>{m.custom_role || "Enterprise User"}</span>
                    </td>
                    <td className="px-4 py-3 text-white/50">{m.department || "—"}</td>
                    <td className="px-4 py-3 text-white/50">{m.manager_name || "—"}</td>
                    <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">{m.sessions_completed || 0} sess · {m.challenges_completed || 0} chal</td>
                    <td className="px-4 py-3"><ScoreBar value={m.interview_readiness || 0} barColor="bg-indigo-500" textColor="text-indigo-400" /></td>
                    <td className="px-4 py-3"><ScoreBar value={m.promotion_readiness || 0} barColor="bg-emerald-500" textColor="text-emerald-400" /></td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        m.status === "active" ? "bg-emerald-500/10 text-emerald-400" :
                        m.status === "suspended" ? "bg-red-500/10 text-red-400" :
                        "bg-white/5 text-white/40"
                      }`}>{m.status || "active"}</span>
                    </td>
                    <td className="px-4 py-3 relative">
                      <button onClick={() => setMenuOpen(menuOpen === m.id ? null : m.id)} className="text-white/30 hover:text-white/60 p-1">
                        <MoreVertical size={16} />
                      </button>
                      {menuOpen === m.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                          <div className="absolute right-4 top-12 z-20 bg-[#1a1a24] border border-white/10 rounded-lg shadow-xl py-1 w-48">
                            <button onClick={() => { setEditMember(m); setMenuOpen(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-white/60 hover:bg-white/5">
                              <UserCog size={12} /> Edit Role & Dept
                            </button>
                            <button onClick={() => handleAssignLearning(m)} className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-white/60 hover:bg-white/5">
                              <BookOpen size={12} /> Assign Learning Path
                            </button>
                            {m.status === "active" ? (
                              <button onClick={() => handleDeactivate(m)} className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-amber-400 hover:bg-white/5">
                                <Ban size={12} /> Deactivate
                              </button>
                            ) : (
                              <button onClick={() => handleReactivate(m)} className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-emerald-400 hover:bg-white/5">
                                <CheckCircle2 size={12} /> Reactivate
                              </button>
                            )}
                            <button onClick={() => handleRemove(m)} className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-red-400 hover:bg-white/5 border-t border-white/5">
                              <Trash2 size={12} /> Remove from Org
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editMember && (
          <EditUserModal member={editMember} departments={departments} managers={managers}
            onSave={handleSaveMember} onClose={() => setEditMember(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAssignModal && (
          <AssignmentModal members={assignTarget ? [assignTarget] : members}
            onSave={handleSaveAssignment} onClose={() => { setShowAssignModal(false); setAssignTarget(null); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

function ScoreBar({ value, barColor, textColor }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
      <span className={`text-xs font-medium ${textColor}`}>{Math.round(value)}</span>
    </div>
  );
}