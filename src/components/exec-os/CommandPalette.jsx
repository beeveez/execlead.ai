/**
 * EXEC™ Operating System™ — Universal Command Palette™
 * ============================================================
 * Global Ctrl+K palette that searches every page, module, and
 * command across all workspaces. Navigates using the Universal
 * Workspace Router™ — no workspace switch dialogs, ever.
 */

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, CornerDownLeft, ArrowUp, ArrowDown, Command as CommandIcon, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useUniversalRouter, storeGovernanceContext } from "@/lib/universalRouter";
import { searchCommands, getRecentCommands } from "@/lib/execOS/commandRegistry";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const { navigateTo } = useUniversalRouter();

  // Listen for toggle event from KeyboardShortcuts
  useEffect(() => {
    const handler = () => setOpen((o) => !o);
    window.addEventListener("exec:command-palette", handler);
    return () => window.removeEventListener("exec:command-palette", handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const results = useMemo(() => {
    if (query.trim()) return searchCommands(query);
    return [];
  }, [query]);

  const recent = useMemo(() => {
    if (query.trim()) return [];
    return getRecentCommands(6);
  }, [query, open]);

  const displayItems = query.trim() ? results : recent;
  const listLabel = query.trim() ? "Results" : "Recent";

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-idx="${selectedIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const handleSelect = (item) => {
    setOpen(false);
    if (!item) return;
    if (item.type === "navigation") {
      storeGovernanceContext({ id: item.id, name: item.title, route: item.path });
      navigateTo(item.path, { state: { fromCommandPalette: true } });
    } else if (item.type === "command") {
      handleCommand(item.action);
    }
  };

  const handleCommand = (action) => {
    switch (action) {
      case "print":
        window.print();
        break;
      case "export-pdf":
        window.dispatchEvent(new CustomEvent("exec:export-pdf"));
        break;
      case "toggle-theme":
        window.dispatchEvent(new CustomEvent("exec:toggle-theme"));
        break;
      case "shortcuts":
        window.dispatchEvent(new CustomEvent("exec:shortcuts-help"));
        break;
      case "signout":
        base44.auth.logout("/login");
        break;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, displayItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(displayItems[selectedIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-2xl bg-[#0d0d14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
          <Search size={18} className="text-white/30 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, modules, commands…"
            className="flex-1 bg-transparent text-white placeholder:text-white/30 text-sm outline-none"
          />
          <kbd className="text-[10px] text-white/20 border border-white/10 px-1.5 py-0.5 rounded font-mono">ESC</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[400px] overflow-y-auto p-2">
          {displayItems.length === 0 && (
            <div className="text-center py-10 text-white/30 text-sm">
              {query.trim() ? `No results for "${query}"` : "Start typing to search the platform…"}
            </div>
          )}
          {displayItems.length > 0 && (
            <div className="px-2 py-1 text-[10px] text-white/20 uppercase tracking-widest flex items-center gap-1">
              {listLabel === "Recent" && <Clock size={10} />}
              {listLabel}
            </div>
          )}
          {displayItems.map((item, i) => (
            <button
              key={item.id}
              data-idx={i}
              onClick={() => handleSelect(item)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                i === selectedIndex ? "bg-indigo-500/10" : "hover:bg-white/5"
              }`}
            >
              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                {item.icon ? <item.icon size={14} className="text-white/50" /> : <CommandIcon size={14} className="text-white/50" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white/80 truncate">{item.title}</div>
                {item.subtitle && <div className="text-xs text-white/30 truncate">{item.subtitle}</div>}
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {item.workspaceLabel && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: (item.workspaceColor || "#6366f1") + "20", color: item.workspaceColor || "#6366f1" }}
                  >
                    {item.workspaceLabel}
                  </span>
                )}
                <span className="text-[10px] text-white/20">{item.category}</span>
                {i === selectedIndex && <CornerDownLeft size={12} className="text-white/20" />}
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-white/5 flex items-center gap-4 text-[10px] text-white/20">
          <span className="flex items-center gap-1"><ArrowUp size={10} /><ArrowDown size={10} /> Navigate</span>
          <span className="flex items-center gap-1"><CornerDownLeft size={10} /> Open</span>
          <span className="flex items-center gap-1"><CommandIcon size={10} />K Toggle</span>
          <span className="ml-auto">EXEC™ Operating System™</span>
        </div>
      </div>
    </div>
  );
}