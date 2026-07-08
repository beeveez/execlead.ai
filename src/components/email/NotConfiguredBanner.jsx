import React from "react";
import { AlertTriangle, Settings } from "lucide-react";

export default function NotConfiguredBanner({ onConfigure }) {
  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
          <AlertTriangle size={20} className="text-amber-400" />
        </div>
        <div className="flex-1">
          <div className="text-amber-400 font-medium text-sm">Email Provider Not Configured</div>
          <div className="text-white/40 text-sm mt-1">
            No emails will be sent until a provider is configured and activated. Proposals and notifications will be saved, but no confirmation emails will be delivered.
          </div>
          <div className="mt-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <div className="text-white/50 text-xs font-medium mb-1">Suggested Fix:</div>
            <div className="text-white/40 text-xs">Configure an Email Provider with a valid API key, from email, and activate it.</div>
          </div>
          {onConfigure && (
            <button
              onClick={onConfigure}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Settings size={14} /> Configure Provider
            </button>
          )}
        </div>
      </div>
    </div>
  );
}