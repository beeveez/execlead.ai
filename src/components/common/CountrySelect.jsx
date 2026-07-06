import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { COUNTRIES, PINNED_COUNTRIES, getCountryByName, getCountryByCode } from "@/lib/locations";
import { cn } from "@/lib/utils";

export default function CountrySelect({
  value,
  onChange,
  onCountryChange,
  placeholder = "Select country...",
  className = "",
  showDialCode = false,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const selected = useMemo(() => getCountryByName(value) || getCountryByCode(value), [value]);

  const { pinned, rest, all } = useMemo(() => {
    const q = query.toLowerCase().trim();
    const matches = COUNTRIES.filter(
      (c) => !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.dialCode.includes(q)
    );
    const p = matches.filter((c) => PINNED_COUNTRIES.includes(c.code));
    p.sort((a, b) => PINNED_COUNTRIES.indexOf(a.code) - PINNED_COUNTRIES.indexOf(b.code));
    const r = matches.filter((c) => !PINNED_COUNTRIES.includes(c.code));
    r.sort((a, b) => a.name.localeCompare(b.name));
    return { pinned: p, rest: r, all: [...p, ...r] };
  }, [query]);

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

  const selectCountry = (country) => {
    onChange?.(country.name);
    onCountryChange?.(country);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, all.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (all[activeIndex]) selectCountry(all[activeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  const renderOption = (country, idx) => {
    const isActive = idx === activeIndex;
    const isSelected = selected?.code === country.code;
    return (
      <button
        type="button"
        key={country.code}
        data-idx={idx}
        onClick={() => selectCountry(country)}
        onMouseEnter={() => setActiveIndex(idx)}
        className={cn(
          "w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors",
          isActive ? "bg-indigo-500/15 text-white" : "text-white/60 hover:bg-white/5"
        )}
      >
        <span className="text-base leading-none flex-shrink-0">{country.flag}</span>
        <span className="flex-1 truncate">{country.name}</span>
        {showDialCode && country.dialCode && <span className="text-white/30 text-xs">{country.dialCode}</span>}
        {isSelected && <Check size={14} className="text-indigo-400 flex-shrink-0" />}
      </button>
    );
  };

  let runningIndex = 0;

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm transition-all",
          open ? "ring-1 ring-indigo-500/50" : "hover:border-white/20",
          selected ? "text-white/90" : "text-white/20"
        )}
      >
        {selected ? (
          <>
            <span className="text-base leading-none flex-shrink-0">{selected.flag}</span>
            <span className="flex-1 text-left truncate">{selected.name}</span>
          </>
        ) : (
          <span className="flex-1 text-left">{placeholder}</span>
        )}
        <ChevronDown size={14} className={cn("text-white/30 flex-shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-[#0d0d14] border border-white/10 rounded-lg shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-white/5">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search countries..."
                className="w-full bg-white/5 border border-white/10 rounded-md pl-8 pr-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              />
            </div>
          </div>
          <div ref={listRef} className="max-h-60 overflow-y-auto py-1">
            {all.length === 0 ? (
              <div className="px-3 py-6 text-center text-white/30 text-sm">No countries found</div>
            ) : (
              <>
                {pinned.length > 0 && (
                  <>
                    {pinned.map((c) => renderOption(c, runningIndex++))}
                    {rest.length > 0 && <div className="my-1 border-t border-white/5" />}
                  </>
                )}
                {rest.map((c) => renderOption(c, runningIndex++))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}