import React from "react";
import { FileCheck, CheckCircle2 } from "lucide-react";
import { PRIVACY_EVIDENCE, EVIDENCE_STATUS_STYLES } from "@/lib/privacyEngine";

export default function PrivacyEvidenceRegistry() {
  return (
    <div className="space-y-6">
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileCheck size={18} className="text-emerald-400" />
            <h3 className="text-white font-semibold text-sm">Privacy Evidence Registry™</h3>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {PRIVACY_EVIDENCE.length} evidence items
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-3 py-2 text-white/40 font-medium">Evidence ID</th>
                <th className="text-left px-3 py-2 text-white/40 font-medium">Control</th>
                <th className="text-left px-3 py-2 text-white/40 font-medium">Source</th>
                <th className="text-left px-3 py-2 text-white/40 font-medium">Owner</th>
                <th className="text-center px-3 py-2 text-white/40 font-medium">Status</th>
                <th className="text-center px-3 py-2 text-white/40 font-medium">Version</th>
                <th className="text-left px-3 py-2 text-white/40 font-medium">Last Verified</th>
                <th className="text-left px-3 py-2 text-white/40 font-medium">Next Review</th>
              </tr>
            </thead>
            <tbody>
              {PRIVACY_EVIDENCE.map((ev) => {
                const style = EVIDENCE_STATUS_STYLES[ev.status] || EVIDENCE_STATUS_STYLES.pending;
                return (
                  <tr key={ev.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-3 py-3 text-white font-mono text-[10px]">{ev.id}</td>
                    <td className="px-3 py-3 text-white/70">{ev.control}</td>
                    <td className="px-3 py-3 text-white/40">{ev.source}</td>
                    <td className="px-3 py-3 text-white/40">{ev.owner}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${style.bg} ${style.color}`}>
                        <CheckCircle2 size={10} /> {style.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center text-white/40">v{ev.version}</td>
                    <td className="px-3 py-3 text-white/40">{ev.last_verified}</td>
                    <td className="px-3 py-3 text-white/40">{ev.next_review}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-3">Evidence Coverage</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {PRIVACY_EVIDENCE.map((ev) => (
            <div key={ev.id} className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] rounded-lg">
              <CheckCircle2 size={12} className="text-emerald-400 flex-shrink-0" />
              <span className="text-white/50 text-[10px] truncate">{ev.control}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}