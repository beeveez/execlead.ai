import React, { useState } from "react";
import { Mail, Plus, Copy, Clock, CheckCircle2, XCircle, Link2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { generateInvitationCode } from "@/lib/betaOperationsEngine";
import { Panel, StatCard, StatusBadge, Empty } from "./Shared";

export default function InvitationManagement({ invitations, onAction, user }) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: "", type: "individual", expirationDays: 7, orgName: "" });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const code = generateInvitationCode();
      const expires = new Date(Date.now() + form.expirationDays * 86400000).toISOString();
      await base44.entities.BetaInvitation.create({
        invitation_code: code,
        invitation_type: form.type,
        email: form.email,
        organization_name: form.orgName || null,
        status: "sent",
        sent_at: new Date().toISOString(),
        expires_at: expires,
        invited_by_id: user?.id,
        invited_by_name: user?.full_name,
      });
      toast({ title: "Invitation Created", description: `Code ${code} sent to ${form.email}.` });
      setForm({ email: "", type: "individual", expirationDays: 7, orgName: "" });
      setShowForm(false);
      onAction?.();
    } catch {
      toast({ title: "Error", description: "Failed to create invitation.", variant: "destructive" });
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(`${window.location.origin}/beta?invite=${code}`);
    toast({ title: "Copied", description: "Invitation link copied to clipboard." });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard icon={Mail} label="Total" value={invitations.total} color="indigo" />
        <StatCard icon={Clock} label="Opened" value={invitations.opened} color="blue" />
        <StatCard icon={CheckCircle2} label="Accepted" value={invitations.accepted} color="emerald" />
        <StatCard icon={XCircle} label="Expired" value={invitations.expired} color="red" />
        <StatCard icon={XCircle} label="Declined" value={invitations.declined} color="amber" />
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Invitations</h3>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 transition-colors">
          <Plus size={12} /> New Invitation
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" placeholder="Recipient email" required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/40">
              <option value="individual">Individual</option>
              <option value="organization">Organization</option>
              <option value="referral">Referral</option>
            </select>
            {form.type === "organization" && <input value={form.orgName} onChange={(e) => setForm({ ...form, orgName: e.target.value })} placeholder="Organization name" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" />}
            <input value={form.expirationDays} onChange={(e) => setForm({ ...form, expirationDays: parseInt(e.target.value) })} type="number" min={1} max={30} placeholder="Expiration (days)" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/40" />
          </div>
          <button type="submit" className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">
            <Mail size={14} /> Send Invitation
          </button>
        </form>
      )}

      {invitations.total === 0 ? (
        <Empty text="No invitations sent yet. Create one to get started." />
      ) : (
        <div className="space-y-1.5">
          {/* This component receives pre-loaded invitation records from the parent */}
        </div>
      )}
    </div>
  );
}