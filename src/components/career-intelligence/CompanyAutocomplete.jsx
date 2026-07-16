import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, X, Building2, MapPin, Users, Check, Compass } from "lucide-react";
import {
  searchCompanies,
  getCompanyByName,
  getPopularCompanies,
  browseCompanies,
} from "@/lib/careerIntelligence/companyRegistry";
import { cn } from "@/lib/utils";

export default function CompanyAutocomplete({
  value,
  onChange,
  placeholder = "Search target company...",
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [browseAll, setBrowseAll] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const selected = useMemo(() => getCompanyByName(value), [value]);
  const popular = useMemo(() => getPopularCompanies(8), []);

  // Results: only compute when query >= 2 chars, or when "Browse" is active.
  const results = useMemo(() => {
    if (browseAll) return browseCompanies(10);
    if (query.trim().length < 2) return [];
    return searchCompanies(query, 10);
  }, [query, browseAll]);

  // Reset keyboard index whenever the result set changes.
  useEffect(() => setActiveIndex(0), [query, browseAll]);

  // Close on outside click.
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setBrowseAll(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Scroll active item into view during keyboard navigation.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector(`[data-idx="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const openDropdown = () => {
    setOpen(true);
    setQuery("");
    setBrowseAll(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const selectCompany = (company) => {
    onChange?.(company.name);
    setOpen(false);
    setBrowseAll(false);
    setQuery("");
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    onChange?.("");
    openDropdown();
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[activeIndex]) selectCompany(results[activeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setBrowseAll(false);
    }
  };

  const showResults = results.length > 0;
  const showEmpty = !showResults && query.trim().length >= 2 && !browseAll;
  const showPopular = !showResults && !showEmpty;

  return (
    <div ref={containerRef} className="relative">
      {/* ── Selected display ── */}
      {selected && !open ? (
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm">
          <span className="text-lg leading-none flex-shrink-0">{selected.logo}</span>
          <div className="flex-1 min-w-0">
            <div className="truncate font-medium text-white/90">{selected.name}</div>
            <div className="text-[10px] text-white/30 truncate">
              {selected.industry} • {selected.country}
            </div>
          </div>
          {selected.company_intelligence_available && (
            <span className="flex-shrink-0 text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              CI™
            </span>
          )}
          <button
            type="button"
            onClick={clearSelection}
            className="flex-shrink-0 p-1 rounded text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        /* ── Search input (single — no duplicate) ── */
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
          />
          <input
            ref={inputRef}
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setBrowseAll(false);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
          />
          {open && (
            <button
              type="button"
              onClick={() => { setOpen(false); setBrowseAll(false); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-white/30 hover:text-white/70 hover:bg-white/5 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* ── Dropdown ── */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-[#0d0d14] border border-white/10 rounded-lg shadow-2xl overflow-hidden">
          <div ref={listRef} className="max-h-80 overflow-y-auto py-1">
            {/* Search results */}
            {showResults &&
              results.map((company, idx) => {
                const isActive = idx === activeIndex;
                const isSelected = selected?.id === company.id;
                return (
                  <button
                    type="button"
                    key={company.id}
                    data-idx={idx}
                    onClick={() => selectCompany(company)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={cn(
                      "w-full flex items-start gap-2.5 px-3 py-2.5 text-left transition-colors",
                      isActive ? "bg-indigo-500/15" : "hover:bg-white/5"
                    )}
                  >
                    <span className="text-lg leading-none flex-shrink-0 mt-0.5">
                      {company.logo}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-white/90 truncate">
                          {company.name}
                        </span>
                        {company.company_intelligence_available && (
                          <span className="text-[8px] px-1 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0">
                            CI™
                          </span>
                        )}
                        {isSelected && (
                          <Check size={12} className="text-indigo-400 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-white/40">
                        <span className="truncate">{company.industry}</span>
                        <span className="flex items-center gap-0.5">
                          <MapPin size={9} />
                          {company.country}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-white/30">
                        <span className="flex items-center gap-0.5">
                          <Users size={9} />
                          {company.employee_size}
                        </span>
                        {company.fortune_ranking && (
                          <span>Fortune {company.fortune_ranking}</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}

            {/* No results */}
            {showEmpty && (
              <div className="px-3 py-8 text-center">
                <Search size={20} className="mx-auto mb-2 text-white/20" />
                <p className="text-sm text-white/40">No matching companies found.</p>
                <p className="text-[10px] text-white/20 mt-1">
                  Try searching by name, industry, country, or technology.
                </p>
              </div>
            )}

            {/* Popular companies (empty state) */}
            {showPopular && (
              <div className="p-3">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Compass size={11} className="text-white/30" />
                  <span className="text-[10px] uppercase tracking-wider text-white/30">
                    Popular Companies
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {popular.map((company) => (
                    <button
                      type="button"
                      key={company.id}
                      onClick={() => selectCompany(company)}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white/[0.02] hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all text-left"
                    >
                      <span className="text-base leading-none flex-shrink-0">
                        {company.logo}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-white/80 truncate">
                          {company.name}
                        </div>
                        <div className="text-[9px] text-white/30 truncate">
                          {company.industry}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setBrowseAll(true)}
                  className="w-full mt-2.5 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/50 hover:text-white/70 transition-colors"
                >
                  <Building2 size={12} />
                  Browse All Companies
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}