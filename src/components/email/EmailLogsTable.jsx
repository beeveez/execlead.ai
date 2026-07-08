import React from "react";
import { CheckCircle, XCircle, AlertTriangle, MailOpen, MousePointerClick, RotateCw, Ban, Inbox, Send } from "lucide-react";

const STATUS_META = {
  queued: { icon: Inbox, color: "text-slate-400", bg: "bg-slate-500/10" },
  sending: { icon: Send, color: "text-blue-400", bg: "bg-blue-500/10" },
  delivered: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  sent: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  opened: { icon: MailOpen, color: "text-cyan-400", bg: "bg-cyan-500/10" },
  clicked: { icon: MousePointerClick, color: "text-teal-400", bg: "bg-teal-500/10" },
  bounced: { icon: AlertTriangle, color: "text-orange-400", bg: "bg-orange-500/10" },
  spam: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
  failed: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
  retry: { icon: RotateCw, color: "text-amber-400", bg: "bg-amber-500/10" },
  cancelled: { icon: Ban, color: "text-white/40", bg: "bg-white/5" },
  not_configured: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10" },
};

export default function EmailLogsTable({ events }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
      <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">Delivery Logs</h3>
      {events.length === 0 ? (
        <p className="text-white/30 text-sm text-center py-8">No email events yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left px-3 py-2 text-xs text-white/40 uppercase">Recipient</th>
                <th className="text-left px-3 py-2 text-xs text-white/40 uppercase">Template</th>
                <th className="text-left px-3 py-2 text-xs text-white/40 uppercase">Provider</th>
                <th className="text-left px-3 py-2 text-xs text-white/40 uppercase">Status</th>
                <th className="text-left px-3 py-2 text-xs text-white/40 uppercase">Timestamp</th>
                <th className="text-left px-3 py-2 text-xs text-white/40 uppercase">Provider Response</th>
                <th className="text-left px-3 py-2 text-xs text-white/40 uppercase">Retries</th>
              </tr>
            </thead>
            <tbody>
              {events.map(evt => {
                const meta = STATUS_META[evt.delivery_status] || STATUS_META.failed;
                return (
                  <tr key={evt.id} className="border-t border-white/5">
                    <td className="px-3 py-2 text-white/60">{evt.recipient}</td>
                    <td className="px-3 py-2 text-white/50">{evt.template || evt.email_type || "—"}</td>
                    <td className="px-3 py-2 text-white/50 capitalize">{evt.provider || "—"}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${meta.bg} ${meta.color}`}>
                        <meta.icon size={10} /> {evt.delivery_status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-white/30 text-xs">{new Date(evt.created_date).toLocaleString()}</td>
                    <td className="px-3 py-2 text-white/40 text-xs max-w-xs truncate">{evt.provider_response || evt.error_message || "—"}</td>
                    <td className="px-3 py-2 text-white/40 text-xs">{evt.retry_count || 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}