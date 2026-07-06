import React from "react";
import { useDeveloper } from "@/lib/DeveloperContext";
import { Code2 } from "lucide-react";

export default function DeveloperBadge() {
  const { developerMode, canAccessDeveloper } = useDeveloper();
  if (!canAccessDeveloper || !developerMode) return null;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/20">
      <Code2 size={10} className="text-indigo-400" />
      <span className="text-[10px] font-medium text-indigo-400 uppercase tracking-wider">Developer Mode</span>
    </div>
  );
}