import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, FileText } from "lucide-react";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.CompanyAuditLog.list("-created_date", 50)
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div>
        <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-widest mb-2">
          <FileText size={12} className="text-indigo-400" /> System
        </div>
        <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
      </div>
      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.02] text-white/40 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left p-3">Action</th>
              <th className="text-left p-3">Entity</th>
              <th className="text-left p-3">Performed By</th>
              <th className="text-left p-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-white/30">No audit logs found</td></tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} className="border-t border-white/5">
                  <td className="p-3"><span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-xs font-medium">{log.action}</span></td>
                  <td className="p-3 text-white/60">{log.entity_name || "—"}</td>
                  <td className="p-3 text-white/60">{log.performed_by_name || "—"}</td>
                  <td className="p-3 text-white/40 text-xs">{log.details || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}