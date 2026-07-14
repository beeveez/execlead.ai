import React from "react";
import { History, Download, TrendingUp } from "lucide-react";
import { PRIVACY_AUDIT_HISTORY } from "@/lib/privacyEngine";

export default function PrivacyAuditHistory() {
  return (
    <div className="space-y-6">
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History size={18} className="text-indigo-400" />
            <h3 className="text-white font-semibold text-sm">Privacy Audit History™</h3>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/60 transition-colors">
            <Download size={12} /> Export PDF
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-3 py-2 text-white/40 font-medium">Date</th>
                <th className="text-left px-3 py-2 text-white/40 font-medium">Auditor</th>
                <th className="text-center px-3 py-2 text-white/40 font-medium">Version</th>
                <th className="text-center px-3 py-2 text-white/40 font-medium">Score</th>
                <th className="text-center px-3 py-2 text-white/40 font-medium">Findings</th>
                <th className="text-center px-3 py-2 text-white/40 font-medium">Resolved</th>
                <th className="text-center px-3 py-2 text-white/40 font-medium">Open</th>
                <th className="text-center px-3 py-2 text-white/40 font-medium">Certification</th>
                <th className="text-center px-3 py-2 text-white/40 font-medium">Trend</th>
              </tr>
            </thead>
            <tbody>
              {PRIVACY_AUDIT_HISTORY.map((audit, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-3 py-3 text-white/50">{audit.date}</td>
                  <td className="px-3 py-3 text-white/50">{audit.auditor}</td>
                  <td className="px-3 py-3 text-center text-white/40">{audit.version}</td>
                  <td className="px-3 py-3 text-center">
                    <span className={audit.score >= 95 ? 'text-emerald-400' : 'text-amber-400'}>{audit.score}</span>
                  </td>
                  <td className="px-3 py-3 text-center text-white/40">{audit.findings}</td>
                  <td className="px-3 py-3 text-center text-emerald-400">{audit.resolved}</td>
                  <td className="px-3 py-3 text-center text-white/40">{audit.open}</td>
                  <td className="px-3 py-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400">{audit.certification}</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="text-emerald-400">↑</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-emerald-400" />
          <h3 className="text-white font-semibold text-sm">Score Trend</h3>
        </div>
        <div className="flex items-end justify-between gap-2 h-32">
          {PRIVACY_AUDIT_HISTORY.slice().reverse().map((audit) => (
            <div key={audit.date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-white/40">{audit.score}</span>
              <div className="w-full bg-emerald-500/20 rounded-t" style={{ height: `${audit.score}%` }} />
              <span className="text-[8px] text-white/30">{audit.date.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}