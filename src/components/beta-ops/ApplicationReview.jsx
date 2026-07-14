import React, { useState } from "react";
import { Users, CheckCircle2, XCircle, Mail, Clock, ChevronDown, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Panel, StatusBadge, Empty } from "./Shared";

const REVIEW_STEPS = ["New", "Screening", "Interview", "Approve", "Invite", "Activate", "Graduate", "GA Customer"];

export default function ApplicationReview({ data, onAction, onOpenProfile }) {
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(new Set());
  const [expanded, setExpanded] = useState(null);
  if (!data) return null;
  const apps = data.allApplications || [];
  const filtered = filter === "all" ? apps : apps.filter((a) => a.status === filter);

  const toggleSelect = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const handleAction = async (app, action) => {
    const statusMap = { approve: "approved", reject: "rejected", invite: "invited", activate: "activated" };
    try {
      await base44.entities.BetaApplication.update(app.id, {
        status: statusMap[action],
        reviewed_at: new Date().toISOString(),
      });
      toast({ title: "Updated", description: `${app.full_name} marked as ${statusMap[action]}.` });
      onAction?.();
    } catch {
      toast({ title: "Error", description: "Failed to update application.", variant: "destructive" });
    }
  };

  const handleBulkAction = async (action) => {
    const statusMap = { approve: "approved", reject: "rejected", invite: "invited" };
    const items = apps.filter((a) => selected.has(a.id));
    try {
      await base44.entities.BetaApplication.bulkUpdate(items.map((a) => ({ id: a.id, status: statusMap[action], reviewed_at: new Date().toISOString() })));
      toast({ title: "Bulk Update", description: `${items.length} applications marked as ${statusMap[action]}.` });
      setSelected(new Set());
      onAction?.();
    } catch {
      toast({ title: "Error", description: "Bulk update failed.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {["all", "pending", "approved", "rejected", "invited", "activated"].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`text-xs px-3 py-1.5 rounded-lg font-medium ${filter === s ? "bg-indigo-500/15 text-indigo-400" : "bg-white/5 text-white/40"}`}>
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)} ({s === "all" ? apps.length : apps.filter((a) => a.status === s).length})
          </button>
        ))}
        {selected.size > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[10px] text-white/40">{selected.size} selected</span>
            <button onClick={() => handleBulkAction("approve")} className="text-[10px] px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20">Approve</button>
            <button onClick={() => handleBulkAction("reject")} className="text-[10px] px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20">Reject</button>
            <button onClick={() => handleBulkAction("invite")} className="text-[10px] px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20">Invite</button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 mb-3 text-[10px] text-white/30 flex-wrap">
        {REVIEW_STEPS.map((step, i) => (
          <React.Fragment key={i}>
            <span className="px-1.5 py-0.5 rounded bg-white/[0.02]">{step}</span>
            {i < REVIEW_STEPS.length - 1 && <span className="text-white/20">→</span>}
          </React.Fragment>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty text="No applications in this category." />
      ) : (
        <div className="space-y-2">
          {filtered.map((app) => (
            <div key={app.id} className="bg-white/[0.02] border border-white/5 rounded-lg overflow-hidden">
              <div className="flex items-center gap-3 px-3 py-2.5">
                <input type="checkbox" checked={selected.has(app.id)} onChange={() => toggleSelect(app.id)} className="accent-indigo-500" />
                <button onClick={() => setExpanded(expanded === app.id ? null : app.id)} className="flex-1 flex items-center gap-3 text-left">
                  {expanded === app.id ? <ChevronDown size={12} className="text-white/30" /> : <ChevronRight size={12} className="text-white/30" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white/80 font-medium">{app.full_name}</div>
                    <div className="text-[10px] text-white/30">{app.email} · {app.company || "—"} · {app.leadership_level || "—"}</div>
                  </div>
                  <StatusBadge status={app.status} />
                  <span className="text-[10px] text-white/30">{app.beta_tier}</span>
                </button>
                <button onClick={() => onOpenProfile?.(app)} className="text-[10px] text-indigo-400 hover:text-indigo-300">Profile</button>
              </div>
              {expanded === app.id && (
                <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-2">
                  {app.why_join && <p className="text-[11px] text-white/50">{app.why_join}</p>}
                  <div className="flex gap-2">
                    {app.status === "pending" && <button onClick={() => handleAction(app, "approve")} className="text-[10px] px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"><CheckCircle2 size={10} className="inline mr-1" />Approve</button>}
                    {app.status === "pending" && <button onClick={() => handleAction(app, "reject")} className="text-[10px] px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"><XCircle size={10} className="inline mr-1" />Reject</button>}
                    {app.status === "approved" && <button onClick={() => handleAction(app, "invite")} className="text-[10px] px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20"><Mail size={10} className="inline mr-1" />Invite</button>}
                    {app.status === "invited" && <button onClick={() => handleAction(app, "activate")} className="text-[10px] px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20"><CheckCircle2 size={10} className="inline mr-1" />Activate</button>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}