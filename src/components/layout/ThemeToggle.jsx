import React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  const label = theme === "dark" ? "Executive Dark" : theme === "light" ? "Executive Light" : "System Theme";

  return (
    <button
      onClick={toggleTheme}
      title={`Theme: ${label} — click to switch`}
      aria-label={`Switch theme. Current: ${label}`}
      className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
    >
      <Icon size={16} className="text-white/40" />
    </button>
  );
}