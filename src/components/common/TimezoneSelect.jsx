import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, Check, Locate } from "lucide-react";
import { IANA_TIMEZONES, getCity, getRegion, getTimezoneFlag, getOffsetLabel, detectBrowserTimezone, getTimezonesForCountry } from "@/lib/timezones";
import { cn } from "@/lib/utils";

/**
 * Reusable IANA Time Zone selector.
 * - Searchable with keyboard navigation
 * - Auto-detects browser timezone
 * - Filters by country when `country` prop is provided
 * - Displays flag, city, and UTC offset (DST-aware)
 */
export default function TimezoneSelect({
  value,
  onChange,
  country,
  placeholder = "Select time zone...",
  className = "",
  showDetect = true,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const countryTzs = useMemo(() => (country ? getTimezonesForCountry(country) : []), [country]);

  const { countryTzList, otherTzList, all } = useMemo(() => {
    const q = query.toLowerCase().trim();
    const matches = IANA_TIMEZONES.filter((tz) => {
      if (q) {
        return tz.toLowerCase().includes(q) || getCity(tz).toLowerCase().includes(q) || getRegion(tz).toLowerCase().includes(q);
      }
      return true;
    });

    const cList = countryTzs.length > 0 ? matches.filter((tz) => countryTzs.includes(tz)) : [];
    const oList = countryTzs.length > 0 ? matches.filter((tz) => !countryTzs.includes(tz)) : matches;
    oList.sort((a, b) => getCity(a).localeCompare(getCity(b)));

    return { countryTzList: cList, otherTzList: oList, all: [...cList, ...oList] };
  }, [query, countryTzs]);

  useEffect(() => {
    if (open) {
      setQuery("");
      const currentIdx = value ? all.indexOf(value) : 0;
      setActiveIndex(currentIdx >= 0 ? currentIdx : 0);
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

  const selectTz = (tz) => {
    onChange?.(tz);
    setOpen(false);
  };

  const handleDetect = () => {
    const detected = detectBrowserTimezone();
    onChange?.(detected);
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
      if (all[activeIndex]) selectTz(all[activeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  const renderOption = (tz, idx) => {
    const isActive = idx === activeIndex;
    const isSelected = value === tz;
    return (
      <button
        type="button"
        key={tz}
        data-idx={idx}
        onClick={() => selectTz(tz)}
        onMouseEnter={() => setActiveIndex(idx)}
        className={cn(
          "w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors",
          isActive ? "bg-indigo-500/15 text-white" : "text-white/60 hover:bg-white/5"
        )}
      >
        <span className="text-base leading-none flex-shrink-0">{getTimezoneFlag(tz)}</span>
        <span className="flex-1 truncate">{getCity(tz)}</span>
        <span className="text-white/30 text-xs flex-shrink-0">{tz}</span>
        <span className="text-white/40 text-xs font-mono flex-shrink-0 w-20 text-right">{getOffsetLabel(tz)}</span>
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
          value ? "text-white/90" : "text-white/20"
        )}
      >
        {value ? (
          <>
            <span className="text-base leading-none flex-shrink-0">{getTimezoneFlag(value)}</span>
            <span className="flex-1 text-left truncate">{getCity(value)}</span>
            <span className="text-white/30 text-xs font-mono flex-shrink-0">{getOffsetLabel(value)}</span>
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
                placeholder="Search time zones..."
                className="w-full bg-white/5 border border-white/10 rounded-md pl-8 pr-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              />
            </div>
            {showDetect && (
              <button
                type="button"
                onClick={handleDetect}
                className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium transition-colors"
              >
                <Locate size={12} /> Detect my time zone
              </button>
            )}
          </div>
          <div ref={listRef} className="max-h-64 overflow-y-auto py-1">
            {all.length === 0 ? (
              <div className="px-3 py-6 text-center text-white/30 text-sm">No time zones found</div>
            ) : (
              <>
                {countryTzList.length > 0 && (
                  <>
                    <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/20">
                      {country}
                    </div>
                    {countryTzList.map((tz) => renderOption(tz, runningIndex++))}
                    {otherTzList.length > 0 && <div className="my-1 border-t border-white/5" />}
                  </>
                )}
                {otherTzList.length > 0 && countryTzList.length > 0 && (
                  <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/20">
                    All Time Zones
                  </div>
                )}
                {otherTzList.map((tz) => renderOption(tz, runningIndex++))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}