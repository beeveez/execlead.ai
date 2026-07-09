import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2, Plus, Edit, Send, Bot, Check, X, MessageSquare, Globe,
  Archive, RotateCcw, Star, Trash2, Flag, UserCheck, FileText,
  Shield, Clock
} from "lucide-react";

const ACTION_CONFIG = {
  created: { icon: Plus, color: "text-indigo-400", label: "Created" },
  updated: { icon: Edit, color: "text-blue-400", label: "Updated" },
  submitted: { icon: Send, color: "text-purple-400", label: "Submitted" },
  ai_reviewed: { icon: Bot, color: "text-purple-400", label: "AI Reviewed" },
  assigned_reviewer: { icon: UserCheck, color: "text-indigo-400", label: "Reviewer Assigned" },
  approved: { icon: Check, color: "text-emerald-400", label: "Approved" },
  rejected: { icon: X, color: "text-red-400", label: "Rejected" },
  revision_requested: { icon: MessageSquare, color: "text-blue-400", label: "Revision Requested" },
  published: { icon: Globe, color: "text-emerald-400", label: "Published" },
  archived: { icon: Archive, color: "text-white/40", label: "Archived" },
  restored: { icon: RotateCcw, color: "text-amber-400", label: "Restored" },
  featured: { icon: Star, color: "text-amber-400", label: "Featured" },
  unfeatured: { icon: Star, color: "text-white/30", label: "Unfeatured" },
  deleted: { icon: Trash2, color: "text-red-400", label: "Deleted" },
  report_filed: { icon: Flag, color: "text-red-400", label: "Report Filed" },
  report_resolved: { icon: Check, color: "text-emerald-400", label: "Report Resolved" },
  checklist_saved: { icon: FileText, color: "text-white/40", label: "Checklist Saved" },
  notes_saved: { icon: FileText, color: "text-white/40", label: "Notes Saved" },
};

export default function AuditLogPanel({ letterId }) {
  const { toast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadLogs(); }, [letterId]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const payload = { action: "audit_log" };
      if (letterId) payload.letter_id = letterId;
      const res = await base44.functions.invoke("manageLegacyLibrary", payload);
      const d = res.data || res;
      setLogs(d.logs || []);
    } catch (e) { toast({ title: "Failed to load audit log", variant: "destructive" }); }
    setLoading(false);
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  }

  if (logs.length === 0) {
    return <div className="text-center py-16"><FileText size={28} className="text-indigo-400/30 mx-auto mb-3" /><p className="text-white/30 text-sm">No audit log entries.</p></div>;
  }

  return (
    <div className="space-y-2">
      {!letterId && (
        <div className="flex items-center gap-2 text-white/40 text-xs mb-3">
          <Shield size={12} className="text-indigo-400" /> Showing latest {logs.length} actions
        </div>
      )}
      {logs.map((log) => {
        const config = ACTION_CONFIG[log.action] || { icon: FileText, color: "text-white/40", label: log.action };
        const Icon = config.icon;
        const details = (() => { try { return JSON.parse(log.details_json); } catch { return {}; } })();

        return (
          <div key={log.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-3 flex items-start gap-3">
            <div className={`w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0`}>
              <Icon size={13} className={config.color} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
                {log.letter_title && (log.letter_id ? (
                  <Link to={`/legacy-library/${log.letter_id}`} className="text-white/60 text-sm hover:text-indigo-400 truncate">{log.letter_title}</Link>
                ) : (
                  <span className="text-white/60 text-sm truncate">{log.letter_title}</span>
                ))}
                {log.previous_status && log.new_status && (
                  <span className="text-white/30 text-[10px]">{log.previous_status} → {log.new_status}</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-white/30 text-[10px] mt-0.5">
                <span>{log.user_name || "Unknown"}</span>
                <span>·</span>
                <span className="flex items-center gap-0.5"><Clock size={9} /> {log.timestamp && new Date(log.timestamp).toLocaleString()}</span>
                {log.user_role && <><span>·</span><span className="capitalize">{log.user_role}</span></>}
              </div>
              {details && Object.keys(details).length > 0 && (
                <p className="text-white/30 text-[10px] mt-1">
                  {Object.entries(details).filter(([k]) => k !== 'fields').map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`).join(' · ')}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}