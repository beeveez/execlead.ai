import React from "react";
import { useDeveloper } from "@/lib/DeveloperContext";
import { Code2 } from "lucide-react";

export default function DeveloperSwitch() {
  const { isSuperAdmin, developerMode, toggleDeveloperMode } = useDeveloper();
  if (!isSuperAdmin) return null;

  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] border border-white/5">
      <div className="flex items-center gap-2">
        <Code2 size={14} className={developerMode ? "text-indigo-400" : "text-white/30"} />
        <span className="text-xs font-medium text-white/60">Developer Mode</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-bold ${developerMode ? "text-indigo-400" : "text-white/30"}`}>
          {developerMode ? "ON" : "OFF"}
        </span>
        <button
          onClick={toggleDeveloperMode}
          className={`w-9 h-5 rounded-full transition-colors relative ${developerMode ? "bg-indigo-500" : "bg-white/10"}`}
        >
          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${developerMode ? "translate-x-4" : "translate-x-0.5"}`} />
        </button>
      </div>
    </div>
  );
}