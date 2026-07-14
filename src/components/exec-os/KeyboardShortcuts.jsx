/**
 * EXEC™ Operating System™ — Enterprise Keyboard Shortcuts™
 * ============================================================
 * Global keyboard shortcut handler. Also tracks workspace
 * navigation history on every route change.
 *
 * Shortcuts:
 *   Ctrl/Cmd + K        → Command Palette
 *   Ctrl/Cmd + P        → Print
 *   Ctrl/Cmd + Shift + P → Export PDF
 *   Ctrl/Cmd + /        → Shortcuts Help
 *   Alt + ←              → Back
 *   Alt + →              → Forward
 *   Esc                  → Close any overlay
 */

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Keyboard, X } from "lucide-react";
import { addToHistory } from "@/lib/execOS/workspaceHistory";

const SHORTCUTS = [
  { keys: ["Ctrl", "K"], label: "Command Palette", desc: "Search everything" },
  { keys: ["Ctrl", "P"], label: "Print Page", desc: "Print or save as PDF" },
  { keys: ["Ctrl", "Shift", "P"], label: "Export PDF Report", desc: "Generate executive report" },
  { keys: ["Ctrl", "/"], label: "Keyboard Shortcuts", desc: "View this help" },
  { keys: ["Alt", "←"], label: "Back", desc: "Navigate to previous page" },
  { keys: ["Alt", "→"], label: "Forward", desc: "Navigate to next page" },
  { keys: ["Esc"], label: "Close", desc: "Close any open overlay" },
];

export default function KeyboardShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showHelp, setShowHelp] = useState(false);

  // Track navigation history
  useEffect(() => {
    addToHistory(location.pathname);
  }, [location.pathname]);

  // Global keyboard handler
  useEffect(() => {
    const handler = (e) => {
      const cmd = e.metaKey || e.ctrlKey;

      // Ctrl/Cmd + K → Toggle command palette
      if (cmd && e.key.toLowerCase() === "k") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("exec:command-palette"));
        return;
      }

      // Ctrl/Cmd + P → Print (no Shift)
      if (cmd && e.key.toLowerCase() === "p" && !e.shiftKey) {
        e.preventDefault();
        window.print();
        return;
      }

      // Ctrl/Cmd + Shift + P → Export PDF
      if (cmd && e.shiftKey && (e.key === "P" || e.key === "p")) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("exec:export-pdf"));
        return;
      }

      // Ctrl/Cmd + / → Shortcuts help
      if (cmd && e.key === "/") {
        e.preventDefault();
        setShowHelp((s) => !s);
        return;
      }

      // Alt + ← → Back
      if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
        navigate(-1);
        return;
      }

      // Alt + → → Forward
      if (e.altKey && e.key === "ArrowRight") {
        e.preventDefault();
        navigate(1);
        return;
      }

      // Esc → Close overlays
      if (e.key === "Escape") {
        setShowHelp(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);

  // Listen for shortcuts help event
  useEffect(() => {
    const handler = () => setShowHelp((s) => !s);
    window.addEventListener("exec:shortcuts-help", handler);
    return () => window.removeEventListener("exec:shortcuts-help", handler);
  }, []);

  if (!showHelp) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowHelp(false)} />
      <div className="relative w-full max-w-lg bg-[#0d0d14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Keyboard size={18} className="text-indigo-400" />
            <h2 className="text-sm font-semibold text-white">Keyboard Shortcuts</h2>
          </div>
          <button onClick={() => setShowHelp(false)} className="text-white/30 hover:text-white/60 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-3 space-y-1">
          {SHORTCUTS.map((s, i) => (
            <div key={i} className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-white/5 transition-colors">
              <div>
                <div className="text-sm text-white/80">{s.label}</div>
                <div className="text-xs text-white/30">{s.desc}</div>
              </div>
              <div className="flex items-center gap-1">
                {s.keys.map((k, j) => (
                  <React.Fragment key={j}>
                    {j > 0 && <span className="text-white/20 text-xs">+</span>}
                    <kbd className="text-[10px] text-white/50 bg-white/5 border border-white/10 px-2 py-1 rounded font-mono">{k}</kbd>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t border-white/5 text-center text-[10px] text-white/20">
          EXEC™ Operating System™ — Universal Keyboard Navigation
        </div>
      </div>
    </div>
  );
}