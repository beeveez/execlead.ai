import React from "react";
import { History } from "lucide-react";

export default function PreviousSessions() {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <History size={14} className="text-cyan-400" />
        <h3 className="text-sm font-semibold text-white/80">Previous Sessions</h3>
      </div>
      <p className="text-xs text-white/30 text-center py-4">Your coaching session history will appear here.</p>
    </div>
  );
}