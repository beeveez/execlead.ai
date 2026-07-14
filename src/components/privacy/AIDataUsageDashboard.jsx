import React from "react";
import { Brain, Check, X, Info } from "lucide-react";
import { AI_DATA_USAGE } from "@/lib/privacyEngine";

export default function AIDataUsageDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Used For */}
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Check size={16} className="text-emerald-400" />
            <h3 className="text-white font-semibold text-sm">Your Data Is Used For</h3>
          </div>
          <div className="space-y-2">
            {AI_DATA_USAGE.used_for.map((item) => (
              <div key={item} className="flex items-center gap-2 px-3 py-2 bg-emerald-500/5 rounded-lg">
                <Check size={12} className="text-emerald-400" />
                <span className="text-white/70 text-xs">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Not Used For */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <X size={16} className="text-red-400" />
            <h3 className="text-white font-semibold text-sm">Not Used For</h3>
          </div>
          <div className="space-y-2">
            {AI_DATA_USAGE.not_used_for.map((item) => (
              <div key={item} className="flex items-center gap-2 px-3 py-2 bg-red-500/5 rounded-lg">
                <X size={12} className="text-red-400" />
                <span className="text-white/70 text-xs">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Purposes Detail */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={16} className="text-purple-400" />
          <h3 className="text-white font-semibold text-sm">AI Data Processing Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-3 py-2 text-white/40 font-medium">Data</th>
                <th className="text-left px-3 py-2 text-white/40 font-medium">Why We Collect</th>
                <th className="text-left px-3 py-2 text-white/40 font-medium">Retention</th>
                <th className="text-left px-3 py-2 text-white/40 font-medium">How to Delete</th>
                <th className="text-left px-3 py-2 text-white/40 font-medium">Lawful Basis</th>
              </tr>
            </thead>
            <tbody>
              {AI_DATA_USAGE.data_purposes.map((d) => (
                <tr key={d.data} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-3 py-3 text-white/70 font-medium">{d.data}</td>
                  <td className="px-3 py-3 text-white/50">{d.why}</td>
                  <td className="px-3 py-3 text-white/40">{d.retention}</td>
                  <td className="px-3 py-3 text-indigo-400">{d.deletion}</td>
                  <td className="px-3 py-3 text-white/40">{d.lawful_basis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-start gap-2 px-4 py-3 bg-indigo-500/5 border border-indigo-500/15 rounded-xl">
        <Info size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" />
        <p className="text-white/50 text-xs leading-relaxed">
          EXECLEAD.AI never sells user data, uses it for advertising, or shares it with third parties for marketing.
          All AI processing is consent-based and users can delete their data at any time.
        </p>
      </div>
    </div>
  );
}