import React from "react";
import { Sparkles } from "lucide-react";

const sizes = {
  sm: { frame: "w-8 h-8", icon: 16 },
  md: { frame: "w-10 h-10", icon: 20 },
};

export default function ExecConciergeBadge({ size = "sm", className = "" }) {
  const config = sizes[size] || sizes.sm;
  return (
    <span
      aria-hidden="true"
      className={`${config.frame} rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm flex items-center justify-center flex-shrink-0 ${className}`}
    >
      <Sparkles size={config.icon} className="text-white" />
    </span>
  );
}