import React from "react";
import { Lightbulb } from "lucide-react";

export default function SavedInsights() {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb size={14} className="text-amber-400" />
        <h3 className="text-sm font-semibold text-white/80">Saved Insights</h3>
      </div>
      <p className="text-xs text-white/30 text-center py-4">Insights from your coaching conversations will appear here.</p>
    </div>
  );
}