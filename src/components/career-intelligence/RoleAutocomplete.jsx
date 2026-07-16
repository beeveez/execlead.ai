import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, Check, X, Briefcase, Star, Clock } from "lucide-react";
import { searchRoles, getRoleByTitle } from "@/lib/careerIntelligence/roleRegistry";
import { cn } from "@/lib/utils";

export default function RoleAutocomplete({ value, onChange, placeholder = "Search roles..." }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const selected = useMemo(() => getRoleByTitle(value), [value]);
  const results = useMemo(() => searchRoles(query, 10), [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector(`[data-idx="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const selectRole = (role) => {
    onChange?.(role.title);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[activeIndex]) selectRole(results[activeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm transition-all",
          open ? "ring-1 ring-indigo-500/50" : "hover:border-white/20",
          selected ? "text-white/90" : "text-white/20"
        )}
      >
        {selected ? (
          <>
            <Briefcase size={14} className="text-indigo-400 flex-shrink-0" />
            <div className="flex-1 text-left min-w-0">
              <div className="truncate font-medium">{selected.title}</div>
              <div className="text-[10px] text-white/30 truncate">{selected.executive_level} • {selected.job_family}</div>
            </div>
          </>
        ) : (
          <>
            <Briefcase size={14} className="text-white/30 flex-shrink-0" />
            <span className="flex-1 text-left">{placeholder}</span>
          </>
        )}
      </button>

      {selected && !open && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onChange?.(""); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
        >
          <X size={14} />
        </button>
      )}

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-[#0d0d14] border border-white/10 rounded-lg shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-white/5">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
                onKeyDown={handleKeyDown}
                placeholder="Search by title, family, competency..."
                className="w-full bg-white/5 border border-white/10 rounded-md pl-8 pr-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              />
            </div>
          </div>
          <div ref={listRef} className="max-h-72 overflow-y-auto py-1">
            {results.length === 0 ? (
              <div className="px-3 py-6 text-center text-white/30 text-sm">No roles found</div>
            ) : (
              results.map((role, idx) => {
                const isActive = idx === activeIndex;
                const isSelected = selected?.id === role.id;
                return (
                  <button
                    type="button"
                    key={role.id}
                    data-idx={idx}
                    onClick={() => selectRole(role)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={cn(
                      "w-full flex items-start gap-2.5 px-3 py-2.5 text-left transition-colors",
                      isActive ? "bg-indigo-500/15" : "hover:bg-white/5"
                    )}
                  >
                    <Briefcase size={14} className={cn("flex-shrink-0 mt-0.5", isActive ? "text-indigo-400" : "text-white/30")} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-white/90 truncate">{role.title}</span>
                        {isSelected && <Check size={12} className="text-indigo-400 flex-shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-white/40">
                        <span>{role.executive_level}</span>
                        <span>•</span>
                        <span className="truncate">{role.job_family}</span>
                      </div>
                      <div className="text-[10px] text-white/30 mt-0.5 truncate">
                        {role.competencies.slice(0, 3).join(" • ")}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}