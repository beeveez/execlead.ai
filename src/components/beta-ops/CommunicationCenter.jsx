import React, { useState } from "react";
import { Mail, Megaphone, FileText, Wrench, ClipboardList, Award, Send, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Panel, StatCard, StatusBadge, Empty } from "./Shared";

const COMM_TYPES = [
  { id: "announcement", label: "Announcement", icon: Megaphone },
  { id: "release_notes", label: "Release Notes", icon: FileText },
  { id: "maintenance_notice", label: "Maintenance Notice", icon: Wrench },
  { id: "survey", label: "Survey", icon: ClipboardList },
  { id: "milestone_email", label: "Milestone Email", icon: Award },
  { id: "graduation_invitation", label: "Graduation Invitation", icon: Award },
];

export default function CommunicationCenter({ communications, onAction, user }) {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "announcement", title: "", body: "", audience: "all_beta" });

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      await base44.entities.BetaCommunication.create({
        communication_type: form.type,
        title: form.title,
        body: form.body,
        audience: form.audience,
        status: "sent",
        sent_at: new Date().toISOString(),
        sent_by_id: user?.id,
        sent_by_name: user?.full_name,
        recipient_count: 0,
      });
      toast({ title: "Sent", description: `${form.title} has been sent to beta users.` });
      setForm({ type: "announcement", title: "", body: "", audience: "all_beta" });
      setShowForm(false);
      onAction?.();
    } catch {
      toast({ title: "Error", description: "Failed to send communication.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Send} label="Total Sent" value={communications?.length || 0} color="indigo" />
        <StatCard icon={Mail} label="Recipients" value={communications?.reduce((s, c) => s + (c.recipient_count || 0), 0) || 0} color="blue" />
        <StatCard icon={Mail} label="Opens" value={communications?.reduce((s, c) => s + (c.open_count || 0), 0) || 0} color="cyan" />
        <StatCard icon={ClipboardList} label="Responses" value={communications?.reduce((s, c) => s + (c.response_count || 0), 0) || 0} color="purple" />
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-white/80 uppercase tracking-wider">Communications</h3>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 transition-colors">
          <Plus size={12} /> New Communication
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSend} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
          <div className="flex gap-2 flex-wrap">
            {COMM_TYPES.map((ct) => (
              <button key={ct.id} type="button" onClick={() => setForm({ ...form, type: ct.id })} className={`flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg border transition-colors ${form.type === ct.id ? "bg-white/10 text-white border-white/20" : "bg-white/5 text-white/40 border-white/5"}`}>
                <ct.icon size={11} /> {ct.label}
              </button>
            ))}
          </div>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" />
          <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Message body" rows={4} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/40" />
          <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/40">
            <option value="all_beta">All Beta Users</option>
            <option value="by_status">By Status</option>
            <option value="cohort">By Cohort</option>
            <option value="individual">Individual</option>
          </select>
          <button type="submit" className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors">
            <Send size={14} /> Send
          </button>
        </form>
      )}

      {(!communications || communications.length === 0) ? (
        <Empty text="No communications sent yet." />
      ) : (
        <div className="space-y-2">
          {communications.slice(0, 30).map((c) => {
            const ct = COMM_TYPES.find((t) => t.id === c.communication_type) || COMM_TYPES[0];
            return (
              <div key={c.id} className="flex items-start gap-3 bg-white/[0.02] border border-white/5 rounded-lg p-3">
                <ct.icon size={14} className="text-white/40 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/80 font-medium">{c.title}</div>
                  <div className="text-[10px] text-white/30 mt-0.5">{c.body?.slice(0, 100)}...</div>
                  <div className="text-[10px] text-white/20 mt-1">{c.sent_at ? new Date(c.sent_at).toLocaleString() : "Draft"} · {c.recipient_count} recipients · {c.open_count} opens</div>
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